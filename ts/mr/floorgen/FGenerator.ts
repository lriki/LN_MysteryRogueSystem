import { FBlockComponent, FMap } from "./FMapData";

// 単一中部屋マップ
/**
 * @deprecated
 */
export class FMiddleSingleRoomGenerator {
    public generate(map: FMap): void {
        const w = map.innerWidth / 2;
        const h = map.innerHeight / 2;
        const ox = (map.innerWidth - w) / 2;
        const oy = (map.innerHeight - h) / 2;

        for (let y = oy; y < oy + h; y++) {
            for (let x = ox; x < ox + w; x++) {
                map.block(x, y).setComponent(FBlockComponent.Room);
            }
        }
    }
}
