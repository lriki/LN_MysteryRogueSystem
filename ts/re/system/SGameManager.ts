import { REGame } from "../objects/REGame";
import { SEntityFactory } from "./internal";
import { LMap } from "../objects/LMap";
import { LWorld } from "../objects/LWorld";
import { LSystem } from "../objects/LSystem";
import { REData } from "../data/REData";
import { SScheduler } from "./SScheduler";
import { LCamera } from "../objects/LCamera";
import { RESystem } from "./RESystem";
import { SActivityRecorder } from "./SActivityRecorder";
import { assert, Log } from "ts/re/Common";
import { LMessage } from "ts/re/objects/LMessage";
import { LMessageHistory } from "ts/re/objects/LMessageHistory";
import { LIdentifyer } from "ts/re/objects/LIdentifyer";
import { SSequelContext } from "./SSequelContext";
import { SCommandContext } from "./SCommandContext";
import { SImmediatelyCommandExecuteScheduler } from "./SImmediatelyCommandExecuteScheduler";
import { LEventServer } from "ts/re/objects/LEventServer";
import { SMinimapData } from "./SMinimapData";
import { LFloorDirector } from "ts/re/objects/LFloorDirector";
import { LScheduler } from "ts/re/objects/LScheduler";
import { FMap } from "ts/re/floorgen/FMapData";
import { FMapBuilder } from "ts/re/floorgen/FMapBuilder";
import { paramRandomMapDefaultHeight, paramRandomMapDefaultWidth } from "ts/re/PluginParameters";
import { FGenericRandomMapGenerator } from "ts/re/floorgen/FGenericRandomMapGenerator";
import { SMapManager } from "./SMapManager";
import { LUnitBehavior } from "ts/re/objects/behaviors/LUnitBehavior";
import { SDialogContext } from "./SDialogContext";
import { SGroundRules } from "./SGroundRules";
import { LBlock } from "ts/re/objects/LBlock";
import { UTransfer } from "ts/re/usecases/UTransfer";
import { LObjectType } from "ts/re/objects/LObject";
import { STurnContext } from "./STurnContext";
import { SEffectBehaviorManager } from "./effects/SEffectBehaviorManager";
import { SFormulaOperand } from "./SFormulaOperand";

/**
 */
export class SGameManager {
    public static createSystemObjects(): void {
        RESystem.sequelContext = new SSequelContext();
        RESystem.commandContext = new SCommandContext(RESystem.sequelContext);
        RESystem.dialogContext = new SDialogContext(RESystem.commandContext);
        RESystem.turnContext = new STurnContext();
        RESystem.scheduler = new SScheduler();
        RESystem.minimapData = new SMinimapData();
        RESystem.mapManager = new SMapManager();
        RESystem.groundRules = new SGroundRules();
        RESystem.effectBehaviorManager = new SEffectBehaviorManager();
        RESystem.requestedPlayback = false;
        RESystem.formulaOperandA = new SFormulaOperand();
        RESystem.formulaOperandB = new SFormulaOperand();
        RESystem.formulaOperandC = new SFormulaOperand();
    }

    // DataManager.createGameObjects に従って呼び出される。
    // ゲーム起動時に1回呼び出される点に注意。NewGame 選択時に改めて1回呼び出される。
    public static createGameObjects(): void {
        this.createSystemObjects();
        REGame.immediatelyCommandExecuteScheduler = new SImmediatelyCommandExecuteScheduler();
        REGame.system = new LSystem();
        REGame.world = new LWorld();
        REGame.map = new LMap();
        REGame.camera = new LCamera();
        REGame.scheduler = new LScheduler();
        REGame.identifyer = new LIdentifyer();
        REGame.recorder = new SActivityRecorder();
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

    // もともとは createGameObjects() と一緒だったが、タイミングを Game_Player の位置設定後にしたかったため分けた
    public static setupNewGame() {

        // TODO: とりあえずまずは全部同じにしてテスト
        //RESystem.skillBehaviors = REData.skills.map(x => new LNormalAttackSkillBehavior());

        // 1 番 Actor をデフォルトで操作可能 (Player) とする
        const firstActor = REGame.world.entity(REGame.system.uniqueActorUnits[0]);
        REGame.system.mainPlayerEntityId = firstActor.entityId();
        const unit = firstActor.findEntityBehavior(LUnitBehavior);
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
           
        // test
        //REGame.camera.focusedEntity()?.setActualParam(DBasics.params.hp, 2);
    }

    
    // performTransfer() が呼ばれる時点で、RMMZ のマップ情報はロード済みでなければならない。
    // - 固定マップの場合は、そのマップがロード済みであること。
    // - ランダムマップの場合は、テーブル定義マップがロード済みであること。
    static performFloorTransfer() {
        if (REGame.camera.isFloorTransfering()) {
            //const focusedEntity = REGame.camera.focusedEntity();
            //const currentFloorId = focusedEntity ? focusedEntity.floorId : LFloorId.makeEmpty();
            const currentFloorId = REGame.map.floorId();
            const newFloorId = REGame.camera.transferingNewFloorId();

            // 別 Land への遷移？
            if (newFloorId.landId() != currentFloorId.landId()) {
                REGame.identifyer.reset(newFloorId.landData());
            }
    
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
                RESystem.mapManager.setMap(REGame.map);
                RESystem.mapManager.setupMap(mapData);
    
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
        //contents.map = REGame.map;
        contents.camera = REGame.camera;
        contents.scheduler = REGame.scheduler;
        console.log("contents", contents);
        return contents;
    }

    public static loadGame(contents: any) {
        console.log("loadGame ---------------");
        this.createSystemObjects();

        REGame.system = contents.system;
        REGame.world = contents.world;
        REGame.camera = contents.camera;
        REGame.scheduler = contents.scheduler;
        
        const map = REGame.world.objects().find(x => x && x.objectType() == LObjectType.Map);
        assert(map);
        REGame.map = map as LMap;
        RESystem.mapManager.setMap(REGame.map);

        // Visual 側の準備が整い次第、Game レイヤーが持っているマップ情報を Visual に反映してほしい
        RESystem.mapManager.requestRefreshVisual();

        // test
        //REGame.camera.focusedEntity()?.setActualParam(DBasics.params.hp, 2);

        // コアスクリプト側が例外を捨てているので、そのままだとこの辺りで発生したエラーの詳細がわからなくなる。
        // そのため独自に catch してエラーを出力している。
        try {
            if (1) {
                REGame.recorder.attemptStartPlayback(false);
            }
            else {
                if (REGame.recorder.attemptStartPlayback(true)) {
                    //while (REGame.recorder.isPlayback()) {
                    while (!REGame.recorder.checkPlaybackRemaining(4)) {
                        console.log("---");
                        RESystem.scheduler.stepSimulation();
                    }
        
                    // Silent モードのクリアは、すべての Playback simulation が終わってから行う。
                    // そうしないと、例えば最後に杖を振る Activity がある場合、魔法弾の生成が非 Silent で実行されるため
                    // View まで流れてしまい、まだ未ロードのマップ情報を参照しようとしてしまう。
                    REGame.recorder.clearSilentPlayback();
                }
            }
        }
        catch (e) {
            console.error(e);
            throw e;  
        }

    }
}

