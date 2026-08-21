import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useWorldClockLighting } from "./useWorldClockLighting";

describe("useWorldClockLighting", () => {
    afterEach(() => {
        document.documentElement.style.removeProperty("--sun-x");
        document.documentElement.style.removeProperty("--sun-y");
        document.documentElement.style.removeProperty("--sun-color");
    });

    it("does not touch the lighting CSS vars while hour is null", () => {
        renderHook(() => useWorldClockLighting(null));

        expect(document.documentElement.style.getPropertyValue("--sun-x")).toBe("");
    });

    it("applies the lighting for the given hour", () => {
        renderHook(() => useWorldClockLighting(12));

        expect(document.documentElement.style.getPropertyValue("--sun-x")).toBe("0.5");
        expect(document.documentElement.style.getPropertyValue("--sun-y")).toBe("1");
        expect(document.documentElement.style.getPropertyValue("--sun-color")).toBe("rgb(255, 220, 180)");
    });

    it("re-applies the lighting when hour changes", () => {
        const { rerender } = renderHook(({ hour }) => useWorldClockLighting(hour), { initialProps: { hour: 12 } });

        rerender({ hour: 0 });

        expect(document.documentElement.style.getPropertyValue("--sun-y")).toBe("0");
        expect(document.documentElement.style.getPropertyValue("--sun-color")).toBe("rgb(255, 100, 30)");
    });
});
