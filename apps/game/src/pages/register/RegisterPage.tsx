import { LuvIcon, LuvInput, LuvModal, luviaLogo } from "luv-ui";
import { termsOfUseText } from "./terms";
import { useRegisterPageController } from "./RegisterPage.controller";

type RegisterPageProps = {
    onNavigateToLogin?: () => void;
};

export function RegisterPage({ onNavigateToLogin }: RegisterPageProps) {
    const {
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
    } = useRegisterPageController({ onNavigateToLogin });

    return (
        <div className="d-flex flex-col items-center justify-center w-full h-full p-24">
            <img src={luviaLogo} alt="Luvia" className="w-50-p max-w-640" />
            <form onSubmit={handleSubmit} className="card d-flex flex-col gap w-50-p items-center">
                <div className="d-flex items-center gap-8 w-full">
                    {onNavigateToLogin && (
                        <button
                            type="button"
                            className="outline primary circle w-40 h-40"
                            aria-label="Voltar para login"
                            onClick={onNavigateToLogin}
                        >
                            <LuvIcon name="arrow_back" />
                        </button>
                    )}
                    <h1 className="text-text">Criar conta</h1>
                </div>
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
                                className="text-secondary-text   cursor-pointer"
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
                onClose={closeTerms}
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
