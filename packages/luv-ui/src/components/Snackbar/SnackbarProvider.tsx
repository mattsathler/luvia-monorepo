import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./Snackbar.scss";
import { subscribeSnackbar, type SnackbarItem } from "./snackbar";

const ENTER_DELAY = 10;
const EXIT_DURATION = 300;

type SnackbarToastProps = {
    item: SnackbarItem;
    onDismiss: () => void;
};

function SnackbarToast({ item, onDismiss }: SnackbarToastProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const enterTimeout = setTimeout(() => setVisible(true), ENTER_DELAY);
        const exitTimeout = setTimeout(() => setVisible(false), item.duration);
        const dismissTimeout = setTimeout(onDismiss, item.duration + EXIT_DURATION);

        return () => {
            clearTimeout(enterTimeout);
            clearTimeout(exitTimeout);
            clearTimeout(dismissTimeout);
        };
    }, [item.duration, onDismiss]);

    const variantClass = item.variant === "default" ? "" : item.variant;

    return (
        <div
            role="status"
            className={[
                "card",
                variantClass,
                "snackbar",
                visible ? "snackbar-visible" : "",
                "d-flex items-center gap-8",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <span className="text-text">{item.message}</span>
        </div>
    );
}

export function SnackbarProvider() {
    const [items, setItems] = useState<SnackbarItem[]>([]);

    useEffect(() => {
        return subscribeSnackbar((item) => {
            setItems((current) => [...current, item]);
        });
    }, []);

    function handleDismiss(id: string) {
        setItems((current) => current.filter((entry) => entry.id !== id));
    }

    return createPortal(
        <div className="snackbar-viewport d-flex flex-col items-center gap-8">
            {items.map((item) => (
                <SnackbarToast key={item.id} item={item} onDismiss={() => handleDismiss(item.id)} />
            ))}
        </div>,
        document.body
    );
}
