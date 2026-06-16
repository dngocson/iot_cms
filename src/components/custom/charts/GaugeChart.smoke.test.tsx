// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { GaugeChart } from "./GaugeChart";

beforeAll(() => {
	// jsdom reports 0×0 for every element; feed Recharts a real size so its
	// ResponsiveContainer actually draws the SVG.
	for (const dim of ["offsetWidth", "offsetHeight"] as const) {
		Object.defineProperty(HTMLElement.prototype, dim, {
			configurable: true,
			value: 320,
		});
	}
	HTMLElement.prototype.getBoundingClientRect = () =>
		({
			width: 320,
			height: 320,
			top: 0,
			left: 0,
			right: 320,
			bottom: 320,
			x: 0,
			y: 0,
		}) as DOMRect;

	globalThis.ResizeObserver = class {
		cb: ResizeObserverCallback;
		constructor(cb: ResizeObserverCallback) {
			this.cb = cb;
		}
		observe(el: Element) {
			this.cb(
				[{ target: el, contentRect: { width: 320, height: 320 } }] as never,
				this as never,
			);
		}
		unobserve() {}
		disconnect() {}
	};
});

describe("GaugeChart (smoke)", () => {
	it("renders the value, unit and derived scale ticks", () => {
		const { container } = render(
			<GaugeChart
				data={{ min: 0, max: 100, current: 37.2, lowLevel: 60, highLevel: 75 }}
				label="COD"
				unit="mg/l"
			/>,
		);
		const text = container.textContent ?? "";
		expect(text).toContain("37.2");
		expect(text).toContain("mg/l");
		// Endpoints + thresholds should appear as major tick labels.
		expect(text).toContain("0");
		expect(text).toContain("100");
		expect(text).toContain("60");
		expect(text).toContain("75");
	});

	it("clamps an out-of-range reading without crashing", () => {
		const { container } = render(
			<GaugeChart
				data={{ min: 0, max: 100, current: 150, lowLevel: 60, highLevel: 75 }}
				label="COD"
				unit="mg/l"
			/>,
		);
		expect(container.textContent ?? "").toContain("150.0");
	});
});
