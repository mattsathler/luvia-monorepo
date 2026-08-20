const STORAGE_KEY = "luvia.cityTileSize";

export function getStoredTileSize(): number | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
        return null;
    }

    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
}

export function setStoredTileSize(tileSize: number): void {
    localStorage.setItem(STORAGE_KEY, String(tileSize));
}
