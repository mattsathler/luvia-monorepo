import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { showSnackbar } from "luv-ui";
import { RegisterPage } from "./RegisterPage";
import { ApiError, register } from "../../lib/api";

vi.mock("../../lib/api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../lib/api")>();
    return {
        ...actual,
        register: vi.fn(),
    };
});

vi.mock("luv-ui", async (importOriginal) => {
    const actual = await importOriginal<typeof import("luv-ui")>();
    return {
        ...actual,
        showSnackbar: vi.fn(),
    };
});

async function fillForm(user: ReturnType<typeof userEvent.setup>, password = "correct-horse") {
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), password);
    await user.type(screen.getByLabelText("Confirmar senha"), password);
}

describe("RegisterPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("keeps the submit button disabled until the terms checkbox is accepted", async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);

        await fillForm(user);

        expect(screen.getByRole("button", { name: "Criar conta" })).toBeDisabled();

        await user.click(screen.getByRole("checkbox"));

        expect(screen.getByRole("button", { name: "Criar conta" })).toBeEnabled();
    });

    it("opens the terms modal when the link is clicked and shows the document", async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

        await user.click(screen.getByText("Termo de Responsabilidade e Uso"));

        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveTextContent("TERMO DE RESPONSABILIDADE E USO");
    });

    it("opens the terms modal via keyboard", async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);

        screen.getByText("Termo de Responsabilidade e Uso").focus();
        await user.keyboard("{Enter}");

        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("opens the terms modal when pressing space", async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);

        screen.getByText("Termo de Responsabilidade e Uso").focus();
        await user.keyboard(" ");

        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("ignores unrelated keys on the terms link", async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);

        screen.getByText("Termo de Responsabilidade e Uso").focus();
        await user.keyboard("a");

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes the terms modal", async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);

        await user.click(screen.getByText("Termo de Responsabilidade e Uso"));
        await user.click(screen.getByRole("button", { name: "Fechar" }));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("shows an error and does not submit when passwords do not match", async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);

        await user.type(screen.getByLabelText("Email"), "ana@example.com");
        await user.type(screen.getByLabelText("Senha"), "correct-horse");
        await user.type(screen.getByLabelText("Confirmar senha"), "different");
        await user.click(screen.getByRole("checkbox"));
        await user.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(await screen.findByText("As senhas não coincidem.")).toBeInTheDocument();
        expect(register).not.toHaveBeenCalled();
    });

    it("registers, shows a success snackbar and redirects to login", async () => {
        (register as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "1", email: "ana@example.com" });
        const onNavigateToLogin = vi.fn();
        const user = userEvent.setup();

        render(<RegisterPage onNavigateToLogin={onNavigateToLogin} />);

        await fillForm(user);
        await user.click(screen.getByRole("checkbox"));
        await user.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(register).toHaveBeenCalledWith("ana@example.com", "correct-horse");
        expect(showSnackbar).toHaveBeenCalledWith("Conta criada com sucesso! Faça login usando suas credenciais.", {
            variant: "success",
            duration: 7000,
        });
        expect(onNavigateToLogin).toHaveBeenCalledTimes(1);
    });

    it("does not error when no navigation handler is provided on success", async () => {
        (register as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "1", email: "ana@example.com" });
        const user = userEvent.setup();

        render(<RegisterPage />);

        await fillForm(user);
        await user.click(screen.getByRole("checkbox"));
        await user.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(showSnackbar).toHaveBeenCalledWith("Conta criada com sucesso! Faça login usando suas credenciais.", {
            variant: "success",
            duration: 7000,
        });
    });

    it("shows a specific error message when the email is already registered", async () => {
        (register as ReturnType<typeof vi.fn>).mockRejectedValue(new ApiError("Email already in use"));
        const user = userEvent.setup();

        render(<RegisterPage />);

        await fillForm(user);
        await user.click(screen.getByRole("checkbox"));
        await user.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(await screen.findByText("Este email já está cadastrado.")).toBeInTheDocument();
    });

    it("shows a generic error message for unexpected failures", async () => {
        (register as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network down"));
        const user = userEvent.setup();

        render(<RegisterPage />);

        await fillForm(user);
        await user.click(screen.getByRole("checkbox"));
        await user.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(await screen.findByText("Não foi possível criar sua conta. Tente novamente.")).toBeInTheDocument();
    });

    it("does not render the login link when no handler is provided", () => {
        render(<RegisterPage />);

        expect(screen.queryByText("Já tem conta? Entrar")).not.toBeInTheDocument();
    });

    it("navigates to login when the link is clicked", async () => {
        const onNavigateToLogin = vi.fn();
        const user = userEvent.setup();

        render(<RegisterPage onNavigateToLogin={onNavigateToLogin} />);

        await user.click(screen.getByText("Já tem conta? Entrar"));

        expect(onNavigateToLogin).toHaveBeenCalledTimes(1);
    });

    it("navigates to login via keyboard", async () => {
        const onNavigateToLogin = vi.fn();
        const user = userEvent.setup();

        render(<RegisterPage onNavigateToLogin={onNavigateToLogin} />);

        screen.getByText("Já tem conta? Entrar").focus();
        await user.keyboard("{Enter}");

        expect(onNavigateToLogin).toHaveBeenCalledTimes(1);
    });

    it("navigates to login when pressing space", async () => {
        const onNavigateToLogin = vi.fn();
        const user = userEvent.setup();

        render(<RegisterPage onNavigateToLogin={onNavigateToLogin} />);

        screen.getByText("Já tem conta? Entrar").focus();
        await user.keyboard(" ");

        expect(onNavigateToLogin).toHaveBeenCalledTimes(1);
    });

    it("ignores unrelated keys on the login link", async () => {
        const onNavigateToLogin = vi.fn();
        const user = userEvent.setup();

        render(<RegisterPage onNavigateToLogin={onNavigateToLogin} />);

        screen.getByText("Já tem conta? Entrar").focus();
        await user.keyboard("a");

        expect(onNavigateToLogin).not.toHaveBeenCalled();
    });
});
