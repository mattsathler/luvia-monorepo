import { useState, type FormEvent, type KeyboardEvent } from "react";
import { showSnackbar } from "luv-ui";
import { ApiError, register } from "../../lib/api";

type UseRegisterPageControllerParams = {
    onNavigateToLogin?: () => void;
};

export function useRegisterPageController({ onNavigateToLogin }: UseRegisterPageControllerParams) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function openTerms() {
        setIsTermsOpen(true);
    }

    function closeTerms() {
        setIsTermsOpen(false);
    }

    function handleTermsKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openTerms();
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        setIsSubmitting(true);

        try {
            await register(email, password);
            showSnackbar("Conta criada com sucesso! Faça login usando suas credenciais.", {
                variant: "success",
                duration: 7000,
            });
            onNavigateToLogin?.();
        } catch (err) {
            if (err instanceof ApiError && err.message === "Email already in use") {
                setError("Este email já está cadastrado.");
            } else {
                setError("Não foi possível criar sua conta. Tente novamente.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return {
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        acceptedTerms,
        setAcceptedTerms,
        isTermsOpen,
        openTerms,
        closeTerms,
        handleTermsKeyDown,
        error,
        isSubmitting,
        handleSubmit,
    };
}
