import { MRDataManager } from "ts/mr/data/MRDataManager";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRView } from "ts/mr/view/MRView";


export class RMMZHelper {

    public static isRESystemMap(): boolean {
        return MRDataManager.isRESystemMap($gameMap.mapId());
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
        if ($gamePlayer.isTransferring()) return;


        const entity = MRLively.camera.focusedEntity();
        if (entity && MRView.entityVisualSet) {
            const visual = MRView.entityVisualSet.findEntityVisualByEntity(entity);
            if (visual) {
                    
                // [2021/11/22] 移動→ワープのように、内部で locate を伴いつつ Sequel が連続で呼び出されたとき、
                // この refresh が visual ではなく entity の座標を元に位置を再設定するため一瞬画面がズレる問題があった。
                // 今は不要かと判断できるが、経過を見つつ削除する。
                // if (REVisual._playerPosRefreshNeed) {
                //     $gamePlayer.locate(entity.x, entity.y);
                //     $gamePlayer.refresh();
                //     REVisual._playerPosRefreshNeed = false;
                //     return;
                // }
            
                const pos = visual.position();
                //console.log("this._realX", this._realX - pos.x);
                
                const lastScrolledX = $gamePlayer.scrolledX();
                const lastScrolledY = $gamePlayer.scrolledY();

                $gamePlayer._realX = pos.x;
                $gamePlayer._realY = pos.y;
                $gamePlayer._x = Math.floor(pos.x);//entity.x;
                $gamePlayer._y = Math.floor(pos.y);//entity.y;
                //console.log("lastScrolledX", pos.x, pos.y, lastScrolledX, lastScrolledY);
                //console.log("$gameMap", $gameMap);
                $gamePlayer.updateScroll(lastScrolledX, lastScrolledY);
                //$gamePlayer.center($gamePlayer._x, $gamePlayer._y);
            }
        }
    }

    public static triggerOnStartEvent(): void {
        for (const event of $gameMap.events()) {
            if (event._reEventData && event._reEventData.trigger && event._reEventData.trigger == "onStart") {
                //if (event.x == 0) {
                    event.start();
                //}
            }
        }
    }

    public static triggerOnKeeperLostEvent(): void {
        for (const event of $gameMap.events()) {
            if (event._reEventData && event._reEventData.trigger && event._reEventData.trigger == "onKeeperLost") {
                event.start();
            }
        }
    }

    public static setVariable(pattern: string, value: any): void {
        const id = parseInt(pattern);
        if (!isNaN(id)) {
            $gameVariables.setValue(id, value);
        }
        else {
            const index = $dataSystem.variables.findIndex(x => x && x == pattern);
            if (index >= 0) {
                $gameVariables.setValue(index, value);
            }
            else {
                throw new Error(`${pattern} not found.`);
            }
        }
    }
}

