import { afterEach, describe, expect, it } from "vitest";
import { clearStoredToken, getStoredToken, setStoredToken } from "./token-storage";

describe("token-storage", () => {
    afterEach(() => {
        localStorage.clear();
    });

    it("returns null when no token is stored", () => {
        expect(getStoredToken()).toBeNull();
    });

    it("stores and retrieves the token", () => {
        setStoredToken("token-123");

        expect(getStoredToken()).toBe("token-123");
    });

    it("clears the stored token", () => {
        setStoredToken("token-123");
        clearStoredToken();

        expect(getStoredToken()).toBeNull();
    });
});
