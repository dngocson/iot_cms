import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
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

// Default configuration
const DEFAULT_CONFIG: NavigationConfig = {
	rerouteDistanceThreshold: 50, // 50 meters
	rerouteCooldownMs: 30000, // 30 seconds
	gpsUpdateIntervalMs: 1000, // 1 second
};

// RouteManager - handles route calculation and caching
class RouteManager {
	private currentRoute: RouteInfo | null = null;
	private isCalculating = false;
	private abortController: AbortController | null = null;

	async calculateRoute(waypoints: Waypoint[]): Promise<RouteInfo | null> {
		// Cancel any pending request
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
				([lng, lat]: [number, number]) => L.latLng(lat, lng)
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

// VehicleMarker - handles live GPS position updates
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
			// Create marker with custom icon for vehicle
			const vehicleIcon = L.divIcon({
				className: "vehicle-marker",
				html: '<div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
				iconSize: [20, 20],
				iconAnchor: [10, 10],
			});

			this.marker = L.marker(latLng, { icon: vehicleIcon }).addTo(this.map);
		} else {
			// Reuse existing marker, just update position
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

// NavigationManager - coordinates routing decisions
class NavigationManager {
	private routeManager: RouteManager;
	private vehicleMarker: VehicleMarker;
	private config: NavigationConfig;
	private lastRerouteTime = 0;
	private map: L.Map;
	private routePolyline: L.Polyline | null = null;
	private waypointMarkers: L.Marker[] = [];
	private pendingReroute: NodeJS.Timeout | null = null;

	constructor(
		map: L.Map,
		config: NavigationConfig = DEFAULT_CONFIG
	) {
		this.map = map;
		this.config = config;
		this.routeManager = new RouteManager();
		this.vehicleMarker = new VehicleMarker(map);
	}

	async setDestination(
		waypoints: Waypoint[],
		onRouteFound?: (info: RouteInfo) => void,
		onError?: (msg: string) => void
	): Promise<void> {
		// Clear existing route visualization
		this.clearRouteVisualization();

		// Add waypoint markers
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
		onError?: (msg: string) => void
	): void {
		// Update vehicle marker position immediately
		this.vehicleMarker.updatePosition(position);

		// Check if reroute is needed (throttled)
		if (this.shouldReroute(position)) {
			this.scheduleReroute(waypoints, onReroute, onError);
		}
	}

	private shouldReroute(currentPos: L.LatLng): boolean {
		const route = this.routeManager.getCurrentRoute();
		
		// No route exists, no need to reroute
		if (!route || route.coordinates.length === 0) {
			return false;
		}

		// Check cooldown period
		const now = Date.now();
		if (now - this.lastRerouteTime < this.config.rerouteCooldownMs) {
			return false;
		}

		// Check if already calculating
		if (this.routeManager.isRouteCalculating()) {
			return false;
		}

		// Find closest point on route
		const closestPoint = this.findClosestPointOnRoute(
			currentPos,
			route.coordinates
		);

		// Calculate distance from route
		const distanceFromRoute = currentPos.distanceTo(closestPoint);

		// Reroute if deviated beyond threshold
		return distanceFromRoute > this.config.rerouteDistanceThreshold;
	}

	private scheduleReroute(
		waypoints: Waypoint[],
		onReroute?: (info: RouteInfo) => void,
		onError?: (msg: string) => void
	): void {
		// Clear any pending reroute
		if (this.pendingReroute) {
			clearTimeout(this.pendingReroute);
		}

		// Debounce: wait a bit before actually rerouting
		this.pendingReroute = setTimeout(async () => {
			try {
				// Update start point to current vehicle position
				const currentPos = this.vehicleMarker.getPosition();
				if (currentPos) {
					const updatedWaypoints = [
						{ lat: currentPos.lat, lng: currentPos.lng },
						...waypoints.slice(1),
					];

					const route = await this.routeManager.calculateRoute(updatedWaypoints);

					if (route) {
						this.drawRoute(route);
						onReroute?.(route);
						this.lastRerouteTime = Date.now();
						console.log("Rerouted due to deviation from path");
					}
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : "Reroute failed";
				console.error("Reroute error:", error);
				onError?.(message);
			}
			this.pendingReroute = null;
		}, 500); // 500ms debounce
	}

	private findClosestPointOnRoute(
		point: L.LatLng,
		routeCoordinates: L.LatLng[]
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
		// Remove old polyline if exists
		if (this.routePolyline) {
			this.routePolyline.remove();
		}

		// Create new polyline (or reuse if we want even more optimization)
		this.routePolyline = L.polyline(route.coordinates, {
			color: "#3b82f6",
			weight: 6,
			opacity: 0.85,
		}).addTo(this.map);

		// Fit bounds to show entire route
		this.map.fitBounds(this.routePolyline.getBounds(), { padding: [40, 40] });
	}

	private clearRouteVisualization(): void {
		if (this.routePolyline) {
			this.routePolyline.remove();
			this.routePolyline = null;
		}

		this.waypointMarkers.forEach((marker) => marker.remove());
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

function NavigationLayer({
	waypoints,
	simulateGPS = false,
	config,
	onRouteFound,
	onRouteError,
}: NavigationLayerProps) {
	const map = useMap();
	const navManagerRef = useRef<NavigationManager | null>(null);
	const gpsSimulatorRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (!map) return;

		// Initialize navigation manager
		const navConfig = { ...DEFAULT_CONFIG, ...config };
		navManagerRef.current = new NavigationManager(map, navConfig);

		// Set initial destination
		navManagerRef.current.setDestination(waypoints, onRouteFound, onRouteError);

		// Simulate GPS updates if enabled
		if (simulateGPS) {
			let currentIndex = 0;
			const route = navManagerRef.current.getCurrentRoute();

			if (route && route.coordinates.length > 0) {
				gpsSimulatorRef.current = setInterval(() => {
					if (!navManagerRef.current) return;

					const routeCoords = navManagerRef.current.getCurrentRoute()?.coordinates;
					if (!routeCoords || currentIndex >= routeCoords.length) {
						if (gpsSimulatorRef.current) {
							clearInterval(gpsSimulatorRef.current);
						}
						return;
					}

					// Simulate GPS position along route
					const position = routeCoords[currentIndex];
					navManagerRef.current.handleGPSUpdate(
						position,
						waypoints,
						onRouteFound,
						onRouteError
					);

					currentIndex += 5; // Skip points for faster simulation
				}, navConfig.gpsUpdateIntervalMs);
			}
		}

		return () => {
			if (gpsSimulatorRef.current) {
				clearInterval(gpsSimulatorRef.current);
			}
			navManagerRef.current?.cleanup();
		};
	}, [map]);

	// Update destination when waypoints change
	useEffect(() => {
		if (navManagerRef.current && waypoints.length >= 2) {
			navManagerRef.current.setDestination(waypoints, onRouteFound, onRouteError);
		}
	}, [waypoints]);

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
						simulateGPS={true}
						onRouteFound={setRouteInfo}
						onRouteError={setError}
					/>
				</MapContainer>
			</div>
		</div>
	);
}