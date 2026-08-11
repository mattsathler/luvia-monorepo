import { LuvInput, luviaLogo } from "luv-ui";
import { useLoginPageController } from "./LoginPage.controller";

type LoginPageProps = {
    onNavigateToRegister?: () => void;
};

export function LoginPage({ onNavigateToRegister }: LoginPageProps = {}) {
    const { email, setEmail, password, setPassword, error, isSubmitting, handleSubmit } = useLoginPageController();

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
