import { REGame } from "../RE/REGame";
import { REGame_Entity } from "../RE/REGame_Entity";
import { REGame_EntityFactory } from "./REGame_EntityFactory";
import { REGame_Map } from "../RE/REGame_Map";
import { RE_Game_World } from "../RE/REGame_World";
import { REGame_Core } from "../RE/REGame_Core";
import { REData } from "../data/REData";
import { REScheduler } from "./REScheduler";
import { REGame_UnitAttribute } from "../RE/REGame_Attribute";
import { REGame_Camera } from "../objects/REGame_Camera";
import { REGame_System } from "../objects/REGame_System";


/**
 */
export class REGameManager
{
    // DataManager.createGameObjects に従って呼び出される。
    // ゲーム起動時に1回呼び出される点に注意。NewGame 選択時に改めて1回呼び出される。
    static createGameObjects(): void {
        REGame.scheduler = new REScheduler();
        REGame.core = new REGame_Core();
        REGame.system = new REGame_System();
        REGame.world = new RE_Game_World();
        REGame.map = new REGame_Map();
        REGame.camera = new REGame_Camera();
        REGame.uniqueActorUnits = [];

        // Create unique units
        REData.actors.forEach(x => {
            if (x.id > 0) {
                const unit = REGame_EntityFactory.newActor();
                unit.floorId = x.initialFloorId;
                unit.x = x.initialX;
                unit.y = x.initialY;
                REGame.uniqueActorUnits.push(unit);
                
                //const attr = unit.findAttribute(REGame_PositionalAttribute);
                //if (attr) {
                //}
            }
        });

        // 1 番 Actor をデフォルトで操作可能とする
        const firstActor = REGame.uniqueActorUnits[0];
        REGame.core.mainPlayerEntiyId = firstActor._id;
        REGame.system._mainPlayerEntityId = firstActor._id;
        const unit = firstActor.findAttribute(REGame_UnitAttribute);
        if (unit) {
            unit.setManualMovement(true);
        }
        REGame.camera.focus(firstActor);

/*
        let a = RE_Game_EntityFactory.newActor();
        let b = a.findAttribute(RE_Game_UnitAttribute);
        let c = a.findAttribute(RE_Game_PositionalAttribute);
        console.log("b: ", b);
        console.log("c: ", c);
        */
    }

    static visualRunning(): boolean {
        return false;
    }

    static performFloorTransfer() {
        if (REGame.camera.isFloorTransfering()) {
            // マップ構築
            REGame.map._removeAllEntities();
            REGame.map.setup(REGame.camera.transferingNewFloorId());
            REGame.world.enterEntitiesToCurrentMap();

            REGame.camera.clearFloorTransfering();
        }
    }

    static update(): void {
        if (REGame.camera.isFloorTransfering()) {
            // マップ遷移中はコアシステムとしては何もしない。
            // performFloorTransfer() すること。
            return;
        }

        REGame.scheduler.stepSimulation();
    }
}

