import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { login as loginRequest, authFetch, UnauthorizedError } from "../lib/api";
import { getStoredToken, setStoredToken, clearStoredToken } from "./token-storage";

export type AuthState = {
    accessToken: string | null;
    isAuthenticated: boolean;
    isValidating: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(() => getStoredToken());
    const [isValidating, setIsValidating] = useState<boolean>(() => getStoredToken() !== null);

    // Se já existe um token guardado, confirma que ele ainda é válido antes de
    // deixar o jogador entrar direto — token expirado deve cair no login.
    useEffect(() => {
        const token = getStoredToken();

        if (!token) {
            setIsValidating(false);
            return;
        }

        authFetch("/characters/mine", token)
            .catch((error: unknown) => {
                if (error instanceof UnauthorizedError) {
                    clearStoredToken();
                    setAccessToken(null);
                }
            })
            .finally(() => setIsValidating(false));
    }, []);

    async function login(email: string, password: string) {
        const { accessToken: token } = await loginRequest(email, password);
        setStoredToken(token);
        setAccessToken(token);
    }

    function logout() {
        clearStoredToken();
        setAccessToken(null);
    }

    const value = useMemo<AuthState>(
        () => ({
            accessToken,
            isAuthenticated: accessToken !== null,
            isValidating,
            login,
            logout,
        }),
        [accessToken, isValidating],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}
