import { REGame } from "./REGame";
import { REGame_Entity } from "./REGame_Entity";
import { REGame_EntityFactory } from "./REGame_EntityFactory";
import { REGame_Map } from "./REGame_Map";
import { RE_Game_World } from "./REGame_World";
import { REGame_Core } from "./REGame_Core";
import { REData } from "../data/REData";
import { REScheduler } from "../system/REScheduler";
import { REGame_UnitAttribute } from "./REGame_Attribute";
import { REGame_Camera } from "../objects/REGame_Camera";
import { REGame_System } from "ts/objects/REGame_System";


/**
 */
export class REGameManager
{
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
            const unit = REGame_EntityFactory.newActor();
            REGame.uniqueActorUnits.push(unit);
            
            //const attr = unit.findAttribute(REGame_PositionalAttribute);
            //if (attr) {
            //}
        });

        // 1 番 Actor をデフォルトで操作可能とする
        const firstActor = REGame.uniqueActorUnits[0];
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

