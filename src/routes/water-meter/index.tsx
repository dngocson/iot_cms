import { createFileRoute } from "@tanstack/react-router";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
	iconUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export const Route = createFileRoute("/water-meter/")({
	component: RouteComponent,
});

// ⚠️ TODO (security): key này đang lộ ở client, ai mở DevTools cũng lấy được.
// Nên chuyển các call ORS qua 1 backend proxy nhỏ, giữ key ở server.
const ORS_API_KEY =
	"eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjQzNGY4ZGUxZmQzMDQ3MjI5OGU0NDg3ZGFjOTllZjM0IiwiaCI6Im11cm11cjY0In0=";
const ORS_URL =
	"https://api.openrouteservice.org/v2/directions/driving-car/geojson";

interface Waypoint {
	lat: number;
	lng: number;
}

interface RouteInfo {
	totalDistance: number;
	totalTime: number;
	coordinates: L.LatLng[];
}

interface NavigationConfig {
	rerouteDistanceThreshold: number; // meters
	rerouteCooldownMs: number; // milliseconds
	gpsUpdateIntervalMs: number; // milliseconds
}

const DEFAULT_CONFIG: NavigationConfig = {
	rerouteDistanceThreshold: 50, // 50 meters
	rerouteCooldownMs: 30000, // 30 seconds
	gpsUpdateIntervalMs: 1000, // 1 second
};

// ============================================================
// RouteManager - gọi ORS API và cache kết quả route hiện tại
// ============================================================
class RouteManager {
	private currentRoute: RouteInfo | null = null;
	private isCalculating = false;
	private abortController: AbortController | null = null;

	async calculateRoute(waypoints: Waypoint[]): Promise<RouteInfo | null> {
		// Hủy request đang chờ (nếu có) trước khi gọi request mới
		this.cancelPending();

		if (waypoints.length < 2) {
			return null;
		}

		this.isCalculating = true;
		this.abortController = new AbortController();

		try {
			const response = await fetch(ORS_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: ORS_API_KEY,
				},
				body: JSON.stringify({
					coordinates: waypoints.map((wp) => [wp.lng, wp.lat]),
				}),
				signal: this.abortController.signal,
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const data = await response.json();
			const feature = data.features?.[0];

			if (!feature) {
				throw new Error("No route in response");
			}

			const coordinates: L.LatLng[] = feature.geometry.coordinates.map(
				([lng, lat]: [number, number]) => L.latLng(lat, lng),
			);

			const { distance, duration } = feature.properties.summary;

			this.currentRoute = {
				totalDistance: distance,
				totalTime: duration,
				coordinates,
			};

			return this.currentRoute;
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				console.log("Route calculation cancelled");
				return null;
			}
			throw error;
		} finally {
			this.isCalculating = false;
			this.abortController = null;
		}
	}

	getCurrentRoute(): RouteInfo | null {
		return this.currentRoute;
	}

	clearRoute(): void {
		this.currentRoute = null;
	}

	cancelPending(): void {
		if (this.abortController) {
			this.abortController.abort();
			this.abortController = null;
		}
	}

	isRouteCalculating(): boolean {
		return this.isCalculating;
	}
}

// ============================================================
// VehicleMarker - marker vị trí GPS hiện tại, reuse marker cũ
// ============================================================
class VehicleMarker {
	private marker: L.Marker | null = null;
	private map: L.Map;
	private currentPosition: L.LatLng | null = null;

	constructor(map: L.Map) {
		this.map = map;
	}

	updatePosition(latLng: L.LatLng): void {
		this.currentPosition = latLng;

		if (!this.marker) {
			const vehicleIcon = L.divIcon({
				className: "vehicle-marker",
				html: '<div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
				iconSize: [20, 20],
				iconAnchor: [10, 10],
			});

			this.marker = L.marker(latLng, { icon: vehicleIcon }).addTo(this.map);
		} else {
			this.marker.setLatLng(latLng);
		}
	}

	getPosition(): L.LatLng | null {
		return this.currentPosition;
	}

	setVisible(visible: boolean): void {
		if (this.marker) {
			if (visible) {
				this.marker.addTo(this.map);
			} else {
				this.marker.remove();
			}
		}
	}

	remove(): void {
		if (this.marker) {
			this.marker.remove();
			this.marker = null;
		}
		this.currentPosition = null;
	}
}

// ============================================================
// NavigationManager - điều phối route + reroute + vẽ lên map
// ============================================================
class NavigationManager {
	private routeManager: RouteManager;
	private vehicleMarker: VehicleMarker;
	private config: NavigationConfig;
	private lastRerouteTime = 0;
	private map: L.Map;
	private routePolyline: L.Polyline | null = null;
	private waypointMarkers: L.Marker[] = [];
	private pendingReroute: ReturnType<typeof setTimeout> | null = null;

	constructor(map: L.Map, config: NavigationConfig = DEFAULT_CONFIG) {
		this.map = map;
		this.config = config;
		this.routeManager = new RouteManager();
		this.vehicleMarker = new VehicleMarker(map);
	}

	async setDestination(
		waypoints: Waypoint[],
		onRouteFound?: (info: RouteInfo) => void,
		onError?: (msg: string) => void,
	): Promise<void> {
		this.clearRouteVisualization();

		waypoints.forEach((wp, index) => {
			const isStart = index === 0;
			const isEnd = index === waypoints.length - 1;

			const marker = L.marker([wp.lat, wp.lng], {
				icon: L.divIcon({
					className: "waypoint-marker",
					html: `<div style="background: ${isStart ? "#22c55e" : isEnd ? "#ef4444" : "#f59e0b"}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${isStart ? "A" : isEnd ? "B" : index}</div>`,
					iconSize: [24, 24],
					iconAnchor: [12, 12],
				}),
			}).addTo(this.map);

			this.waypointMarkers.push(marker);
		});

		try {
			const route = await this.routeManager.calculateRoute(waypoints);

			if (route) {
				this.drawRoute(route);
				onRouteFound?.(route);
				this.lastRerouteTime = Date.now();
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : "Routing failed";
			console.error("Routing error:", error);
			onError?.(message);
		}
	}

	handleGPSUpdate(
		position: L.LatLng,
		waypoints: Waypoint[],
		onReroute?: (info: RouteInfo) => void,
		onError?: (msg: string) => void,
	): void {
		this.vehicleMarker.updatePosition(position);

		if (this.shouldReroute(position)) {
			this.scheduleReroute(waypoints, onReroute, onError);
		}
	}

	private shouldReroute(currentPos: L.LatLng): boolean {
		const route = this.routeManager.getCurrentRoute();

		if (!route || route.coordinates.length === 0) {
			return false;
		}

		const now = Date.now();
		if (now - this.lastRerouteTime < this.config.rerouteCooldownMs) {
			return false;
		}

		if (this.routeManager.isRouteCalculating()) {
			return false;
		}

		const closestPoint = this.findClosestPointOnRoute(
			currentPos,
			route.coordinates,
		);

		const distanceFromRoute = currentPos.distanceTo(closestPoint);

		return distanceFromRoute > this.config.rerouteDistanceThreshold;
	}

	private scheduleReroute(
		waypoints: Waypoint[],
		onReroute?: (info: RouteInfo) => void,
		onError?: (msg: string) => void,
	): void {
		if (this.pendingReroute) {
			clearTimeout(this.pendingReroute);
		}

		this.pendingReroute = setTimeout(async () => {
			try {
				const currentPos = this.vehicleMarker.getPosition();
				if (currentPos) {
					const updatedWaypoints = [
						{ lat: currentPos.lat, lng: currentPos.lng },
						...waypoints.slice(1),
					];

					const route =
						await this.routeManager.calculateRoute(updatedWaypoints);

					if (route) {
						this.drawRoute(route);
						onReroute?.(route);
						this.lastRerouteTime = Date.now();
						console.log("Rerouted due to deviation from path");
					}
				}
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Reroute failed";
				console.error("Reroute error:", error);
				onError?.(message);
			}
			this.pendingReroute = null;
		}, 500); // 500ms debounce
	}

	private findClosestPointOnRoute(
		point: L.LatLng,
		routeCoordinates: L.LatLng[],
	): L.LatLng {
		let closestPoint = routeCoordinates[0];
		let minDistance = point.distanceTo(closestPoint);

		for (const coord of routeCoordinates) {
			const distance = point.distanceTo(coord);
			if (distance < minDistance) {
				minDistance = distance;
				closestPoint = coord;
			}
		}

		return closestPoint;
	}

	private drawRoute(route: RouteInfo): void {
		if (this.routePolyline) {
			this.routePolyline.remove();
		}

		this.routePolyline = L.polyline(route.coordinates, {
			color: "#3b82f6",
			weight: 6,
			opacity: 0.85,
		}).addTo(this.map);

		this.map.fitBounds(this.routePolyline.getBounds(), { padding: [40, 40] });
	}

	private clearRouteVisualization(): void {
		if (this.routePolyline) {
			this.routePolyline.remove();
			this.routePolyline = null;
		}

		for (const marker of this.waypointMarkers) {
			marker.remove();
		}
		this.waypointMarkers = [];
	}

	cleanup(): void {
		this.routeManager.cancelPending();
		this.vehicleMarker.remove();
		this.clearRouteVisualization();

		if (this.pendingReroute) {
			clearTimeout(this.pendingReroute);
			this.pendingReroute = null;
		}
	}

	getConfig(): NavigationConfig {
		return { ...this.config };
	}

	updateConfig(config: Partial<NavigationConfig>): void {
		this.config = { ...this.config, ...config };
	}

	getCurrentRoute(): RouteInfo | null {
		return this.routeManager.getCurrentRoute();
	}
}

interface NavigationLayerProps {
	waypoints: Waypoint[];
	simulateGPS?: boolean;
	config?: Partial<NavigationConfig>;
	onRouteFound?: (info: RouteInfo) => void;
	onRouteError?: (msg: string) => void;
}

// ============================================================
// NavigationLayer
// ------------------------------------------------------------
// 4 effect riêng biệt, mỗi effect làm ĐÚNG MỘT việc:
//   1. Tạo/hủy NavigationManager  → chạy 1 lần theo `map`
//   2. Đẩy config mới vào manager  → chạy khi `config` đổi (không gọi API)
//   3. Tính route                  → chạy khi `waypoints` đổi (nơi DUY NHẤT gọi setDestination)
//   4. Giả lập GPS                 → chạy khi bật/tắt simulateGPS
//
// Trước đây effect (1) và (3) đều tự gọi setDestination() nên mỗi lần
// mount/đổi waypoints, ORS API bị gọi 2 lần. Giờ chỉ effect (3) làm việc đó.
// ============================================================
function NavigationLayer({
	waypoints,
	simulateGPS = false,
	config,
	onRouteFound,
	onRouteError,
}: NavigationLayerProps) {
	const map = useMap();
	const navManagerRef = useRef<NavigationManager | null>(null);
	const gpsSimulatorRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Luôn giữ callback mới nhất trong ref, để các effect bên dưới KHÔNG cần
	// liệt kê onRouteFound/onRouteError vào dependency array. Nếu không làm
	// vậy, một inline function `() => {}` truyền từ component cha (reference
	// mới mỗi lần render) sẽ khiến effect chạy lại không cần thiết.
	const onRouteFoundRef = useRef(onRouteFound);
	const onRouteErrorRef = useRef(onRouteError);
	useEffect(() => {
		onRouteFoundRef.current = onRouteFound;
		onRouteErrorRef.current = onRouteError;
	});

	// 1) Tạo NavigationManager một lần cho mỗi map instance, dọn dẹp khi unmount.
	//    KHÔNG gọi setDestination ở đây nữa.
	useEffect(() => {
		if (!map) return;

		const manager = new NavigationManager(map, {
			...DEFAULT_CONFIG,
			...config,
		});
		navManagerRef.current = manager;

		return () => {
			manager.cleanup();
			navManagerRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map]);

	// 2) Config đổi -> update tại chỗ, không tạo lại manager, không gọi API.
	useEffect(() => {
		if (config) {
			navManagerRef.current?.updateConfig(config);
		}
	}, [config]);

	// 3) Waypoints đổi -> đây là nơi DUY NHẤT gọi setDestination (=> gọi ORS API).
	useEffect(() => {
		if (!navManagerRef.current || waypoints.length < 2) return;

		navManagerRef.current.setDestination(
			waypoints,
			(info) => onRouteFoundRef.current?.(info),
			(msg) => onRouteErrorRef.current?.(msg),
		);
	}, [waypoints]);

	// 4) Giả lập GPS chạy dọc route hiện có (không gọi API routing, chỉ đọc
	//    coordinates đã có sẵn). Tách hẳn khỏi logic tính route ở trên.
	useEffect(() => {
		if (!simulateGPS) return;

		let currentIndex = 0;
		const intervalMs =
			config?.gpsUpdateIntervalMs ?? DEFAULT_CONFIG.gpsUpdateIntervalMs;

		gpsSimulatorRef.current = setInterval(() => {
			const manager = navManagerRef.current;
			if (!manager) return;

			const route = manager.getCurrentRoute()?.coordinates;

			if (!route || currentIndex >= route.length) {
				if (gpsSimulatorRef.current) clearInterval(gpsSimulatorRef.current);
				return;
			}

			manager.handleGPSUpdate(
				route[currentIndex],
				waypoints,
				(info) => onRouteFoundRef.current?.(info),
				(msg) => onRouteErrorRef.current?.(msg),
			);

			currentIndex += 5;
		}, intervalMs);

		return () => {
			if (gpsSimulatorRef.current) {
				clearInterval(gpsSimulatorRef.current);
				gpsSimulatorRef.current = null;
			}
		};
		// waypoints chỉ dùng để truyền vào handleGPSUpdate cho lúc reroute,
		// không cần re-tạo interval mỗi khi nó đổi identity nhỏ lẻ.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [simulateGPS, config?.gpsUpdateIntervalMs]);

	return null;
}

function formatDistance(meters: number) {
	return meters >= 1000
		? `${(meters / 1000).toFixed(1)} km`
		: `${Math.round(meters)} m`;
}

function formatTime(seconds: number) {
	const m = Math.round(seconds / 60);
	return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} phút`;
}

function RouteComponent() {
	const [waypoints] = useState<Waypoint[]>([
		{ lat: 10.8231, lng: 106.6297 },
		{ lat: 10.7769, lng: 106.7009 },
	]);

	const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
	const [error, setError] = useState<string | null>(null);

	return (
		<div className="container mx-auto px-4 py-6 space-y-3">
			{routeInfo && (
				<div className="flex gap-6 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
					<span>
						📍 Khoảng cách:{" "}
						<strong>{formatDistance(routeInfo.totalDistance)}</strong>
					</span>
					<span>
						⏱ Thời gian: <strong>{formatTime(routeInfo.totalTime)}</strong>
					</span>
				</div>
			)}
			{error && (
				<div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
					⚠️ {error}
				</div>
			)}

			<div className="rounded-lg overflow-hidden border shadow-sm">
				<MapContainer
					center={[waypoints[0].lat, waypoints[0].lng]}
					zoom={13}
					className="h-150 w-full"
					scrollWheelZoom={true}
				>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					<NavigationLayer
						waypoints={waypoints}
						// Đổi thành true chỉ khi bạn thực sự muốn xem marker tự
						// chạy dọc tuyến đường để test/demo. Mặc định để false
						// để marker không tự di chuyển ngoài ý muốn.
						simulateGPS={false}
						onRouteFound={setRouteInfo}
						onRouteError={setError}
					/>
				</MapContainer>
			</div>
		</div>
	);
}
