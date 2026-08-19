import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LuvStepper, useLuvStepper, type LuvStep } from "./LuvStepper";
import { LuvStepperStep } from "./LuvStepperStep";

const STEPS: LuvStep[] = [
    { id: "info", label: "Informações" },
    { id: "appearance", label: "Aparência" },
    { id: "skills", label: "Habilidades" },
];

describe("LuvStepper", () => {
    it("renders every step's label", () => {
        render(<LuvStepper steps={STEPS} activeStep="info" onStepChange={vi.fn()} />);

        expect(screen.getByText("Informações")).toBeInTheDocument();
        expect(screen.getByText("Aparência")).toBeInTheDocument();
        expect(screen.getByText("Habilidades")).toBeInTheDocument();
    });

    it("marks the active step for assistive tech", () => {
        render(<LuvStepper steps={STEPS} activeStep="appearance" onStepChange={vi.fn()} />);

        expect(screen.getByRole("button", { name: "Aparência" })).toHaveAttribute("aria-current", "step");
        expect(screen.getByRole("button", { name: "Informações" })).not.toHaveAttribute("aria-current");
    });

    it("shows a checkmark for completed steps", () => {
        render(
            <LuvStepper steps={STEPS} activeStep="skills" onStepChange={vi.fn()} completedSteps={["info", "appearance"]} />,
        );

        expect(screen.getByRole("button", { name: "Informações" })).toHaveTextContent("✓");
        expect(screen.getByRole("button", { name: "Aparência" })).toHaveTextContent("✓");
        expect(screen.getByRole("button", { name: "Habilidades" })).toHaveTextContent("3");
    });

    it("lets the player jump back to a completed step", async () => {
        const onStepChange = vi.fn();
        const user = userEvent.setup();
        render(
            <LuvStepper steps={STEPS} activeStep="skills" onStepChange={onStepChange} completedSteps={["info", "appearance"]} />,
        );

        await user.click(screen.getByRole("button", { name: "Informações" }));

        expect(onStepChange).toHaveBeenCalledWith("info");
    });

    it("does not let the player skip ahead to a step that isn't reachable yet", async () => {
        const onStepChange = vi.fn();
        const user = userEvent.setup();
        render(<LuvStepper steps={STEPS} activeStep="info" onStepChange={onStepChange} />);

        await user.click(screen.getByRole("button", { name: "Habilidades" }));

        expect(onStepChange).not.toHaveBeenCalled();
    });

    it("renders step content placed anywhere in the tree, not just as a direct child", () => {
        render(
            <LuvStepper steps={STEPS} activeStep="appearance" onStepChange={vi.fn()}>
                <div className="some-unrelated-layout-wrapper">
                    <aside>
                        <LuvStepperStep step="info">Formulário de informações</LuvStepperStep>
                        <LuvStepperStep step="appearance">Formulário de aparência</LuvStepperStep>
                        <LuvStepperStep step="skills">Formulário de habilidades</LuvStepperStep>
                    </aside>
                </div>
            </LuvStepper>,
        );

        expect(screen.queryByText("Formulário de informações")).not.toBeInTheDocument();
        expect(screen.getByText("Formulário de aparência")).toBeInTheDocument();
        expect(screen.queryByText("Formulário de habilidades")).not.toBeInTheDocument();
    });

    it("applies the color prop as a CSS custom property on the root", () => {
        const { container } = render(
            <LuvStepper steps={STEPS} activeStep="info" onStepChange={vi.fn()} color="game-teal" />,
        );

        expect(container.querySelector(".luv-stepper")).toHaveStyle({ "--luv-stepper-color": "var(--game-teal)" });
    });

    it("does not set the custom color property when color isn't provided", () => {
        const { container } = render(<LuvStepper steps={STEPS} activeStep="info" onStepChange={vi.fn()} />);

        expect(container.querySelector(".luv-stepper")).not.toHaveAttribute("style");
    });

    it("useLuvStepper throws when used outside of a LuvStepper", () => {
        function Broken() {
            useLuvStepper();
            return null;
        }

        expect(() => render(<Broken />)).toThrow("useLuvStepper must be used within a LuvStepper");
    });

    it("exposes goNext, goBack and boundary flags through useLuvStepper", async () => {
        function Consumer() {
            const { activeStep, isFirstStep, isLastStep, goNext, goBack } = useLuvStepper();

            return (
                <div>
                    <span data-testid="active">{activeStep}</span>
                    <span data-testid="first">{String(isFirstStep)}</span>
                    <span data-testid="last">{String(isLastStep)}</span>
                    <button onClick={goNext}>next</button>
                    <button onClick={goBack}>back</button>
                </div>
            );
        }

        function Wrapper() {
            const [step, setStep] = useState("info");
            return (
                <LuvStepper steps={STEPS} activeStep={step} onStepChange={setStep} completedSteps={STEPS.map((s) => s.id)}>
                    <Consumer />
                </LuvStepper>
            );
        }

        const user = userEvent.setup();
        render(<Wrapper />);

        expect(screen.getByTestId("first").textContent).toBe("true");
        expect(screen.getByTestId("last").textContent).toBe("false");

        await user.click(screen.getByText("next"));
        expect(screen.getByTestId("active").textContent).toBe("appearance");

        await user.click(screen.getByText("next"));
        expect(screen.getByTestId("active").textContent).toBe("skills");
        expect(screen.getByTestId("last").textContent).toBe("true");

        await user.click(screen.getByText("back"));
        expect(screen.getByTestId("active").textContent).toBe("appearance");
    });
});
