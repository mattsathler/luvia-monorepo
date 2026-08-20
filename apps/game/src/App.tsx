import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { SnackbarProvider } from "luv-ui";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { CharacterProvider, useCharacter } from "./character/CharacterContext";
import { LoginPage } from "./pages/login/LoginPage";
import { RegisterPage } from "./pages/register/RegisterPage";
import { CharacterSelectPage } from "./pages/character-select/CharacterSelectPage";
import { CharacterCreatePage } from "./pages/character-create/CharacterCreatePage";
import { HomePage } from "./pages/home/HomePage";

function RequireGuest({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/characters" replace /> : <>{children}</>;
}

function RequireAuth({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireCharacter({ children }: { children: ReactNode }) {
    const { character } = useCharacter();
    return character ? <>{children}</> : <Navigate to="/characters" replace />;
}

// O personagem selecionado só existe em memória (CharacterContext não
// persiste entre recarregamentos), então numa visita fresca a "/" ele
// sempre começa nulo — não há necessidade de checar aqui, só a sessão.
function RootRedirect() {
    const { isAuthenticated } = useAuth();
    return <Navigate to={isAuthenticated ? "/characters" : "/login"} replace />;
}

function LoginRoute() {
    const navigate = useNavigate();
    return <LoginPage onNavigateToRegister={() => navigate("/register")} />;
}

function RegisterRoute() {
    const navigate = useNavigate();
    return <RegisterPage onNavigateToLogin={() => navigate("/login")} />;
}

function CharacterSelectRoute() {
    const navigate = useNavigate();
    const { selectCharacter } = useCharacter();

    return (
        <CharacterSelectPage
            onCharacterSelected={(character) => {
                selectCharacter(character);
                navigate("/play");
            }}
            onCreateNew={() => navigate("/characters/new")}
        />
    );
}

function CharacterCreateRoute() {
    const navigate = useNavigate();
    const { selectCharacter } = useCharacter();

    return (
        <CharacterCreatePage
            onCharacterCreated={(character) => {
                selectCharacter(character);
                navigate("/play");
            }}
            onCancel={() => navigate("/characters")}
        />
    );
}

function PlayRoute() {
    const { character } = useCharacter();

    // Só renderiza dentro de RequireCharacter, que já garante um personagem
    // não nulo — a asserção evita repetir esse check aqui.
    return <HomePage character={character!} />;
}

function AppRoutes() {
    const { isValidating } = useAuth();

    if (isValidating) {
        return (
            <div className="d-flex flex-col items-center justify-center w-full h-full max-w-640">
                <span className="text-text">Carregando...</span>
            </div>
        );
    }

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <RequireGuest>
                        <LoginRoute />
                    </RequireGuest>
                }
            />
            <Route
                path="/register"
                element={
                    <RequireGuest>
                        <RegisterRoute />
                    </RequireGuest>
                }
            />
            <Route
                path="/characters"
                element={
                    <RequireAuth>
                        <CharacterSelectRoute />
                    </RequireAuth>
                }
            />
            <Route
                path="/characters/new"
                element={
                    <RequireAuth>
                        <CharacterCreateRoute />
                    </RequireAuth>
                }
            />
            <Route
                path="/play"
                element={
                    <RequireAuth>
                        <RequireCharacter>
                            <PlayRoute />
                        </RequireCharacter>
                    </RequireAuth>
                }
            />
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <CharacterProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
                <SnackbarProvider />
            </CharacterProvider>
        </AuthProvider>
    );
}

export default App;
