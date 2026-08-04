const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export class UnauthorizedError extends Error {
    constructor() {
        super("Sessão expirada ou inválida");
        this.name = "UnauthorizedError";
    }
}

export class ApiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ApiError";
    }
}

export type Account = {
    id: string;
    email: string;
};

export type LoginResponse = {
    accessToken: string;
    account: Account;
};

async function parseErrorMessage(response: Response): Promise<string> {
    try {
        const body = await response.json();
        return typeof body?.message === "string" ? body.message : "Erro inesperado";
    } catch {
        return "Erro inesperado";
    }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (response.status === 401) {
        throw new UnauthorizedError();
    }

    if (!response.ok) {
        throw new ApiError(await parseErrorMessage(response));
    }

    return response.json();
}

export async function register(email: string, password: string): Promise<Account> {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new ApiError(await parseErrorMessage(response));
    }

    return response.json();
}

export async function authFetch(path: string, accessToken: string, init: RequestInit = {}): Promise<Response> {
    const response = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
            ...init.headers,
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (response.status === 401) {
        throw new UnauthorizedError();
    }

    return response;
}
