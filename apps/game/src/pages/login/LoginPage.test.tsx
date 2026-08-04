import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "./LoginPage";
import { useAuth } from "../../auth/AuthContext";
import { ApiError, UnauthorizedError } from "../../lib/api";

vi.mock("../../auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));

describe("LoginPage", () => {
    const loginMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ login: loginMock });
    });

    it("submits the entered credentials", async () => {
        loginMock.mockResolvedValue(undefined);
        const user = userEvent.setup();

        render(<LoginPage />);

        await user.type(screen.getByPlaceholderText("Email"), "ana@example.com");
        await user.type(screen.getByPlaceholderText("Senha"), "correct-horse");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(loginMock).toHaveBeenCalledWith("ana@example.com", "correct-horse");
    });

    it("shows a credentials error message on UnauthorizedError", async () => {
        loginMock.mockRejectedValue(new UnauthorizedError());
        const user = userEvent.setup();

        render(<LoginPage />);
        await user.type(screen.getByPlaceholderText("Email"), "ana@example.com");
        await user.type(screen.getByPlaceholderText("Senha"), "wrong");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(await screen.findByText("Email ou senha inválidos.")).toBeInTheDocument();
    });

    it("shows a credentials error message on ApiError", async () => {
        loginMock.mockRejectedValue(new ApiError("Email already in use"));
        const user = userEvent.setup();

        render(<LoginPage />);
        await user.type(screen.getByPlaceholderText("Email"), "ana@example.com");
        await user.type(screen.getByPlaceholderText("Senha"), "whatever");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(await screen.findByText("Email ou senha inválidos.")).toBeInTheDocument();
    });

    it("shows a generic connection error message on unexpected errors", async () => {
        loginMock.mockRejectedValue(new Error("network down"));
        const user = userEvent.setup();

        render(<LoginPage />);
        await user.type(screen.getByPlaceholderText("Email"), "ana@example.com");
        await user.type(screen.getByPlaceholderText("Senha"), "whatever");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(await screen.findByText("Não foi possível conectar. Tente novamente.")).toBeInTheDocument();
    });
});
