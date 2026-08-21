import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorldClockPanel, formatGameTime, formatWeekday, formatWeather } from "./WorldClockPanel";
import type { Weather } from "../../../lib/api";

describe("formatGameTime", () => {
    it("formats noon as 12:00", () => {
        expect(formatGameTime(12)).toBe("12:00");
    });

    it("formats a fractional hour, rounding to the nearest minute", () => {
        expect(formatGameTime(14.3)).toBe("14:18");
    });

    it("pads single-digit hours and minutes with a leading zero", () => {
        expect(formatGameTime(1 + 5 / 60)).toBe("01:05");
    });

    it("wraps a value of exactly 24 back to 00:00", () => {
        expect(formatGameTime(24)).toBe("00:00");
    });
});

describe("formatWeekday", () => {
    it.each([
        [0, "Segunda-feira"],
        [1, "Terça-feira"],
        [2, "Quarta-feira"],
        [3, "Quinta-feira"],
        [4, "Sexta-feira"],
        [5, "Sábado"],
        [6, "Domingo"],
    ])("formats weekday %i as %s", (weekday, expected) => {
        expect(formatWeekday(weekday)).toBe(expected);
    });
});

describe("formatWeather", () => {
    it.each([
        ["sunny", "Ensolarado"],
        ["rainy", "Chuvoso"],
        ["foggy", "Neblina"],
    ] as const)("formats weather type %s as %s", (type, expected) => {
        expect(formatWeather({ type, temperature: 20 })).toBe(expected);
    });
});

describe("WorldClockPanel", () => {
    it("shows a placeholder for the time and weather while the world clock hasn't synced yet", () => {
        render(<WorldClockPanel hour={null} weekday={null} weather={null} />);

        expect(screen.getByText("--:--")).toBeInTheDocument();
        expect(screen.getByText("--°C")).toBeInTheDocument();
    });

    it("shows the formatted game time once synced", () => {
        render(<WorldClockPanel hour={9.5} weekday={1} weather={null} />);

        expect(screen.getByText("09:30")).toBeInTheDocument();
    });

    it("shows the weekday name once synced", () => {
        render(<WorldClockPanel hour={9.5} weekday={1} weather={null} />);

        expect(screen.getByText("Terça-feira")).toBeInTheDocument();
    });

    it("shows no weekday text while the world clock hasn't synced yet", () => {
        const { container } = render(<WorldClockPanel hour={null} weekday={null} weather={null} />);

        expect(container.querySelector(".text-placeholder.text-size-12")).toHaveTextContent("");
    });

    it("shows the temperature and weather label once synced", () => {
        const weather: Weather = { type: "rainy", temperature: 17 };
        render(<WorldClockPanel hour={9.5} weekday={1} weather={weather} />);

        expect(screen.getByText("17°C")).toBeInTheDocument();
        expect(screen.getByText("Chuvoso")).toBeInTheDocument();
    });
});
