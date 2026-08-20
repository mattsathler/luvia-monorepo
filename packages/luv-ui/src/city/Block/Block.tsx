import './Block.scss';

type BlockProps = {
    x?: number;
    y?: number;
    z?: number;
    color?: string;
    size?: number;
    texture: string;
    isometric?: boolean;
    onClick?: () => void;
}

export function Block({ color = "transparent", size = 32, x = 0, y = 0, z = 0, texture, isometric, onClick }: BlockProps) {
    const className = [
        "tile",
        isometric && "isometric",
        onClick && "clickable",
    ].filter(Boolean).join(" ");

    return (
        <div
            className={className}
            style={{
                "--color": color,
                "--size": `${size}px`,
                "--x": x,
                "--y": y,
                "--z": z,
                "--texture": `url(${texture})`
            } as React.CSSProperties}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onClick();
                }
            } : undefined}
        >
            <div className="face top"></div>
            {
                isometric && (
                    <>
                        <div className="face left"></div>
                        <div className="face right"></div>
                    </>
                )
            }
        </div>
    )
}