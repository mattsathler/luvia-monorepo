import { useState, type FormEvent, type KeyboardEvent } from "react";
import { LuvInput, LuvModal, luviaLogo, showSnackbar } from "luv-ui";
import { ApiError, register } from "../../lib/api";
import { termsOfUseText } from "./terms";

type RegisterPageProps = {
    onNavigateToLogin?: () => void;
};

export function RegisterPage({ onNavigateToLogin }: RegisterPageProps) {
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

    return (
        <div className="d-flex flex-col items-center justify-center w-full h-full p-24">
            <img src={luviaLogo} alt="Luvia" className="w-50-p max-w-640" />
            <form onSubmit={handleSubmit} className="card d-flex flex-col gap w-50-p items-center">
                <h1 className="text-text">Criar conta</h1>
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
                                minLength={8}
                                required
                            />
                        </div>
                        <div className="d-flex flex-col gap-8">
                            <LuvInput
                                type="password"
                                label="Confirmar senha"
                                placeholder="Digite sua senha novamente"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                minLength={8}
                                required
                            />
                        </div>
                    </div>

                    <label className="d-flex items-center gap-8 w-full">
                        <input
                            type="checkbox"
                            className="checkbox"
                            checked={acceptedTerms}
                            onChange={(event) => setAcceptedTerms(event.target.checked)}
                            required
                        />
                        <span className="text-text">
                            Li e aceito o{" "}
                            <span
                                role="button"
                                tabIndex={0}
                                className="text-secondary-text text-bold cursor-pointer"
                                onClick={openTerms}
                                onKeyDown={handleTermsKeyDown}
                            >
                                Termo de Responsabilidade e Uso
                            </span>
                        </span>
                    </label>

                    {error && (
                        <div className="card error w-full p-16">
                            <span></span>
                            <strong className="text-primary">{error}</strong>
                        </div>
                    )}

                    <button type="submit" className="primary" disabled={isSubmitting || !acceptedTerms}>
                        {isSubmitting ? "Criando conta..." : "Criar conta"}
                    </button>

                    {onNavigateToLogin && (
                        <span
                            role="button"
                            tabIndex={0}
                            className="text-secondary-text cursor-pointer"
                            onClick={onNavigateToLogin}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    onNavigateToLogin();
                                }
                            }}
                        >
                            Já tem conta? Entrar
                        </span>
                    )}
                </div>
            </form>

            <LuvModal
                isOpen={isTermsOpen}
                onClose={() => setIsTermsOpen(false)}
                title="Termo de Responsabilidade e Uso"
                size="large"
            >
                <div className="d-flex flex-col gap-16 h-60-vh scroll-y">
                    <pre className="text-text" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {termsOfUseText}
                    </pre>
                </div>
            </LuvModal>
        </div>
    );
}
