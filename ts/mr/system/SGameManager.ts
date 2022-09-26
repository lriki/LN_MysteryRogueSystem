import { REGame } from "../lively/REGame";
import { SEntityFactory } from "./internal";
import { LMap } from "../lively/LMap";
import { LWorld } from "../lively/LWorld";
import { LSystem } from "../lively/LSystem";
import { MRData } from "../data/MRData";
import { SScheduler } from "./scheduling/SScheduler";
import { LCamera } from "../lively/LCamera";
import { RESystem } from "./RESystem";
import { SActivityRecorder } from "./SActivityRecorder";
import { assert, Log } from "ts/mr/Common";
import { LMessageHistory } from "ts/mr/lively/LMessageHistory";
import { LIdentifyer } from "ts/mr/lively/LIdentifyer";
import { SSequelContext } from "./SSequelContext";
import { SCommandContext } from "./SCommandContext";
import { SImmediatelyCommandExecuteScheduler } from "./SImmediatelyCommandExecuteScheduler";
import { LEventServer } from "ts/mr/lively/LEventServer";
import { SMinimapData } from "./SMinimapData";
import { LScheduler2 } from "ts/mr/lively/LScheduler";
import { FMap } from "ts/mr/floorgen/FMapData";
import { FMapBuilder } from "ts/mr/floorgen/FMapBuilder";
import { paramRandomMapPaddingX, paramRandomMapPaddingY, paramRandomMapDefaultHeight, paramRandomMapDefaultWidth } from "ts/mr/PluginParameters";
import { FGenericRandomMapGenerator } from "ts/mr/floorgen/FGenericRandomMapGenerator";
import { SMapManager } from "./SMapManager";
import { LUnitBehavior } from "ts/mr/lively/behaviors/LUnitBehavior";
import { SDialogContext } from "./SDialogContext";
import { SGroundRules } from "./SGroundRules";
import { LBlock } from "ts/mr/lively/LBlock";
import { UTransfer } from "ts/mr/utility/UTransfer";
import { LObjectType } from "ts/mr/lively/LObject";
import { STurnContext } from "./STurnContext";
import { SSpecialEffectManager } from "./effects/SSpecialEffectManager";
import { SFormulaOperand } from "./SFormulaOperand";
import { LEntity } from "../lively/LEntity";
import { LInventoryBehavior } from "../lively/behaviors/LInventoryBehavior";
import { DEntityCreateInfo } from "../data/DEntity";
import { UEffect } from "../utility/UEffect";
import { DTerrainSettingRef } from "../data/DLand";
import { MRBasics } from "../data/MRBasics";
import { LEquipmentUserBehavior } from "../lively/behaviors/LEquipmentUserBehavior";
//import { REVisual } from "../visual/REVisual";

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
        RESystem.effectBehaviorManager = new SSpecialEffectManager();
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
        REGame.scheduler = new LScheduler2();
        REGame.identifyer = new LIdentifyer();
        REGame.recorder = new SActivityRecorder();
        REGame.messageHistory = new LMessageHistory();
        REGame.eventServer = new LEventServer();
        REGame.borderWall = new LBlock(-1, -1);

        REGame.world._registerObject(REGame.map);

        // Create unique units
        for (const entityId of MRData.actors) {
            if (entityId > 0) {
                const actor = MRData.entities[entityId].actorData();
                if (actor.id > 0) {
                    const unit = SEntityFactory.newActor(entityId);
                    //unit.prefabKey = `Actor:${actor.id}`;
                    //unit.floorId = LFlo;//x.initialFloorId;
                    unit.mx = actor.initialX;
                    unit.my = actor.initialY;
                    REGame.system.uniqueActorUnits.push(unit.entityId().clone());
                }
            }
        }
    }

    // もともとは createGameObjects() と一緒だったが、タイミングを Game_Player の位置設定後にしたかったため分けた
    public static setupNewGame() {

        // TODO: とりあえずまずは全部同じにしてテスト
        //RESystem.skillBehaviors = REData.skills.map(x => new LNormalAttackSkillBehavior());

        // 1 番 Actor をデフォルトで操作可能 (Player) とする
        //
        //REGame.system.mainPlayerEntityId = firstActor.entityId();
        //REGame.camera.focus(firstActor);
        let firstActor : LEntity | undefined;
        // if ($gameParty) {
        //     const rmmzActorId = $gameParty.members()[0].actorId();
        //     firstActor = REGame.world.getEntityByRmmzActorId(rmmzActorId);
        // }
        // else {
        //     firstActor = REGame.world.entity(REGame.system.uniqueActorUnits[0]);
        // }
        REGame.world.iterateEntity(x => {
            if ( x.dataId == MRData.system.initialPartyMembers[0]) {
                firstActor = x;
                return false;
            }
            return true;
        });
        assert(firstActor);
        REGame.system.mainPlayerEntityId = firstActor.entityId();
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
        if (0) {
            const inventory = firstActor.getEntityBehavior(LInventoryBehavior);
            //const inventory = REGame.world.getFirstEntityByKey("kEntity_Warehouse_A").getEntityBehavior(LInventoryBehavior);
            inventory.addEntity(SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_すばやさ草_A").id, [], "item1")));
            inventory.addEntity(SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ちからの草_A").id, [], "item1")));
            inventory.addEntity(SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_しあわせ草_A").id, [], "item1")));
            inventory.addEntity(SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_めつぶし草_A").id, [], "item1")));
            inventory.addEntity(SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_高跳び草_A").id, [], "item1")));
            inventory.addEntity(SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_混乱草_A").id, [], "item1")));
            inventory.addEntity(SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_めぐすり草_A").id, [], "item1")));
            inventory.addEntity(SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_まどわし草_A").id, [], "item1")));
            inventory.addEntity(SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_毒草_A").id, [], "item1")));
            inventory.addEntity(SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草_A").id, [], "item1")));
            inventory.addEntity(SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_毒消し草_A").id, [], "item1")));
            inventory.addEntity(SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_睡眠草_A").id, [], "item1")));

            const shield1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_青銅の盾_A").id, [], "item1"));
            inventory.addEntity(shield1);
            firstActor.getEntityBehavior(LEquipmentUserBehavior).equipOnUtil(shield1);
            
            // 容量-1 までアイテムを詰め込む
            const inventory2 = REGame.world.getFirstEntityByKey("kEntity_Warehouse_A").getEntityBehavior(LInventoryBehavior);
            for (let i = 0; i < inventory2.capacity - 1; i++) {
                const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草_A").id, [], "item"));
                inventory2.addEntity(item);
            }

        }
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
    
            if (newFloorId.isTacticsMap()) {
                const rand = REGame.world.random();
                const mapSeed = rand.nextInt();
                console.log("seed:", mapSeed);

                const mapData = new FMap(newFloorId, mapSeed);
                if (newFloorId.rmmzFixedMapId() > 0) {
                    // 固定マップ
                    RESystem.integration.onLoadFixedMapData(mapData);
                    const builder = new FMapBuilder();
                    builder.buildForFixedMap(mapData);
                }
                else {
                    const floorInto = newFloorId.floorInfo();

                    const preset = floorInto.presetId ? MRData.floorPresets[floorInto.presetId] : MRData.floorPresets[MRBasics.defaultTerrainPresetId];
                    const settingId = UEffect.selectRating<DTerrainSettingRef>(rand, preset.terrains, x => x.rating);
                    assert(settingId);
                    
                    const setting = MRData.terrainSettings[settingId.terrainSettingsId];
                    (new FGenericRandomMapGenerator(mapData, setting).generate());
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
            RESystem.scheduler.reset();
            REGame.camera.clearFloorTransfering();
            Log.d("PerformFloorTransfer");
        }
    }
    
    // テスト用
    public static makeSaveContentsCore(): any {
        let contents: any = {};
        contents.system = REGame.system;
        contents.world = REGame.world;
        contents.map = REGame.map;
        contents.camera = REGame.camera;
        contents.scheduler = REGame.scheduler;
        contents.identifyer = REGame.identifyer;
        contents.messageHistory = REGame.messageHistory;
        contents.eventServer = REGame.eventServer;
        return contents;
    }

    public static loadSaveContentsCore(contents: any): void {
        REGame.system = contents.system;
        REGame.world = contents.world;
        REGame.map = contents.map;
        REGame.camera = contents.camera;
        REGame.scheduler = contents.scheduler;
        REGame.identifyer = contents.identifyer;
        REGame.messageHistory = contents.messageHistory;
        REGame.eventServer = contents.eventServer;
    }

    public static makeSaveContents(): any {
        const contents = this.makeSaveContentsCore();

        if (!RESystem.floorStartSaveContents) {
            RESystem.floorStartSaveContents = JsonEx.stringify(contents);
        }
        return contents;
    }

    public static loadGameObjects(contents: any) {
        this.loadSaveContentsCore(contents);
        
        const map = REGame.world.objects().find(x => x && x.objectType() == LObjectType.Map);
        assert(map);
        REGame.map = map as LMap;
        RESystem.mapManager.setMap(REGame.map);

        // Visual 側の準備が整い次第、Game レイヤーが持っているマップ情報を Visual に反映してほしい
        RESystem.mapManager.requestRefreshVisual();
    }

    public static loadGame(contents: any, withPlayback: boolean) {
        this.createSystemObjects();
        this.loadGameObjects(contents);

        if (RESystem.requestedRestartFloorItem.hasAny()) {
            return;
        }

        if (withPlayback) {
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
}

