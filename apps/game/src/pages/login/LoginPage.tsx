import { useState, type FormEvent } from "react";
import { useAuth } from "../../auth/AuthContext";
import { ApiError, UnauthorizedError } from "../../lib/api";
import { LuvInput, luviaLogo, showSnackbar } from "luv-ui";

type LoginPageProps = {
    onNavigateToRegister?: () => void;
};

export function LoginPage({ onNavigateToRegister }: LoginPageProps = {}) {
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

    return (
        <div className="d-flex flex-col items-center justify-center w-full h-full p-24">
            <img src={luviaLogo} alt="Luvia" className="w-50-p max-w-640" />
            <form onSubmit={handleSubmit} className="card d-flex flex-col gap w-50-p items-center">
                <h1 className="text-text">Entrar</h1>
                <div className="d-flex w-full flex-col gap items-end">
                    <div className="d-flex flex-col gap w-full">
                        <div className="d-flex flex-col gap-8">
                            <LuvInput
                                type="text"
                                label="Email"
                                placeholder="Digite seu email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </div>
                        <div className="d-flex flex-col gap-8">
                            <LuvInput
                                type="password"
                                label="Senha"
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="card error w-full p-16">
                            <span></span>
                            <strong className="text-primary">{error}</strong>
                        </div>
                    )}

                    <button type="submit" className="primary" disabled={isSubmitting}>
                        {isSubmitting ? "Entrando..." : "Entrar"}
                    </button>

                    <span>
                        Não tem conta?
                        {onNavigateToRegister && (
                            <strong
                                role="button"
                                tabIndex={0}
                                className="text-secondary-text cursor-pointer ml-4"
                                onClick={onNavigateToRegister}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        onNavigateToRegister();
                                    }
                                }}
                            >
                                Cadastre-se
                            </strong>
                        )}
                    </span>
                </div>
            </form>
        </div>
    );
}
