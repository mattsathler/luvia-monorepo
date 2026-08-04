import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { showSnackbar } from "luv-ui";
import { LoginPage } from "./LoginPage";
import { useAuth } from "../../auth/AuthContext";
import { ApiError, UnauthorizedError } from "../../lib/api";

vi.mock("../../auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("luv-ui", async (importOriginal) => {
    const actual = await importOriginal<typeof import("luv-ui")>();
    return {
        ...actual,
        showSnackbar: vi.fn(),
    };
});

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

        await user.type(screen.getByLabelText("Email"), "ana@example.com");
        await user.type(screen.getByLabelText("Senha"), "correct-horse");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(loginMock).toHaveBeenCalledWith("ana@example.com", "correct-horse");
    });

    it("shows a welcome snackbar on successful login", async () => {
        loginMock.mockResolvedValue(undefined);
        const user = userEvent.setup();

        render(<LoginPage />);

        await user.type(screen.getByLabelText("Email"), "ana@example.com");
        await user.type(screen.getByLabelText("Senha"), "correct-horse");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(showSnackbar).toHaveBeenCalledWith("Bem vindo ao Luvia!", { variant: "success" });
    });

    it("does not show the welcome snackbar when login fails", async () => {
        loginMock.mockRejectedValue(new UnauthorizedError());
        const user = userEvent.setup();

        render(<LoginPage />);

        await user.type(screen.getByLabelText("Email"), "ana@example.com");
        await user.type(screen.getByLabelText("Senha"), "wrong");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        await screen.findByText("Email ou senha inválidos.");
        expect(showSnackbar).not.toHaveBeenCalled();
    });

    it("shows a credentials error message on UnauthorizedError", async () => {
        loginMock.mockRejectedValue(new UnauthorizedError());
        const user = userEvent.setup();

        render(<LoginPage />);
        await user.type(screen.getByLabelText("Email"), "ana@example.com");
        await user.type(screen.getByLabelText("Senha"), "wrong");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(await screen.findByText("Email ou senha inválidos.")).toBeInTheDocument();
    });

    it("shows a credentials error message on ApiError", async () => {
        loginMock.mockRejectedValue(new ApiError("Email already in use"));
        const user = userEvent.setup();

        render(<LoginPage />);
        await user.type(screen.getByLabelText("Email"), "ana@example.com");
        await user.type(screen.getByLabelText("Senha"), "whatever");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(await screen.findByText("Email ou senha inválidos.")).toBeInTheDocument();
    });

    it("shows a generic connection error message on unexpected errors", async () => {
        loginMock.mockRejectedValue(new Error("network down"));
        const user = userEvent.setup();

        render(<LoginPage />);
        await user.type(screen.getByLabelText("Email"), "ana@example.com");
        await user.type(screen.getByLabelText("Senha"), "whatever");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(await screen.findByText("Não foi possível conectar. Tente novamente.")).toBeInTheDocument();
    });
});
