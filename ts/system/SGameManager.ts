import { REGame } from "../objects/REGame";
import { SEntityFactory } from "./internal";
import { LMap } from "../objects/LMap";
import { LWorld } from "../objects/LWorld";
import { LSystem } from "../objects/LSystem";
import { REData } from "../data/REData";
import { SScheduler } from "./SScheduler";
import { LCamera } from "../objects/LCamera";
import { RESystem } from "./RESystem";
import { RECommandRecorder } from "./RECommandRecorder";
import { assert, Log } from "ts/Common";
import { LMessage } from "ts/objects/LMessage";
import { LMessageHistory } from "ts/objects/LMessageHistory";
import { LIdentifyer } from "ts/objects/LIdentifyer";
import { SSequelContext } from "./SSequelContext";
import { SCommandContext } from "./SCommandContext";
import { SImmediatelyCommandExecuteScheduler } from "./SImmediatelyCommandExecuteScheduler";
import { LEventServer } from "ts/objects/LEventServer";
import { SMinimapData } from "./SMinimapData";
import { LFloorDirector } from "ts/objects/LFloorDirector";
import { LScheduler } from "ts/objects/LScheduler";
import { FMap } from "ts/floorgen/FMapData";
import { FMapBuilder } from "ts/floorgen/FMapBuilder";
import { paramRandomMapDefaultHeight, paramRandomMapDefaultWidth } from "ts/PluginParameters";
import { FGenericRandomMapGenerator } from "ts/floorgen/FGenericRandomMapGenerator";
import { SMapManager } from "./SMapManager";
import { LUnitBehavior } from "ts/objects/behaviors/LUnitBehavior";
import { SDialogContext } from "./SDialogContext";
import { SGroundRules } from "./SGroundRules";
import { LBlock } from "ts/objects/LBlock";
import { LFloorId } from "ts/objects/LFloorId";
import { UTransfer } from "ts/usecases/UTransfer";

/**
 */
export class SGameManager
{
    // DataManager.createGameObjects に従って呼び出される。
    // ゲーム起動時に1回呼び出される点に注意。NewGame 選択時に改めて1回呼び出される。
    public static createGameObjects(): void {
        RESystem.sequelContext = new SSequelContext();
        RESystem.commandContext = new SCommandContext(RESystem.sequelContext);
        RESystem.dialogContext = new SDialogContext(RESystem.commandContext);
        RESystem.scheduler = new SScheduler();
        RESystem.minimapData = new SMinimapData();
        RESystem.mapManager = new SMapManager();
        RESystem.groundRules = new SGroundRules();
        REGame.immediatelyCommandExecuteScheduler = new SImmediatelyCommandExecuteScheduler();
        REGame.system = new LSystem();
        REGame.world = new LWorld();
        REGame.map = new LMap();
        REGame.camera = new LCamera();
        REGame.scheduler = new LScheduler();
        REGame.identifyer = new LIdentifyer();
        REGame.recorder = new RECommandRecorder();
        REGame.messageHistory = new LMessageHistory();
        REGame.message = new LMessage();
        REGame.eventServer = new LEventServer();
        REGame.floorDirector = new LFloorDirector();
        REGame.borderWall = new LBlock(-1, -1);

        REGame.world._registerObject(REGame.map);

        // Create unique units
        for (const entityId of REData.actors) {
            if (entityId > 0) {
                const actor = REData.entities[entityId].actorData();
                if (actor.id > 0) {
                    const unit = SEntityFactory.newActor(entityId);
                    //unit.prefabKey = `Actor:${actor.id}`;
                    //unit.floorId = LFlo;//x.initialFloorId;
                    unit.x = actor.initialX;
                    unit.y = actor.initialY;
                    REGame.system.uniqueActorUnits.push(unit.entityId());
                }
            }
        }
    }

    /**
     * 
     */
    public static setupNewGame() {

        // TODO: とりあえずまずは全部同じにしてテスト
        //RESystem.skillBehaviors = REData.skills.map(x => new LNormalAttackSkillBehavior());

        // 1 番 Actor をデフォルトで操作可能 (Player) とする
        const firstActor = REGame.world.entity(REGame.system.uniqueActorUnits[0]);
        REGame.system.mainPlayerEntityId = firstActor.entityId();
        const unit = firstActor.findBehavior(LUnitBehavior);
        if (unit) {
            unit.setManualMovement(true);
        }
        REGame.camera.focus(firstActor);

        // Player を Party に入れる
        const party = REGame.world.newParty();
        party.addMember(firstActor);

        // Player の初期位置を、RMMZ 初期位置に合わせる
        UTransfer.transterRmmzDirectly($dataSystem.startMapId, $dataSystem.startX, $dataSystem.startY);
        /*
        const floorId = LFloorId.makeFromMapTransfarInfo($dataSystem.startMapId, $dataSystem.startX);
        if (floorId.isRandomMap())
            REGame.world._transferEntity(firstActor, floorId);
        else
            REGame.world._transferEntity(firstActor, floorId, $dataSystem.startX, $dataSystem.startY);
            */
    }

    
    // performTransfer() が呼ばれる時点で、RMMZ のマップ情報はロード済みでなければならない。
    // - 固定マップの場合は、そのマップがロード済みであること。
    // - ランダムマップの場合は、テーブル定義マップがロード済みであること。
    static performFloorTransfer() {
        if (REGame.camera.isFloorTransfering()) {
            const newFloorId = REGame.camera.transferingNewFloorId();

            if (newFloorId.isEntitySystemMap()) {
                const mapSeed = REGame.world.random().nextInt();
                console.log("seed:", mapSeed);

                const mapData = new FMap(newFloorId, mapSeed);
                if (newFloorId.rmmzFixedMapId() > 0) {
                    // 固定マップ
                    RESystem.integration.onLoadFixedMapData(mapData);
                    const builder = new FMapBuilder();
                    builder.buildForFixedMap(mapData);
                }
                else {
                    mapData.reset(paramRandomMapDefaultWidth, paramRandomMapDefaultHeight);
                    //(new FMiddleSingleRoomGenerator()).generate(mapData);
                    (new FGenericRandomMapGenerator(mapData)).generate();
                    //(new FGenericRandomMapGenerator(mapData, 69)).generate();
                    const builder = new FMapBuilder();
                    builder.buildForRandomMap(mapData);
    
                    
                    mapData.print();
                }
    
    
                // マップ構築
                REGame.map._removeAllEntities();
                REGame.map.setup(newFloorId, mapData);
                RESystem.mapManager.setMap(REGame.map, mapData);
    
            }
            else {
                // Entity を登場させない、通常の RMMZ マップ
                REGame.map.setupForRMMZDefaultMap(newFloorId);
            }
    
            RESystem.minimapData.clear();
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

