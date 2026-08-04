import { useEffect, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import "./LuvModal.scss";

export type LuvModalVariant = "default" | "success" | "error" | "warn" | "info";

export type LuvModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    variant?: LuvModalVariant;
    closeOnBackdropClick?: boolean;
    closeOnEscape?: boolean;
    children: ReactNode;
};

export function LuvModal({
    isOpen,
    onClose,
    title,
    variant = "default",
    closeOnBackdropClick = true,
    closeOnEscape = true,
    children,
}: LuvModalProps) {
    useEffect(() => {
        if (!isOpen || !closeOnEscape) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, closeOnEscape, onClose]);

    if (!isOpen) {
        return null;
    }

    const variantClass = variant === "default" ? "" : variant;

    function handleBackdropClick() {
        if (closeOnBackdropClick) {
            onClose();
        }
    }

    function stopPropagation(event: MouseEvent) {
        event.stopPropagation();
    }

    return createPortal(
        <div className="luv-modal-backdrop d-flex items-center justify-center" onClick={handleBackdropClick}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={["dialog", variantClass, "luv-modal"].filter(Boolean).join(" ")}
                onClick={stopPropagation}
            >
                <div className="d-flex items-center justify-between gap-8">
                    {title && <h3 className="text-text">{title}</h3>}
                    <button type="button" className="luv-modal-close" onClick={onClose} aria-label="Fechar">
                        ×
                    </button>
                </div>
                <div className="luv-modal-content">{children}</div>
            </div>
        </div>,
        document.body
    );
}
