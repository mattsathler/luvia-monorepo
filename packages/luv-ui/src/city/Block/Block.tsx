import './Block.scss';

type BlockProps = {
    x?: number;
    y?: number;
    z?: number;
    color?: string;
    size?: number;
    texture: string;
    isometric?: boolean;
}

export function Block({ color = "transparent", size = 32, x = 0, y = 0, z = 0, texture, isometric }: BlockProps) {
    return (
        <div className="tile" style={{
            "--color": color,
            "--size": `${size}px`,
            "--x": x,
            "--y": y,
            "--z": z,
            "--texture": `url(${texture})`
        } as React.CSSProperties}>
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