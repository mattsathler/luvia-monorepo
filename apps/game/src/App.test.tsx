import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import * as api from "./lib/api";
import { clearStoredToken, setStoredToken } from "./auth/token-storage";

vi.mock("./lib/api", async (importOriginal) => {
    const actual = await importOriginal<typeof api>();
    return {
        ...actual,
        login: vi.fn(),
        authFetch: vi.fn(),
    };
});

describe("App", () => {
    beforeEach(() => {
        clearStoredToken();
        vi.clearAllMocks();
    });

    it("shows the login page when there is no session", async () => {
        render(<App />);

        expect(await screen.findByRole("heading", { name: "Entrar" })).toBeInTheDocument();
    });

    it("shows the authenticated content when there is a valid session", async () => {
        setStoredToken("stored-token");
        (api.authFetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true } as Response);

        render(<App />);

        expect(await screen.findByText("Você está logado.")).toBeInTheDocument();
    });

    it("logs out and returns to the login page", async () => {
        setStoredToken("stored-token");
        (api.authFetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true } as Response);
        const user = userEvent.setup();

        render(<App />);
        await screen.findByText("Você está logado.");

        await user.click(screen.getByRole("button", { name: "Sair" }));

        expect(await screen.findByRole("heading", { name: "Entrar" })).toBeInTheDocument();
    });
});
