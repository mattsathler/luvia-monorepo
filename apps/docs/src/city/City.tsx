import { generateCity } from "./ExampleCity";
import { Block, IsoGrid } from "luv-ui";
import type { TileData } from "luv-ui";

const tiles: TileData[] = generateCity(40);

export default function City() {
    return (
        <div className="d-flex flex-col gap">
            <div className="dialog theme d-flex flex-col gap">
                <div className="d-flex flex-col gap">
                    <h1 className="text-text">Grid & City Structure</h1>
                    <div className="d-grid grid-wrap gap W-full">
                        <div className="card outline d-flex flex-col gap hidden">
                            <h2>128px Example City Grid</h2>
                            <div className="w-full h-480">
                                <IsoGrid tiles={tiles} tileSize={128} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex flex-col gap">
                <h1 className="text-text">Blocks & Real Time Shadowing</h1>
                <div className="card outline d-flex flex-col gap">
                    <div className="d-flex flex-wrap gap">
                        <Block color="#fd9393" key={1} size={124} texture="grass" isometric></Block>
                        <Block color="#227145" key={2} size={124} texture="grass" isometric></Block>
                        <Block color="#143791" key={3} size={124} texture="grass" isometric></Block>
                        <Block color="#bb2566" key={4} size={124} texture="grass" isometric></Block>
                        <Block color="#bbb823" key={5} size={124} texture="grass" isometric></Block>
                    </div>
                    <div className="d-flex flex-wrap gap">
                        <Block key={6} size={124} texture={TILE_TYPES.grass.texture} isometric></Block>
                        <Block key={6} size={124} texture={TILE_TYPES.sand.texture} isometric></Block>
                        <Block key={6} size={124} texture={TILE_TYPES.autumn.texture} isometric></Block>
                        <Block key={6} size={124} texture={TILE_TYPES.ocean.texture} isometric></Block>
                        <Block key={6} size={124} texture={TILE_TYPES["road-l"].texture} isometric></Block>
                    </div>
                    <DayCycleControl />
                </div>
            </div>

        </div>
    )
}