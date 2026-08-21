import { afterEach, describe, expect, it } from "vitest";
import { GAME_DAY_MINUTES, GAME_MINUTES_PER_REAL_MINUTE, applySunLighting, extrapolateHour } from "./world-clock-lighting";

describe("extrapolateHour", () => {
    it("returns the reference hour unchanged exactly at realTimestamp", () => {
        const reference = { hour: 14.3, realTimestamp: "2026-08-20T12:00:00.000Z" };
        const now = new Date(reference.realTimestamp).getTime();

        expect(extrapolateHour(reference, now)).toBeCloseTo(14.3);
    });

    it("advances one game hour per 4 real minutes (ratio de 15x)", () => {
        const reference = { hour: 10, realTimestamp: "2026-08-20T12:00:00.000Z" };
        const now = new Date(reference.realTimestamp).getTime() + 4 * 60_000;

        expect(extrapolateHour(reference, now)).toBeCloseTo(11);
    });

    it("wraps around past 24h back to the start of the day", () => {
        const reference = { hour: 23, realTimestamp: "2026-08-20T12:00:00.000Z" };
        const now = new Date(reference.realTimestamp).getTime() + 8 * 60_000; // +2h de jogo

        expect(extrapolateHour(reference, now)).toBeCloseTo(1);
    });

    it("wraps a slightly-negative elapsed time (now just before realTimestamp) back into the previous day, instead of returning a negative hour", () => {
        const reference = { hour: 0, realTimestamp: "2026-08-20T12:00:00.000Z" };
        const now = new Date(reference.realTimestamp).getTime() - 1000; // 1s antes

        const result = extrapolateHour(reference, now);

        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(24);
        expect(result).toBeCloseTo(24, 2);
    });

    it("GAME_DAY_MINUTES/GAME_MINUTES_PER_REAL_MINUTE encode a 96-real-minute game day", () => {
        expect(GAME_DAY_MINUTES / GAME_MINUTES_PER_REAL_MINUTE).toBe(96);
    });
});

describe("applySunLighting", () => {
    afterEach(() => {
        document.documentElement.style.removeProperty("--sun-x");
        document.documentElement.style.removeProperty("--sun-y");
        document.documentElement.style.removeProperty("--sun-color");
    });

    it("sets --sun-x/--sun-y/--sun-color for noon (hour 12), matching Block.scss's static fallback defaults", () => {
        applySunLighting(12);

        const root = document.documentElement;
        expect(root.style.getPropertyValue("--sun-x")).toBe("0.5");
        expect(root.style.getPropertyValue("--sun-y")).toBe("1");
        expect(root.style.getPropertyValue("--sun-color")).toBe("rgb(255, 220, 180)");
    });

    it("clamps --sun-y to 0 and darkens --sun-color at midnight (hour 0)", () => {
        applySunLighting(0);

        const root = document.documentElement;
        expect(root.style.getPropertyValue("--sun-y")).toBe("0");
        expect(root.style.getPropertyValue("--sun-color")).toBe("rgb(255, 100, 30)");
    });
});
