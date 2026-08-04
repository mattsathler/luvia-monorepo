export type SnackbarVariant = "default" | "success" | "error" | "warn" | "info";

export type SnackbarOptions = {
    duration?: number;
    variant?: SnackbarVariant;
};

export type SnackbarItem = {
    id: string;
    message: string;
    duration: number;
    variant: SnackbarVariant;
};

type Listener = (item: SnackbarItem) => void;

const DEFAULT_DURATION = 3000;

const listeners = new Set<Listener>();

let idCounter = 0;

export function showSnackbar(message: string, options?: SnackbarOptions): void {
    idCounter += 1;

    const item: SnackbarItem = {
        id: `snackbar-${idCounter}`,
        message,
        duration: options?.duration ?? DEFAULT_DURATION,
        variant: options?.variant ?? "default",
    };

    listeners.forEach((listener) => listener(item));
}

export function subscribeSnackbar(listener: Listener): () => void {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}
