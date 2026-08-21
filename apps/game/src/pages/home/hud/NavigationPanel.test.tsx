import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NavigationPanel } from "./NavigationPanel";

describe("NavigationPanel", () => {
    it("shows all five navigation options", () => {
        render(<NavigationPanel />);

        expect(screen.getByText("Carreira")).toBeInTheDocument();
        expect(screen.getByText("Relações")).toBeInTheDocument();
        expect(screen.getByText("Loja")).toBeInTheDocument();
        expect(screen.getByText("Perfil")).toBeInTheDocument();
        expect(screen.getByText("Configurações")).toBeInTheDocument();
    });

    it("logs the selected option when clicked (no screen behind it yet)", async () => {
        const user = userEvent.setup();
        const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

        render(<NavigationPanel />);
        await user.click(screen.getByText("Carreira"));

        expect(logSpy).toHaveBeenCalledWith("Navegar para:", "career");

        logSpy.mockRestore();
    });
});
