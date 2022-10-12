import { MRLively } from "../lively/MRLively";
import { SEntityFactory } from "./internal";
import { LMap } from "../lively/LMap";
import { LWorld } from "../lively/LWorld";
import { LSystem } from "../lively/LSystem";
import { MRData } from "../data/MRData";
import { SScheduler } from "./scheduling/SScheduler";
import { LCamera } from "../lively/LCamera";
import { MRSystem } from "./MRSystem";
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
        MRSystem.sequelContext = new SSequelContext();
        MRSystem.commandContext = new SCommandContext(MRSystem.sequelContext);
        MRSystem.dialogContext = new SDialogContext(MRSystem.commandContext);
        MRSystem.turnContext = new STurnContext();
        MRSystem.scheduler = new SScheduler();
        MRSystem.minimapData = new SMinimapData();
        MRSystem.mapManager = new SMapManager();
        MRSystem.groundRules = new SGroundRules();
        MRSystem.effectBehaviorManager = new SSpecialEffectManager();
        MRSystem.requestedPlayback = false;
        MRSystem.formulaOperandA = new SFormulaOperand();
        MRSystem.formulaOperandB = new SFormulaOperand();
        MRSystem.formulaOperandC = new SFormulaOperand();
    }

    // DataManager.createGameObjects に従って呼び出される。
    // ゲーム起動時に1回呼び出される点に注意。NewGame 選択時に改めて1回呼び出される。
    public static createGameObjects(): void {
        this.createSystemObjects();
        MRLively.immediatelyCommandExecuteScheduler = new SImmediatelyCommandExecuteScheduler();
        MRLively.system = new LSystem();
        MRLively.world = new LWorld();
        MRLively.map = new LMap();
        MRLively.camera = new LCamera();
        MRLively.scheduler = new LScheduler2();
        MRLively.identifyer = new LIdentifyer();
        MRLively.recorder = new SActivityRecorder();
        MRLively.messageHistory = new LMessageHistory();
        MRLively.eventServer = new LEventServer();
        MRLively.borderWall = new LBlock(-1, -1);

        MRLively.world._registerObject(MRLively.map);

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
                    MRLively.system.uniqueActorUnits.push(unit.entityId().clone());
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
        MRLively.world.iterateEntity(x => {
            if ( x.dataId == MRData.system.initialPartyMembers[0]) {
                firstActor = x;
                return false;
            }
            return true;
        });
        assert(firstActor);
        MRLively.system.mainPlayerEntityId = firstActor.entityId();
        MRLively.camera.focus(firstActor);

        // Player を Party に入れる
        const party = MRLively.world.newParty();
        party.addMember(firstActor);

        // Player の初期位置を、RMMZ 初期位置に合わせる
        UTransfer.transterRmmzDirectly($dataSystem.startMapId, $dataSystem.startX, $dataSystem.startY);
        
        // ニューゲーム時には、チャレンジ開始状態にする (主にテストプレイで直接 Land 内に遷移したときのために)
        party.startChallenging();


           
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
            const inventory2 = MRLively.world.getFirstEntityByKey("kEntity_Warehouse_A").getEntityBehavior(LInventoryBehavior);
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
        if (MRLively.camera.isFloorTransfering()) {
            //const focusedEntity = REGame.camera.focusedEntity();
            //const currentFloorId = focusedEntity ? focusedEntity.floorId : LFloorId.makeEmpty();
            const currentFloorId = MRLively.map.floorId();
            const newFloorId = MRLively.camera.transferingNewFloorId();

            // 別 Land への遷移？
            if (newFloorId.landId() != currentFloorId.landId()) {
                MRLively.identifyer.reset(newFloorId.landData());
            }
    
            if (newFloorId.isTacticsMap()) {
                const rand = MRLively.world.random();
                const mapSeed = rand.nextInt();
                console.log("seed:", mapSeed);

                const mapData = new FMap(newFloorId, mapSeed);
                if (newFloorId.rmmzFixedMapId() > 0) {
                    // 固定マップ
                    MRSystem.integration.onLoadFixedMapData(mapData);
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
                MRLively.map._removeAllEntities();
                MRLively.map.setup(newFloorId, mapData);
                MRSystem.mapManager.setMap(MRLively.map);
                MRSystem.mapManager.setupMap(mapData);
    
            }
            else {
                // Entity を登場させない、通常の RMMZ マップ
                MRLively.map.setupForRMMZDefaultMap(newFloorId);
            }

            MRSystem.minimapData.clear();
            MRSystem.scheduler.reset();
            MRLively.camera.clearFloorTransfering();
            Log.d("PerformFloorTransfer");
        }
    }
    
    // テスト用
    public static makeSaveContentsCore(): any {
        let contents: any = {};
        contents.system = MRLively.system;
        contents.world = MRLively.world;
        contents.map = MRLively.map;
        contents.camera = MRLively.camera;
        contents.scheduler = MRLively.scheduler;
        contents.identifyer = MRLively.identifyer;
        contents.messageHistory = MRLively.messageHistory;
        contents.eventServer = MRLively.eventServer;
        return contents;
    }

    public static loadSaveContentsCore(contents: any): void {
        MRLively.system = contents.system;
        MRLively.world = contents.world;
        MRLively.map = contents.map;
        MRLively.camera = contents.camera;
        MRLively.scheduler = contents.scheduler;
        MRLively.identifyer = contents.identifyer;
        MRLively.messageHistory = contents.messageHistory;
        MRLively.eventServer = contents.eventServer;
    }

    public static makeSaveContents(): any {
        const contents = this.makeSaveContentsCore();

        if (!MRSystem.floorStartSaveContents) {
            MRSystem.floorStartSaveContents = JsonEx.stringify(contents);
        }
        return contents;
    }

    public static loadGameObjects(contents: any) {
        this.loadSaveContentsCore(contents);
        
        const map = MRLively.world.objects().find(x => x && x.objectType() == LObjectType.Map);
        assert(map);
        MRLively.map = map as LMap;
        MRSystem.mapManager.setMap(MRLively.map);

        // Visual 側の準備が整い次第、Game レイヤーが持っているマップ情報を Visual に反映してほしい
        MRSystem.mapManager.requestRefreshVisual();
    }

    public static loadGame(contents: any, withPlayback: boolean) {
        this.createSystemObjects();
        this.loadGameObjects(contents);

        if (MRSystem.requestedRestartFloorItem.hasAny()) {
            return;
        }

        if (withPlayback) {
            // コアスクリプト側が例外を捨てているので、そのままだとこの辺りで発生したエラーの詳細がわからなくなる。
            // そのため独自に catch してエラーを出力している。
            try {
                if (1) {
                    MRLively.recorder.attemptStartPlayback(false);
                }
                else {
                    if (MRLively.recorder.attemptStartPlayback(true)) {
                        //while (REGame.recorder.isPlayback()) {
                        while (!MRLively.recorder.checkPlaybackRemaining(4)) {
                            console.log("---");
                            MRSystem.scheduler.stepSimulation();
                        }
            
                        // Silent モードのクリアは、すべての Playback simulation が終わってから行う。
                        // そうしないと、例えば最後に杖を振る Activity がある場合、魔法弾の生成が非 Silent で実行されるため
                        // View まで流れてしまい、まだ未ロードのマップ情報を参照しようとしてしまう。
                        MRLively.recorder.clearSilentPlayback();
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

