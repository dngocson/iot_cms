import { describe, expect, it } from "vitest";
import { getMeterStatus, parseThreshold } from "#/lib/meter-status";

describe("parseThreshold", () => {
	it("returns plain numbers unchanged", () => {
		expect(parseThreshold(30)).toBe(30);
	});

	it("parses percentage strings to numbers", () => {
		expect(parseThreshold("80%")).toBe(80);
		expect(parseThreshold(" 0% ")).toBe(0);
		expect(parseThreshold("100%")).toBe(100);
		expect(parseThreshold("12.5%")).toBe(12.5);
	});

	it("rejects percentages outside 0–100", () => {
		expect(() => parseThreshold("150%")).toThrow();
		expect(() => parseThreshold("-5%")).toThrow();
	});

	it("rejects non-numeric / malformed strings", () => {
		expect(() => parseThreshold("abc")).toThrow();
		expect(() => parseThreshold("30")).toThrow();
	});

	it("rejects non-finite numbers", () => {
		expect(() => parseThreshold(Number.NaN)).toThrow();
		expect(() => parseThreshold(Number.POSITIVE_INFINITY)).toThrow();
	});
});

describe("getMeterStatus", () => {
	it("returns noConnection when value is undefined", () => {
		expect(getMeterStatus(undefined, 30, 80)).toBe("noConnection");
	});

	it("returns good below the good threshold", () => {
		expect(getMeterStatus(10, 30, 80)).toBe("good");
	});

	it("returns warning at/above good and below bad", () => {
		expect(getMeterStatus(30, 30, 80)).toBe("warning");
		expect(getMeterStatus(50, 30, 80)).toBe("warning");
	});

	it("returns bad at/above the bad threshold", () => {
		expect(getMeterStatus(80, 30, 80)).toBe("bad");
		expect(getMeterStatus(90, 30, 80)).toBe("bad");
	});

	it("works with percentage thresholds", () => {
		expect(getMeterStatus(50, "30%", "80%")).toBe("warning");
		expect(getMeterStatus(10, "30%", "80%")).toBe("good");
		expect(getMeterStatus(95, "30%", "80%")).toBe("bad");
	});
});
