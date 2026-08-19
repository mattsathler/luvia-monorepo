import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from "react";
import "./Stepper.scss";

export type LuvStep = {
    id: string;
    label: string;
};

export type LuvStepperContextValue = {
    steps: LuvStep[];
    activeStep: string;
    activeIndex: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    goToStep: (stepId: string) => void;
    goNext: () => void;
    goBack: () => void;
};

const LuvStepperContext = createContext<LuvStepperContextValue | undefined>(undefined);

// Diferente de Tabs (que casa conteúdo e navegação via children diretos), o
// Stepper expõe seu estado por contexto — o conteúdo de cada passo pode viver
// em qualquer lugar da árvore, não precisa estar logo abaixo de LuvStepper.
export function useLuvStepper(): LuvStepperContextValue {
    const context = useContext(LuvStepperContext);

    if (!context) {
        throw new Error("useLuvStepper must be used within a LuvStepper");
    }

    return context;
}

export type LuvStepperProps = {
    steps: LuvStep[];
    activeStep: string;
    onStepChange: (stepId: string) => void;
    // Passos que já têm dados salvos — controlam o que é clicável no
    // indicador, já que voltar não deve implicar perder o que foi persistido.
    completedSteps?: string[];
    // Cor de destaque do passo ativo/concluído (ex.: "primary", "game-teal") —
    // uma chave de $color-keys em _colors.scss. Sem isso, usa o padrão
    // (--theme para o ativo, --primary para os concluídos).
    color?: string;
    children?: ReactNode;
};

export function LuvStepper({ steps, activeStep, onStepChange, completedSteps = [], color, children }: LuvStepperProps) {
    const style = color ? ({ "--luv-stepper-color": `var(--${color})` } as CSSProperties) : undefined;
    const activeIndex = steps.findIndex((step) => step.id === activeStep);

    function goToStep(stepId: string) {
        onStepChange(stepId);
    }

    function goNext() {
        const next = steps[activeIndex + 1];

        if (next) {
            onStepChange(next.id);
        }
    }

    function goBack() {
        const previous = steps[activeIndex - 1];

        if (previous) {
            onStepChange(previous.id);
        }
    }

    const value = useMemo<LuvStepperContextValue>(
        () => ({
            steps,
            activeStep,
            activeIndex,
            isFirstStep: activeIndex <= 0,
            isLastStep: activeIndex === steps.length - 1,
            goToStep,
            goNext,
            goBack,
        }),
        [steps, activeStep, activeIndex],
    );

    return (
        <LuvStepperContext.Provider value={value}>
            <div className="luv-stepper" style={style}>
                <ol className="luv-stepper-track">
                    {steps.map((step, index) => {
                        const isActive = step.id === activeStep;
                        const isCompleted = completedSteps.includes(step.id);
                        const isReachable = isActive || isCompleted;

                        return (
                            <li
                                key={step.id}
                                className={["luv-stepper-item", isActive && "active", isCompleted && "completed"]
                                    .filter(Boolean)
                                    .join(" ")}
                            >
                                <button
                                    type="button"
                                    className="luv-stepper-marker"
                                    aria-current={isActive ? "step" : undefined}
                                    aria-label={step.label}
                                    disabled={!isReachable}
                                    onClick={() => goToStep(step.id)}
                                >
                                    {isCompleted && !isActive ? "✓" : index + 1}
                                </button>
                                <span className="luv-stepper-label">{step.label}</span>
                            </li>
                        );
                    })}
                </ol>
                {children}
            </div>
        </LuvStepperContext.Provider>
    );
}
