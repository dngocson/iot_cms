export const homePageMetersMock = [
	{
		id: "COD",
		current: 5,
		goodThreshold: "10%",
		badThreshold: 80,
		name: "COD",
		unit: "kW/h",
	},
	{
		id: "BOD5",
		current: 54,
		goodThreshold: "10%",
		badThreshold: 80,
		name: "BOD5",
		unit: "mg/l",
	},
	{
		id: "Dầu mỡ",
		current: 66,
		goodThreshold: "10%",
		badThreshold: 60,
		name: "Dầu mỡ",
		unit: "kW/h",
	},
	{
		id: "PO4",
		current: 5,
		goodThreshold: "10%",
		badThreshold: 80,
		name: "PO4",
		unit: "kW/h",
	},
	{
		id: "FLOW",
		current: 13.5,
		goodThreshold: "10%",
		badThreshold: "80%",
		name: "FLOW",
		unit: "m3/day",
	},
	{
		id: "COD",
		current: undefined,
		goodThreshold: "10%",
		badThreshold: 80,
		name: "COD",
		unit: "kW/h",
	},
	{
		id: "COD",
		current: 100,
		goodThreshold: "10%",
		badThreshold: 80,
		name: "COD",
		unit: "kW/h",
	},
	{
		id: "BOD5",
		current: 54,
		goodThreshold: "10%",
		badThreshold: 80,
		name: "BOD5",
		unit: "mg/l",
	},
	{
		id: "Dầu nhờn ",
		current: undefined,
		goodThreshold: "10%",
		badThreshold: 60,
		name: "Dầu mỡ",
		unit: "kW/h",
	},
	{
		id: "PO4",
		current: 15,
		goodThreshold: "10%",
		badThreshold: 80,
		name: "PO4",
		unit: "kW/h",
	},
	{
		id: "FLOW",
		current: 13.5,
		goodThreshold: "10%",
		badThreshold: "80%",
		name: "FLOW",
		unit: "m3/day",
	},
	{
		id: "COD",
		current: 5,
		goodThreshold: "10%",
		badThreshold: 80,
		name: "COD",
		unit: "kW/h",
	},
];

// ─── Water Monitoring Line Chart ────────────────────────────────────────────

import type { WaterMonitoringDataPoint } from "#/components/custom/charts/MonitoringLineChart";

export const waterMonitoringMockData: WaterMonitoringDataPoint[] = [
	{ station: "A1", cod: 23, bod: 20, oil: 30 },
	{ station: "A2", cod: 11, bod: 28, oil: 12 },
	{ station: "A3", cod: 17, bod: 13, oil: 25 },
	{ station: "A4", cod: 29, bod: 22, oil: 11 },
	{ station: "A5", cod: 14, bod: 10, oil: 19 },
	{ station: "A6", cod: 26, bod: 26, oil: 23 },
	{ station: "A7", cod: 19, bod: 18, oil: 14 },
	{ station: "A8", cod: 12, bod: 24, oil: 26 },
	{ station: "A9", cod: 30, bod: 20, oil: 17 },
	{ station: "A10", cod: 21, bod: 20, oil: 21 },
];

// ─── Water Meter Alert Stats ─────────────────────────────────────────────────

import type { WaterMeterAlertStatsData } from "#/components/custom/water-meter/WaterMeterAlertStats";

export const waterMeterAlertStatsMockData: WaterMeterAlertStatsData = {
	totalAlerts: 50,
	totalAlertsTrend: -4,
	metersOverThreshold: 7,
	totalMeters: 11,
	indicators: [
		{ id: "cod", name: "COD", count: 18, percentage: 36.0 },
		{ id: "bod5", name: "BOD5", count: 18, percentage: 36.0 },
		{ id: "oil", name: "Dầu Mỡ", count: 18, percentage: 36.0 },
		{ id: "po4", name: "PO4", count: 18, percentage: 36.0 },
		{ id: "flow", name: "FLOW", count: 18, percentage: 36.0 },
		{ id: "no3-1", name: "NO3", count: 18, percentage: 36.0 },
		{ id: "no3-2", name: "NO3", count: 18, percentage: 36.0 },
		{ id: "ph", name: "PH -", count: 18, percentage: 36.0 },
		{ id: "tss", name: "TSS", count: 18, percentage: 36.0 },
	],
};
