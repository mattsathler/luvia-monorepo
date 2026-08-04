import { AuthProvider, useAuth } from "./auth/AuthContext";
import { LoginPage } from "./pages/login/LoginPage";

function AppContent() {
    const { isAuthenticated, isValidating, logout } = useAuth();

    if (isValidating) {
        return (
            <div className="d-flex flex-col items-center justify-center w-full h-full">
                <span className="text-text">Carregando...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return (
        <div className="d-flex flex-col gap p-24">
            <p className="text-text">Você está logado.</p>
            <button className="outline primary" onClick={logout}>
                Sair
            </button>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
