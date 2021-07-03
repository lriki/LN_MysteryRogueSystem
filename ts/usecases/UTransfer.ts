import { assert } from "ts/Common";
import { DHelpers } from "ts/data/DHelper";
import { REData } from "ts/data/REData";
import { REDataManager } from "ts/data/REDataManager";
import { LFloorId } from "ts/objects/LFloorId";
import { REGame } from "ts/objects/REGame";
import { createNoSubstitutionTemplateLiteral } from "typescript";


export class UTransfer {
    /**
     * RMMZ コアスクリプト側からの マップ(と Player Entity) 遷移。
     * ニューゲーム時や [場所移動] イベントなどで使用する。
     */
    public static transterRmmzDirectly(newMapId: number, newX: number, newY: number): void {
        const landId = REData.maps[newMapId].landId;
        //let actualMapId = 0;
        let actualFloorNumber = 0;
        let actualX = -1;
        let actualY = -1;

        if (landId == DHelpers.RmmzNormalMapLandId) {
            // REシステム管理外
            //actualMapId = newMapId;
            actualFloorNumber = newMapId;
            actualX = newX;
            actualY = newY;
        }
        else if (REDataManager.isLandMap(newMapId)) {
            assert(newY === 0);
            const floorNumber = newX;
            const info = REData.lands[landId].floorInfos[floorNumber];

            const rmmzFixedMapId = $dataMapInfos.findIndex(x => x && x.name == info.fixedMapName);
            if (rmmzFixedMapId > 0) {
                // Land 定義マップ経由の、固定マップへの移動
                //actualMapId = rmmzFixedMapId;
                actualFloorNumber = floorNumber;
                actualX = -1;
                actualY = -1;
                console.log("rmmzFixedMapId", rmmzFixedMapId);
            }
            else {
                // Land 定義マップ経由の、ランダムマップへの移動
                //actualMapId = newMapId;
                actualFloorNumber = floorNumber;
                actualX = -1;
                actualY = -1;
                console.log("actualFloorNumber", actualFloorNumber);
            }
        }
        else if (REDataManager.isRESystemMap(newMapId)) {
            // 固定マップへの直接遷移
            const mapInfo = $dataMapInfos[newMapId];
            assert(mapInfo);
            const fixedMapName = mapInfo.name;
            //actualMapId = newMapId;
            actualFloorNumber = REData.lands[landId].floorInfos.findIndex(x => x && x.fixedMapName == fixedMapName);
            actualX = newX;
            actualY = newY;
        }
        else {
            throw new Error("Unreachable.");
        }
        
        const floorId = new LFloorId(landId, actualFloorNumber);
        
        const playerEntity = REGame.camera.focusedEntity();
        if (playerEntity) {
            REGame.world._transferEntity(playerEntity, floorId, actualX, actualY);
        }

        //$gamePlayer.reserveTransfer();
    }
}
