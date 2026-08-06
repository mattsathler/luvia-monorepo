import type { ReactNode } from "react";
import { useLuvStepper } from "./LuvStepper";

export type LuvStepperStepProps = {
    step: string;
    children: ReactNode;
};

// Renderiza `children` só quando `step` é o passo ativo. Como consulta o
// contexto em vez de depender da posição no JSX, pode ser colocado em
// qualquer lugar dentro de um LuvStepper — inclusive dentro de outros
// wrappers de layout — sem precisar ser filho direto.
export function LuvStepperStep({ step, children }: LuvStepperStepProps) {
    const { activeStep } = useLuvStepper();

    return activeStep === step ? <>{children}</> : null;
}
