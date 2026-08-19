import { describe, expect, it } from "vitest";
import { icons } from "./index";

const EXPECTED_NAMES = [
    "body",
    "face",
    "hair",
    "shirt",
    "blouse",
    "overlay",
    "pants",
    "shoes",
    "male",
    "female",
    "heart",
];

describe("icons", () => {
    it.each(EXPECTED_NAMES)("has a %s icon", (name) => {
        expect(icons).toHaveProperty(name);
    });

    it.each(Object.entries(icons))("%s is a self-contained 24x24 currentColor svg", (_name, markup) => {
        expect(markup).toContain("<svg");
        expect(markup).toContain('viewBox="0 0 24 24"');
        expect(markup).toContain('fill="currentColor"');
    });
});
