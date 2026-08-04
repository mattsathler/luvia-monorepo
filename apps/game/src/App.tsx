import { SnackbarProvider } from "luv-ui";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { LoginPage } from "./pages/login/LoginPage";
import { HomePage } from "./pages/home/HomePage";

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

    return HomePage()
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
            <SnackbarProvider />
        </AuthProvider>
    );
}

export default App;
