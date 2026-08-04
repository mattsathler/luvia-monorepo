import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, UnauthorizedError, authFetch, login } from "./api";

function jsonResponse(status: number, body: unknown): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
    } as Response;
}

describe("login", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns the parsed body on success", async () => {
        const body = { accessToken: "token", account: { id: "acc-1", email: "ana@example.com" } };
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(200, body)));

        const result = await login("ana@example.com", "correct-horse");

        expect(result).toEqual(body);
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/auth/login"),
            expect.objectContaining({ method: "POST" }),
        );
    });

    it("throws UnauthorizedError on 401", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(401, { message: "Invalid email or password" })));

        await expect(login("ana@example.com", "wrong")).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it("throws ApiError with the server message on other failures", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(409, { message: "Email already in use" })));

        await expect(login("ana@example.com", "whatever")).rejects.toThrow("Email already in use");
    });

    it("throws ApiError with a generic message when the error body has no message field", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(500, {})));

        await expect(login("ana@example.com", "whatever")).rejects.toThrow("Erro inesperado");
    });

    it("throws ApiError with a generic message when the error body cannot be parsed", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                json: async () => {
                    throw new Error("not json");
                },
            } as unknown as Response),
        );

        await expect(login("ana@example.com", "whatever")).rejects.toThrow("Erro inesperado");
        await expect(login("ana@example.com", "whatever")).rejects.toBeInstanceOf(ApiError);
    });
});

describe("authFetch", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("attaches the Authorization header and returns the response", async () => {
        const response = jsonResponse(200, { ok: true });
        const fetchMock = vi.fn().mockResolvedValue(response);
        vi.stubGlobal("fetch", fetchMock);

        const result = await authFetch("/characters/mine", "token-123");

        expect(result).toBe(response);
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining("/characters/mine"),
            expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer token-123" }) }),
        );
    });

    it("throws UnauthorizedError on 401", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(401, {})));

        await expect(authFetch("/characters/mine", "expired-token")).rejects.toBeInstanceOf(UnauthorizedError);
    });
});
