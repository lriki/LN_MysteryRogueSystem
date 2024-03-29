import { assert, tr2 } from "ts/mr/Common";
import { DHelpers } from "ts/mr/data/DHelper";
import { LandExitResult, MRData } from "ts/mr/data/MRData";
import { MRDataManager } from "ts/mr/data/MRDataManager";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { SCommandContext } from "ts/mr/system/SCommandContext";


export class UTransfer {
    /**
     * RMMZ コアスクリプト側からの マップ(と Player Entity) 遷移。
     * ニューゲーム時や [場所移動] イベントなどで使用する。
     * 
     * @param cctx マップ遷移が発生する場合、STransferMapDialog を post する。
     */
    public static transterRmmzDirectly(newMapId: number, newX: number, newY: number, newDir: number): void {
        const landId = MRData.maps[newMapId].landId;
        const mapData = MRData.maps[newMapId];
        //let actualMapId = 0;
        let actualFloorNumber = 0;
        let actualX = -1;
        let actualY = -1;

        if (landId == DHelpers.VanillaLandId || mapData.eventMap) {
            // REシステム管理外
            //actualMapId = newMapId;
            actualFloorNumber = newMapId;
            actualX = newX;
            actualY = newY;
        }
        else if (MRDataManager.isLandMap(newMapId)) {
            assert(newY === 0);
            const floorNumber = newX;
            const land = MRData.lands[landId];
            const fixedMap = land.getFixedMap(floorNumber);

            if (fixedMap) {
                // Land 定義マップ経由の、固定マップへの移動
                //actualMapId = rmmzFixedMapId;
                actualFloorNumber = floorNumber;
                actualX = -1;
                actualY = -1;
            }
            else {
                // Land 定義マップ経由の、ランダムマップへの移動
                //actualMapId = newMapId;
                actualFloorNumber = floorNumber;
                actualX = -1;
                actualY = -1;
            }
        }
        else if (MRDataManager.isRESystemMap(newMapId)) {
            // 固定マップへの直接遷移
            const mapInfo = $dataMapInfos[newMapId];
            assert(mapInfo);
            //const fixedMapName = mapInfo.name;
            const land = MRData.lands[landId];
            //actualMapId = newMapId;
            actualFloorNumber = land.findFloorNumberByMapId(newMapId);
            actualX = newX;
            actualY = newY;
            if (actualFloorNumber < 0) {
                throw new Error(tr2("Landフロアテーブルに設定が無い固定マップへ移動しようとしました。\nland:%1, map:%2").format(land.name, mapInfo.name));
            }
        }
        else {
            throw new Error("Unreachable.");
        }
        
        const floorId = new LFloorId(landId, actualFloorNumber);
        
        const playerEntity = MRLively.mapView.focusedEntity();
        if (playerEntity) {
            MRLively.world.transferEntity(playerEntity, floorId, actualX, actualY);

            if (newDir !== 0) {
                playerEntity.dir = newDir;
            }
        }
    }

    /**
     * entity を今いる Land から抜けさせ、ExitMap へ移動させる。
     */
    public static exitLand(cctx: SCommandContext, entity: LEntity, result: LandExitResult): void {
        assert(entity == MRLively.mapView.focusedEntity());    // Player であるはず

        entity.party()?.journal.commitLandResult(result);
        const map = MRLively.mapView.currentMap;
        const landData = map.land2().landData();
        const exitMapFloorId = LFloorId.make(landData.id, landData.exitMapFloorNumber);
        cctx.postTransferFloor(entity, exitMapFloorId);
    }

    public static proceedFloorForwardForPlayer(cctx: SCommandContext, interpreter?: Game_Interpreter | undefined) {
        const entity = MRLively.mapView.focusedEntity();
        if (entity) {
            const floorId = entity.floorId;
            const newFloorNumber = floorId.floorNumber + 1;

            // 最後のフロアを踏破した？
            if (newFloorNumber > MRLively.mapView.currentMap.land2().maxFloorNumber()) {
                // ExitMap 取得
                const newFloorId = LFloorId.make(floorId.landId, floorId.landData.exitMapFloorNumber);

                entity.party()?.journal.commitLandResult(LandExitResult.Goal);
                MRLively.world.transferEntity(entity, newFloorId);

                //$gamePlayer.reserveTransfer(exitRMMZMapId, 0, 0, 2, 0);
                //const result = this.command201([0, exitRMMZMapId, 0, 0, 2, 0]);
                //assert(result);
            }
            else {
                const newFloorId = LFloorId.make(floorId.landId, newFloorNumber);
                MRLively.world.transferEntity(entity, newFloorId);
            }

            if (interpreter) {
                // イベントからの遷移は普通の [場所移動] コマンドと同じように WaitMode を設定する必要がある。
                // しないと、例えば直前に表示していたメッセージウィンドウのクローズなどを待たずに遷移が発生し、isBusy() でハングする。
                interpreter.setWaitMode("transfer");
            }
        }
    }


}
