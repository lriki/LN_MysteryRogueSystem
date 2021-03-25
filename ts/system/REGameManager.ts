import { REGame } from "../objects/REGame";
import { REEntityFactory } from "./REEntityFactory";
import { REGame_Map } from "../objects/REGame_Map";
import { LWorld } from "../objects/LWorld";
import { LSystem } from "../objects/LSystem";
import { DFactionId, REData } from "../data/REData";
import { SScheduler } from "./SScheduler";
import { LUnitAttribute } from "../objects/attributes/LUnitAttribute";
import { LCamera } from "../objects/LCamera";
import { RESystem } from "./RESystem";
import { RECommandRecorder } from "./RECommandRecorder";
import { LNormalAttackSkillBehavior } from "ts/objects/skills/SkillBehavior";
import { LDebugMoveRightState } from "ts/objects/states/DebugMoveRightState";
import { assert, Log } from "ts/Common";
import { LMessage } from "ts/objects/LMessage";
import { LMessageHistory } from "ts/objects/LMessageHistory";
import { DBasics } from "ts/data/DBasics";
import { LIdentifyer } from "ts/objects/LIdentifyer";
import { SSequelContext } from "./SSequelContext";
import { RECommandContext } from "./RECommandContext";
import { REDialogContext } from "./REDialog";
import { SImmediatelyCommandExecuteScheduler } from "./SImmediatelyCommandExecuteScheduler";
import { LEventServer } from "ts/objects/LEventServer";
import { LEntity } from "ts/objects/LEntity";
import { SMinimapData } from "./SMinimapData";
import { LFloorDirector } from "ts/objects/LFloorDirector";
import { LScheduler } from "ts/objects/LScheduler";

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
        RESystem.sequelContext = new SSequelContext();
        RESystem.commandContext = new RECommandContext(RESystem.sequelContext);
        RESystem.dialogContext = new REDialogContext(RESystem.commandContext);
        RESystem.scheduler = new SScheduler();
        RESystem.minimapData = new SMinimapData();
        REGame.immediatelyCommandExecuteScheduler = new SImmediatelyCommandExecuteScheduler();
        REGame.system = new LSystem();
        REGame.world = new LWorld();
        REGame.map = new REGame_Map();
        REGame.camera = new LCamera();
        REGame.scheduler = new LScheduler();
        REGame.identifyer = new LIdentifyer();
        REGame.recorder = new RECommandRecorder();
        REGame.messageHistory = new LMessageHistory();
        REGame.message = new LMessage();
        REGame.eventServer = new LEventServer();
        REGame.floorDirector = new LFloorDirector();

        // Create unique units
        REData.actors.forEach(x => {
            if (x.id > 0) {
                const unit = REEntityFactory.newActor(x.id);
                unit.prefabKey = `Actor:${x.id}`;
                unit.floorId = x.initialFloorId;
                unit.x = x.initialX;
                unit.y = x.initialY;
                REGame.system.uniqueActorUnits.push(unit.entityId());
            }
        });

        // TODO: とりあえずまずは全部同じにしてテスト
        RESystem.skillBehaviors = REData.skills.map(x => new LNormalAttackSkillBehavior());

        // 1 番 Actor をデフォルトで操作可能とする
        const firstActor = REGame.world.entity( REGame.system.uniqueActorUnits[0]);
        REGame.system.mainPlayerEntityId = firstActor.entityId();
        const unit = firstActor.findAttribute(LUnitAttribute);
        if (unit) {
            unit.setManualMovement(true);
        }
        REGame.camera.focus(firstActor);

        // この時点で移動しようとしてはならない。
        // RMMZ 側の Game_Player.performTransfer をフックする。
        assert(!REGame.camera.isFloorTransfering());
    }

    
    // performTransfer() が呼ばれる時点では、RMMZ のマップ情報はロード済みでなければならない。
    static performFloorTransfer() {
        if (REGame.camera.isFloorTransfering()) {

            // マップ構築
            REGame.map._removeAllEntities();
            REGame.map.setup(REGame.camera.transferingNewFloorId());
            
            REGame.world.enterEntitiesToCurrentMap();
            RESystem.scheduler.clear();

            REGame.camera.clearFloorTransfering();
            Log.d("PerformFloorTransfer");
        }
    }
    
    public static makeSaveContents(): any {
        let contents: any = {};
        contents.system = REGame.system;
        contents.world = REGame.world;
        contents.map = REGame.map;
        contents.camera = REGame.camera;
        contents.scheduler = REGame.scheduler;
        console.log("contents", contents);
        return contents;
    }

    public static extractSaveContents(contents: any) {
        console.log("extractSaveContents contents", contents);
        REGame.system = contents.system;
        REGame.world = contents.world;
        REGame.map = contents.map;
        REGame.camera = contents.camera;
        REGame.scheduler = contents.scheduler;
    }
}

