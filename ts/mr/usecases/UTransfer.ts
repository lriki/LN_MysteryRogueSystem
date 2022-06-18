import { assert, tr2 } from "ts/mr/Common";
import { DHelpers } from "ts/mr/data/DHelper";
import { LandExitResult, MRData } from "ts/mr/data/MRData";
import { MRDataManager } from "ts/mr/data/MRDataManager";
import { LEntity } from "ts/mr/objects/LEntity";
import { LFloorId } from "ts/mr/objects/LFloorId";
import { REGame } from "ts/mr/objects/REGame";
import { RESystem } from "ts/mr/system/RESystem";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { createNoSubstitutionTemplateLiteral } from "typescript";


export class UTransfer {
    /**
     * RMMZ コアスクリプト側からの マップ(と Player Entity) 遷移。
     * ニューゲーム時や [場所移動] イベントなどで使用する。
     */
    public static transterRmmzDirectly(newMapId: number, newX: number, newY: number): void {
        const landId = MRData.maps[newMapId].landId;
        const mapData = MRData.maps[newMapId];
        //let actualMapId = 0;
        let actualFloorNumber = 0;
        let actualX = -1;
        let actualY = -1;

        if (landId == DHelpers.RmmzNormalMapLandId || mapData.eventMap) {
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
            const info = land.floorInfos[floorNumber];
            const fixedMap = land.findFixedMapByName(info.fixedMapName);
            //if ()
            

            //const rmmzFixedMapId = map.mapId;//$dataMapInfos.findIndex(x => x && x.name == info.fixedMapName);
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
            const fixedMapName = mapInfo.name;
            const land = MRData.lands[landId];
            //actualMapId = newMapId;
            actualFloorNumber = land.floorInfos.findIndex(x => x && x.fixedMapName == fixedMapName);
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
        
        const playerEntity = REGame.camera.focusedEntity();
        if (playerEntity) {
            REGame.world.transferEntity(playerEntity, floorId, actualX, actualY);
        }

        //$gamePlayer.reserveTransfer();
    }

    /**
     * entity を今いる Land から抜けさせ、ExitMap へ移動させる。
     */
    public static exitLand(cctx: SCommandContext, entity: LEntity, result: LandExitResult): void {
        assert(entity == REGame.camera.focusedEntity());    // Player であるはず

        RESystem.integration.onSetLandExitResult(result);
        cctx.postTransferFloor(entity, LFloorId.makeByRmmzNormalMapId(REGame.map.land2().landData().exitRMMZMapId));
    }

    public static proceedFloorForwardForPlayer(interpreter?: Game_Interpreter | undefined) {
        const entity = REGame.camera.focusedEntity();
        if (entity) {
            const floorId = entity.floorId;
            const newFloorNumber = floorId.floorNumber() + 1;

            // 最後のフロアを踏破した？
            if (newFloorNumber > REGame.map.land2().maxFloorNumber()) {
                RESystem.integration.onSetLandExitResult(LandExitResult.Goal);

                const exitRMMZMapId = floorId.landData().exitRMMZMapId;
                assert(exitRMMZMapId > 0);

                const newFloorId = LFloorId.makeByRmmzNormalMapId(exitRMMZMapId)

                //const newFloorId = LFloorId.make(DHelpers.RmmzNormalMapLandId, exitRMMZMapId);
                REGame.world.transferEntity(entity, newFloorId);

                //$gamePlayer.reserveTransfer(exitRMMZMapId, 0, 0, 2, 0);
                //const result = this.command201([0, exitRMMZMapId, 0, 0, 2, 0]);
                //assert(result);
            }
            else {
                const newFloorId = LFloorId.make(floorId.landId(), newFloorNumber);
                REGame.world.transferEntity(entity, newFloorId);
            }

            if (interpreter) {
                // イベントからの遷移は普通の [場所移動] コマンドと同じように WaitMode を設定する必要がある。
                // しないと、例えば直前に表示していたメッセージウィンドウのクローズなどを待たずに遷移が発生し、isBusy() でハングする。
                interpreter.setWaitMode("transfer");
            }
        }
    }


}
