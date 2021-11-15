import { FBlockComponent, FMap } from "./FMapData";

// 単一中部屋マップ
export class FMiddleSingleRoomGenerator {
    public generate(map: FMap): void {
        const w = map.width() / 2;
        const h = map.height() / 2;
        const ox = (map.width() - w) / 2;
        const oy = (map.height() - h) / 2;

        for (let y = oy; y < oy + h; y++) {
            for (let x = ox; x < ox + w; x++) {
                map.block(x, y).setComponent(FBlockComponent.Room);
            }
        }
    }
}
