import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import * as api from "../lib/api";
import { clearStoredToken, getStoredToken, setStoredToken } from "./token-storage";

vi.mock("../lib/api", async (importOriginal) => {
    const actual = await importOriginal<typeof api>();
    return {
        ...actual,
        login: vi.fn(),
        authFetch: vi.fn(),
    };
});

function TestConsumer() {
    const { isAuthenticated, isValidating, accessToken, login, logout } = useAuth();

    return (
        <div>
            <span data-testid="validating">{String(isValidating)}</span>
            <span data-testid="authenticated">{String(isAuthenticated)}</span>
            <span data-testid="token">{accessToken ?? ""}</span>
            <button onClick={() => login("ana@example.com", "correct-horse")}>login</button>
            <button onClick={logout}>logout</button>
        </div>
    );
}

describe("AuthProvider", () => {
    beforeEach(() => {
        clearStoredToken();
        vi.clearAllMocks();
    });

    it("starts unauthenticated and not validating when there is no stored token", () => {
        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>,
        );

        expect(screen.getByTestId("validating").textContent).toBe("false");
        expect(screen.getByTestId("authenticated").textContent).toBe("false");
    });

    it("keeps the session when the stored token is validated successfully", async () => {
        setStoredToken("stored-token");
        (api.authFetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true } as Response);

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>,
        );

        await waitFor(() => expect(screen.getByTestId("validating").textContent).toBe("false"));
        expect(screen.getByTestId("authenticated").textContent).toBe("true");
        expect(api.authFetch).toHaveBeenCalledWith("/characters/mine", "stored-token");
    });

    it("clears the session when the stored token is rejected as unauthorized", async () => {
        setStoredToken("expired-token");
        (api.authFetch as ReturnType<typeof vi.fn>).mockRejectedValue(new api.UnauthorizedError());

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>,
        );

        await waitFor(() => expect(screen.getByTestId("authenticated").textContent).toBe("false"));
        expect(getStoredToken()).toBeNull();
    });

    it("ignores non-401 errors while validating the stored token", async () => {
        setStoredToken("stored-token");
        (api.authFetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network down"));

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>,
        );

        await waitFor(() => expect(screen.getByTestId("validating").textContent).toBe("false"));
        expect(screen.getByTestId("authenticated").textContent).toBe("true");
    });

    it("login() stores the token and marks the session as authenticated", async () => {
        (api.login as ReturnType<typeof vi.fn>).mockResolvedValue({
            accessToken: "new-token",
            account: { id: "acc-1", email: "ana@example.com" },
        });

        const user = userEvent.setup();
        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>,
        );

        await user.click(screen.getByText("login"));

        await waitFor(() => expect(screen.getByTestId("authenticated").textContent).toBe("true"));
        expect(getStoredToken()).toBe("new-token");
    });

    it("logout() clears the token and marks the session as unauthenticated", async () => {
        setStoredToken("stored-token");
        (api.authFetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true } as Response);

        const user = userEvent.setup();
        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>,
        );

        await waitFor(() => expect(screen.getByTestId("authenticated").textContent).toBe("true"));
        await user.click(screen.getByText("logout"));

        expect(screen.getByTestId("authenticated").textContent).toBe("false");
        expect(getStoredToken()).toBeNull();
    });

    it("useAuth throws when used outside of an AuthProvider", () => {
        function Broken() {
            useAuth();
            return null;
        }

        expect(() => render(<Broken />)).toThrow("useAuth must be used within an AuthProvider");
    });
});
