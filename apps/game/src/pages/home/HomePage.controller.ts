import { useAuth } from "../../auth/AuthContext";

export function useHomePageController() {
    const { logout } = useAuth();

    return { logout };
}
