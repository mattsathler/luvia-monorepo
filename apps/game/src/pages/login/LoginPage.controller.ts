import { useState, type FormEvent } from "react";
import { useAuth } from "../../auth/AuthContext";
import { ApiError, UnauthorizedError } from "../../lib/api";
import { showSnackbar } from "luv-ui";

export function useLoginPageController() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await login(email, password);
            showSnackbar("Bem vindo ao Luvia!", { variant: "success", duration: 7000 });
        } catch (err) {
            if (err instanceof UnauthorizedError || err instanceof ApiError) {
                setError("Email ou senha inválidos.");
            } else {
                setError("Não foi possível conectar. Tente novamente.");
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
        error,
        isSubmitting,
        handleSubmit,
    };
}
