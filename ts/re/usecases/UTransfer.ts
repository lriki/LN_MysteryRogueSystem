import { assert } from "ts/re/Common";
import { DHelpers } from "ts/re/data/DHelper";
import { LandExitResult, REData } from "ts/re/data/REData";
import { REDataManager } from "ts/re/data/REDataManager";
import { LEntity } from "ts/re/objects/LEntity";
import { LFloorId } from "ts/re/objects/LFloorId";
import { REGame } from "ts/re/objects/REGame";
import { paramLandExitResultVariableId } from "ts/re/PluginParameters";
import { RESystem } from "ts/re/system/RESystem";
import { SCommandContext } from "ts/re/system/SCommandContext";
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

    /**
     * entity を今いる Land から抜けさせ、ExitMap へ移動させる。
     */
    public static exitLand(context: SCommandContext, entity: LEntity, result: LandExitResult): void {
        assert(entity == REGame.camera.focusedEntity());    // Player であるはず

        RESystem.integration.onSetLandExitResult(result);
        context.postTransferFloor(entity, LFloorId.makeByRmmzNormalMapId(REGame.map.land2().landData().exitRMMZMapId));
    }

    public static proceedFloorForward(interpreter?: Game_Interpreter | undefined) {
        const entity = REGame.camera.focusedEntity();
        if (entity) {
            const floorId = entity.floorId;
            const newFloorNumber = floorId.floorNumber() + 1;

            // 最後のフロアを踏破した？
            if (newFloorNumber > REGame.map.land2().maxFloorNumber()) {
                $gameVariables.setValue(paramLandExitResultVariableId, Math.floor(LandExitResult.Goal / 100));

                const exitRMMZMapId = floorId.landData().exitRMMZMapId;
                assert(exitRMMZMapId > 0);
                
                console.log("踏破！");
                console.log("exitRMMZMapId", exitRMMZMapId);

                const newFloorId = LFloorId.makeByRmmzNormalMapId(exitRMMZMapId)

                //const newFloorId = LFloorId.make(DHelpers.RmmzNormalMapLandId, exitRMMZMapId);
                REGame.world._transferEntity(entity, newFloorId);

                //$gamePlayer.reserveTransfer(exitRMMZMapId, 0, 0, 2, 0);
                //const result = this.command201([0, exitRMMZMapId, 0, 0, 2, 0]);
                //assert(result);
            }
            else {
                const newFloorId = LFloorId.make(floorId.landId(), newFloorNumber);
                REGame.world._transferEntity(entity, newFloorId);
            }

            if (interpreter) {
                // イベントからの遷移は普通の [場所移動] コマンドと同じように WaitMode を設定する必要がある。
                // しないと、例えば直前に表示していたメッセージウィンドウのクローズなどを待たずに遷移が発生し、isBusy() でハングする。
                interpreter.setWaitMode("transfer");
            }
        }
    }


}