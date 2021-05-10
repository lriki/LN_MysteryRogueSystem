import { REDataManager } from "ts/data/REDataManager";
import { REGame } from "ts/objects/REGame";
import { REVisual } from "ts/visual/REVisual";


export class RMMZHelper {

    public static isRESystemMap(): boolean {
        return REDataManager.isRESystemMap($gameMap.mapId());
    }

    public static setRegionId(x: number, y: number, regionId: number): void {
        //if ($dataMap.data) {
        //    const width = $dataMap.width ?? 0;
        //    const height = $dataMap.height ?? 0;
        //    $dataMap.data[(5 * height + y) * width + x] = regionId;
        //}
        this.setRETileData(x, y, 5, regionId);
    }

    public static setRETileData(x: number, y: number, z: number, value: number): void {
        if ($dataMap.data) {
            const width = $dataMap.width ?? 0;
            const height = $dataMap.height ?? 0;
            $dataMap.data[(z * height + y) * width + x] = value;
        }
    }

    // https://www.f-sp.com/category/RPG%E3%83%84%E3%82%AF%E3%83%BC%E3%83%AB?page=1480575168
    // 異種タイルが 1
    public static _autoTileTable: number[] = [
        0b000000000, // tileId: 0
        0b001000000, // tileId: 1
        0b100000000, // tileId: 2
        0b101000000, // tileId: 3
        0b000000100, // tileId: 4
        0b001000100, // tileId: 5
        0b100000100, // tileId: 6
        0b101000100, // tileId: 7
        
        0b000000001, // tileId: 8
        0b001000001, // tileId: 9
        0b100000001, // tileId: 10
        0b101000001, // tileId: 11
        0b000000101, // tileId: 12
        0b001000101, // tileId: 13
        0b100000101, // tileId: 14
        0b101000101, // tileId: 15
        
        0b001001001, // tileId: 16
        0b101001001, // tileId: 17
        0b001001101, // tileId: 18
        0b101001101, // tileId: 19
        0b111000000, // tileId: 20
        0b111000100, // tileId: 21
        0b111000001, // tileId: 22
        0b111000101, // tileId: 23
        
        0b100100100, // tileId: 24
        0b100100101, // tileId: 25
        0b101100100, // tileId: 26
        0b101100101, // tileId: 27
        0b000000111, // tileId: 28
        0b001000111, // tileId: 29
        0b100000111, // tileId: 30
        0b101000111, // tileId: 31

        
        0b101101101, // tileId: 0
        0b111000111, // tileId: 0
        0b111100100, // tileId: 0
    ];
    
    public static mapAutoTileId(dirBits: number): number {
        const index = this._autoTileTable.findIndex(x => x == dirBits);
        if (index >= 0)
            return index;
        else 
            return 0;
    }

    public static syncCameraPositionToGamePlayer(): void {
        const entity = REGame.camera.focusedEntity();
        if (entity && REVisual.entityVisualSet) {
            const visual = REVisual.entityVisualSet.findEntityVisualByEntity(entity);
            if (visual) {
                const pos = visual.position();
                //console.log("this._realX", this._realX - pos.x);
                
                const lastScrolledX = $gamePlayer.scrolledX();
                const lastScrolledY = $gamePlayer.scrolledY();

                $gamePlayer._realX = pos.x;
                $gamePlayer._realY = pos.y;
                $gamePlayer._x = entity.x;
                $gamePlayer._y = entity.y;
                //console.log("lastScrolledX", pos.x, pos.y, lastScrolledX, lastScrolledY);
                //console.log("$gameMap", $gameMap);
                $gamePlayer.updateScroll(lastScrolledX, lastScrolledY);

                //$gamePlayer.center($gamePlayer._x, $gamePlayer._y);
            }
        }
    }
}

