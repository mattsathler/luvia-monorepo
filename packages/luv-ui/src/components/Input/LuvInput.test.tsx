import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LuvInput } from "./LuvInput";

describe("LuvInput", () => {
    it("renders a label associated with the input", () => {
        render(<LuvInput label="Email" />);

        const input = screen.getByLabelText("Email");
        expect(input).toBeInTheDocument();
    });

    it("does not render a label when none is provided", () => {
        render(<LuvInput placeholder="Digite algo" />);

        expect(screen.queryByText("Email")).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText("Digite algo")).toBeInTheDocument();
    });

    it("renders the provided icon", () => {
        render(<LuvInput label="Email" icon={<span data-testid="icon">*</span>} />);

        expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("does not render an icon slot when none is provided", () => {
        const { container } = render(<LuvInput label="Email" />);

        expect(container.querySelector("span")).not.toBeInTheDocument();
    });

    it("renders an error message and marks the input as invalid", () => {
        render(<LuvInput label="Email" error="Email inválido" />);

        expect(screen.getByRole("alert")).toHaveTextContent("Email inválido");
        expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    });

    it("does not render an error message when none is provided", () => {
        render(<LuvInput label="Email" />);

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "false");
    });

    it("uses the provided id instead of generating one", () => {
        render(<LuvInput label="Email" id="custom-id" />);

        expect(screen.getByLabelText("Email")).toHaveAttribute("id", "custom-id");
    });

    it("generates an id when none is provided", () => {
        render(<LuvInput label="Email" />);

        expect(screen.getByLabelText("Email").getAttribute("id")).toBeTruthy();
    });

    it("forwards a ref to the underlying input element", () => {
        const ref = createRef<HTMLInputElement>();
        render(<LuvInput label="Email" ref={ref} />);

        expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it("forwards native input props such as onChange", async () => {
        const handleChange = vi.fn();
        render(<LuvInput label="Email" onChange={handleChange} />);

        await userEvent.type(screen.getByLabelText("Email"), "a");

        expect(handleChange).toHaveBeenCalled();
    });

    it("adds the border-error class to the input when there is an error", () => {
        render(<LuvInput label="Email" error="Email inválido" />);

        expect(screen.getByLabelText("Email")).toHaveClass("border-error");
    });

    it("merges a custom className with the base classes", () => {
        render(<LuvInput label="Email" error="Email inválido" className="custom-class" />);

        const input = screen.getByLabelText("Email");
        expect(input).toHaveClass("custom-class");
        expect(input).toHaveClass("border-error");
    });
});
