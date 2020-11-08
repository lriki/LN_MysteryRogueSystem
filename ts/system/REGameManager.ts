import { REGame } from "../RE/REGame";
import { REGame_Entity } from "../RE/REGame_Entity";
import { REEntityFactory } from "./REEntityFactory";
import { REGame_Map } from "../RE/REGame_Map";
import { RE_Game_World } from "../RE/REGame_World";
import { REGame_Core } from "../RE/REGame_Core";
import { REData } from "../data/REData";
import { REScheduler } from "./REScheduler";
import { REGame_UnitAttribute } from "../RE/REGame_Attribute";
import { REGame_Camera } from "../objects/REGame_Camera";
import { REGame_System } from "../objects/REGame_System";
import { RESystem } from "./RESystem";
import { assert } from "ts/Common";
import { RECommandRecorder } from "./RECommandRecorder";
import { VNormalAttackSkillBehavior } from "ts/objects/skills/SkillBehavior";


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
        REGame.recorder = new RECommandRecorder();

        // Create unique units
        REData.actors.forEach(x => {
            if (x.id > 0) {
                const unit = REEntityFactory.newActor();
                unit.prefabKey.kind = RESystem.entityKinds.actor;
                unit.prefabKey.id = x.id;
                unit.floorId = x.initialFloorId;
                unit.x = x.initialX;
                unit.y = x.initialY;
                REGame.uniqueActorUnits.push(unit);
                
                //const attr = unit.findAttribute(REGame_PositionalAttribute);
                //if (attr) {
                //}
            }
        });

        // TODO: とりあえずまずは全部同じにしてテスト
        RESystem.skillBehaviors = REData.skills.map(x => new VNormalAttackSkillBehavior());

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

