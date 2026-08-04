import { useState } from "react";
import { SnackbarProvider } from "luv-ui";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { LoginPage } from "./pages/login/LoginPage";
import { RegisterPage } from "./pages/register/RegisterPage";
import { HomePage } from "./pages/home/HomePage";

function AppContent() {
    const { isAuthenticated, isValidating } = useAuth();
    const [authView, setAuthView] = useState<"login" | "register">("login");

    if (isValidating) {
        return (
            <div className="d-flex flex-col items-center justify-center w-full h-full">
                <span className="text-text">Carregando...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return authView === "login" ? (
            <LoginPage onNavigateToRegister={() => setAuthView("register")} />
        ) : (
            <RegisterPage onNavigateToLogin={() => setAuthView("login")} />
        );
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
