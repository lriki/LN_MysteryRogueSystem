import { REGame } from "../objects/REGame";
import { REEntityFactory } from "./REEntityFactory";
import { REGame_Map } from "../objects/REGame_Map";
import { RE_Game_World } from "../objects/REGame_World";
import { REGame_Core } from "../objects/REGame_Core";
import { REData } from "../data/REData";
import { REScheduler } from "./REScheduler";
import { LUnitAttribute } from "../objects/attributes/LUnitAttribute";
import { REGame_Camera } from "../objects/REGame_Camera";
import { REGame_System } from "../objects/REGame_System";
import { RESystem } from "./RESystem";
import { RECommandRecorder } from "./RECommandRecorder";
import { LNormalAttackSkillBehavior } from "ts/objects/skills/SkillBehavior";
import { LDebugMoveRightState } from "ts/objects/states/DebugMoveRightState";
import { Log } from "ts/Common";
import { LMessage } from "ts/objects/LMessage";

type Constructor<T = {}> = new (...args: any[]) => T;


function Unit<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
      timestamp = Date.now();
    };
  }



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
        REGame.message = new LMessage();

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
        RESystem.skillBehaviors = REData.skills.map(x => new LNormalAttackSkillBehavior());
        RESystem.stateBehaviors = [];
        RESystem.stateBehaviors[RESystem.states.debug_MoveRight] = new LDebugMoveRightState();

        // 1 番 Actor をデフォルトで操作可能とする
        const firstActor = REGame.uniqueActorUnits[0];
        REGame.core.mainPlayerEntiyId = firstActor._id;
        REGame.system._mainPlayerEntityId = firstActor._id;
        const unit = firstActor.findAttribute(LUnitAttribute);
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
            REGame.scheduler.clear();

            REGame.camera.clearFloorTransfering();
            Log.d("PerformFloorTransfer");
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

