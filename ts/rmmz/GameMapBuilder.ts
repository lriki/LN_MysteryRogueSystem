import { FBlockComponent } from "ts/floorgen/FMapData";
import { REGame_Map } from "ts/objects/REGame_Map";

/**
 * RE Core 側で生成されたマップ (ランダムマップ) を、RMMZ 側のマップデータに反映する。
 */
export class GameMapBuilder {


    public build(coreMap: REGame_Map): void {
        $dataMap.width = coreMap.width();
        $dataMap.height = coreMap.height();
        $dataMap.data = new Array<number>($dataMap.width * $dataMap.height * 5);

        
        for (let y = 0; y < $dataMap.height; y++) {
            for (let x = 0; x < $dataMap.width; x++) {
                const block = coreMap.block(x, y);
                
                switch (block._blockComponent) {
                    case FBlockComponent.None:
                        this.setTileId(x, y, 0, 32);
                        break;
                    case FBlockComponent.Room:
                        this.setTileId(x, y, 0, 33);
                        break;
                    case FBlockComponent.Passageway:
                        this.setTileId(x, y, 0, 34);
                        break;
                }
            }
        }
    }

    private width(): number {
        return $dataMap.width;
    }

    private height(): number {
        return $dataMap.width;
    }

    private tileId(x: number, y: number, z: number): number {
        const width = $dataMap.width;
        const height = $dataMap.height;
        return $dataMap.data[(z * height + y) * width + x] || 0;
    }

    private setTileId(x: number, y: number, z: number, value: number): void {
        const width = $dataMap.width;
        const height = $dataMap.height;
        $dataMap.data[(z * height + y) * width + x] = value;
    }
}

