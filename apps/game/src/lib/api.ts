const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// Chamado sempre que authFetch recebe 401, para que a sessão expire
// automaticamente não importa qual página disparou a chamada.
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
    onUnauthorized = handler;
}

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

export type SkinTone = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Gender = "male" | "female" | "other";

export type Appearance = {
    skinTone: SkinTone;
    hairType: string;
    eyeType: string;
    face: string;
    accessory: string | null;
    top: string;
    pants: string;
    shoes: string;
    overlay: string;
};

export type Character = {
    id: string;
    accountId: string;
    firstName: string;
    lastName: string;
    gender: Gender;
    skills: Record<string, number>;
    happiness: number;
    energy: number;
    money: number;
    fame: number;
    activity: string;
    activityEndsAt: string | null;
    lastUpdatedAt: string;
    appearance: Appearance;
};

export type SkillDefinition = {
    id: string;
    label: string;
};

export type CreateCharacterInput = {
    firstName: string;
    lastName: string;
    gender: Gender;
    skinTone: SkinTone;
    hairType: string;
    eyeType: string;
};

export async function listMyCharacters(accessToken: string): Promise<Character[]> {
    const response = await authFetch("/characters/mine", accessToken);

    if (!response.ok) {
        throw new ApiError(await parseErrorMessage(response));
    }

    return response.json();
}

export async function listSkills(accessToken: string): Promise<SkillDefinition[]> {
    const response = await authFetch("/characters/skills", accessToken);

    if (!response.ok) {
        throw new ApiError(await parseErrorMessage(response));
    }

    return response.json();
}

export async function createCharacter(accessToken: string, input: CreateCharacterInput): Promise<Character> {
    const response = await authFetch("/characters", accessToken, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        throw new ApiError(await parseErrorMessage(response));
    }

    return response.json();
}

export type AppearanceUpdate = Partial<Pick<Appearance, "skinTone" | "face" | "accessory" | "top" | "pants" | "shoes" | "overlay">>;

export async function updateAppearance(accessToken: string, characterId: string, appearance: AppearanceUpdate): Promise<Character> {
    const response = await authFetch(`/characters/${characterId}/appearance`, accessToken, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appearance),
    });

    if (!response.ok) {
        throw new ApiError(await parseErrorMessage(response));
    }

    return response.json();
}

export type LotType = "residential";

export type Lot = {
    id: string;
    characterId: string;
    type: LotType;
    x: number;
    y: number;
};

export type TerrainType = "grass" | "ocean" | "road-r" | "road-l" | "road-i" | "landmark";

export type TerrainTile = {
    x: number;
    y: number;
    type: TerrainType;
};

export type City = {
    width: number;
    height: number;
    tiles: TerrainTile[];
    lots: Lot[];
};

export async function getCity(accessToken: string): Promise<City> {
    const response = await authFetch("/city", accessToken);

    if (!response.ok) {
        throw new ApiError(await parseErrorMessage(response));
    }

    return response.json();
}

export async function getCharacterLot(accessToken: string, characterId: string): Promise<Lot> {
    const response = await authFetch(`/city/lots/${characterId}`, accessToken);

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
        onUnauthorized?.();
        throw new UnauthorizedError();
    }

    return response;
}
