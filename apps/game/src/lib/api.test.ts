import { afterEach, describe, expect, it, vi } from "vitest";
import {
    ApiError,
    UnauthorizedError,
    authFetch,
    createCharacter,
    listMyCharacters,
    listSkills,
    login,
    register,
    setUnauthorizedHandler,
    updateAppearance,
    type AppearanceUpdate,
    type CreateCharacterInput,
} from "./api";

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

describe("register", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns the parsed body on success", async () => {
        const body = { id: "acc-1", email: "ana@example.com" };
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(201, body)));

        const result = await register("ana@example.com", "correct-horse");

        expect(result).toEqual(body);
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/auth/register"),
            expect.objectContaining({ method: "POST" }),
        );
    });

    it("throws ApiError with the server message on failure", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(409, { message: "Email already in use" })));

        await expect(register("ana@example.com", "whatever")).rejects.toThrow("Email already in use");
        await expect(register("ana@example.com", "whatever")).rejects.toBeInstanceOf(ApiError);
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

    it("notifies the registered unauthorized handler on 401, no matter which call triggered it", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(401, {})));
        const handler = vi.fn();
        setUnauthorizedHandler(handler);

        await expect(authFetch("/characters/mine", "expired-token")).rejects.toBeInstanceOf(UnauthorizedError);
        expect(handler).toHaveBeenCalledTimes(1);

        setUnauthorizedHandler(null);
    });

    it("does not notify any handler on a successful response", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(200, {})));
        const handler = vi.fn();
        setUnauthorizedHandler(handler);

        await authFetch("/characters/mine", "token-123");
        expect(handler).not.toHaveBeenCalled();

        setUnauthorizedHandler(null);
    });
});

describe("listMyCharacters", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns the parsed character list on success", async () => {
        const body = [{ id: "char-1", name: "Ana" }];
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(200, body)));

        const result = await listMyCharacters("token-123");

        expect(result).toEqual(body);
    });

    it("throws ApiError with the server message on failure", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(500, { message: "Erro ao listar" })));

        await expect(listMyCharacters("token-123")).rejects.toThrow("Erro ao listar");
    });
});

describe("createCharacter", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    const input: CreateCharacterInput = {
        firstName: "Ana",
        lastName: "Silva",
        gender: "female",
        skinTone: 3,
        hairType: "liso-1",
        eyeType: "redondo-1",
        skills: { intelligence: 2, charisma: 2 },
    };

    it("returns the created character on success", async () => {
        const body = { id: "char-1", firstName: "Ana" };
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, body));
        vi.stubGlobal("fetch", fetchMock);

        const result = await createCharacter("token-123", input);

        expect(result).toEqual(body);
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining("/characters"),
            expect.objectContaining({ method: "POST", body: JSON.stringify(input) }),
        );
    });

    it("throws ApiError with the server message on failure", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(400, { message: "Alocação de skills inválida" })));

        await expect(createCharacter("token-123", input)).rejects.toThrow("Alocação de skills inválida");
    });
});

describe("updateAppearance", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    const appearance: AppearanceUpdate = { top: "1", pants: "1" };

    it("returns the updated character on success", async () => {
        const body = { id: "char-1", appearance };
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, body));
        vi.stubGlobal("fetch", fetchMock);

        const result = await updateAppearance("token-123", "char-1", appearance);

        expect(result).toEqual(body);
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining("/characters/char-1/appearance"),
            expect.objectContaining({ method: "PATCH", body: JSON.stringify(appearance) }),
        );
    });

    it("throws ApiError with the server message on failure", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(400, { message: "Peça inválida" })));

        await expect(updateAppearance("token-123", "char-1", appearance)).rejects.toThrow("Peça inválida");
    });
});

describe("listSkills", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns the parsed skill catalog on success", async () => {
        const body = [{ id: "intelligence", label: "Inteligência" }];
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(200, body)));

        const result = await listSkills("token-123");

        expect(result).toEqual(body);
    });

    it("throws ApiError with the server message on failure", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(500, { message: "Erro ao listar skills" })));

        await expect(listSkills("token-123")).rejects.toThrow("Erro ao listar skills");
    });
});
