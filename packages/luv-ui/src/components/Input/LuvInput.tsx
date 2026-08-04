import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

export type LuvInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
    label?: string;
    icon?: ReactNode;
    error?: string;
    id?: string;
    type?: string;
};

export const LuvInput = forwardRef<HTMLInputElement, LuvInputProps>(function LuvInput(
    { label, icon, error, id, className, type, ...props },
    ref
) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
        <div className="d-flex flex-col gap-8 w-full">
            {label && (
                <label htmlFor={inputId} className="text-size-16 text-text text-bold">
                    {label}
                </label>
            )}
            <div className="d-flex items-center gap-8 w-full">
                {icon && <span className="d-flex items-center text-placeholder">{icon}</span>}
                <input
                    id={inputId}
                    ref={ref}
                    aria-invalid={!!error}
                    type={type || "text"}
                    className={[error ? "border-error" : "", className].filter(Boolean).join(" ")}
                    {...props}
                />
            </div>
            {error && (
                <span role="alert" className="text-error text-size-12">
                    {error}
                </span>
            )}
        </div>
    );
});
