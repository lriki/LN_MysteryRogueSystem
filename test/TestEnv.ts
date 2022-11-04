
import fs from "fs";
import { LandExitResult, MRData } from "ts/mr/data/MRData";
import { MRDataManager } from "ts/mr/data/MRDataManager";
import { FMap } from "ts/mr/floorgen/FMapData";
import { MRLively } from "ts/mr/lively/MRLively";
import { LEntity } from "ts/mr/lively/LEntity";
import { SSequelSet } from "ts/mr/system/SSequel";
import { SIntegration } from "ts/mr/system/SIntegration";
import { SGameManager } from "ts/mr/system/SGameManager";
import { SRmmzHelpers } from "ts/mr/system/SRmmzHelpers";
import "./Extension";
import { MRSystem } from "ts/mr/system/MRSystem";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { LMap } from "ts/mr/lively/LMap";
import { DHelpers } from "ts/mr/data/DHelper";
import { assert } from "ts/mr/Common";
import { DStateId } from "ts/mr/data/DState";
import { SDialogContext } from "ts/mr/system/SDialogContext";
import { SDialog } from "ts/mr/system/SDialog";
import { DEntityCreateInfo, DEntityId } from "ts/mr/data/DEntity";
import { LBlock } from "ts/mr/lively/LBlock";
import { DEventId } from "ts/mr/data/predefineds/DBasicEvents";
import { MRBasics } from "ts/mr/data/MRBasics";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { DLandId } from "ts/mr/data/DCommon";
import { DFloorClass } from "ts/mr/data/DLand";

declare global {
    interface Number {
        clamp(min: number, max: number): number;
    }
}

Number.prototype.clamp = function(min: number, max: number): number{
    const num = (this as Number).valueOf();
    return Math.min(Math.max(num, min), max);
};

export class TestEnv {
    public static integration: TestEnvIntegration;
    public static UnitTestLandId: DLandId;
    public static FloorId_DefaultNormalMap: LFloorId = LFloorId.makeEmpty();
    public static FloorId_FlatMap50x50: LFloorId = LFloorId.makeEmpty();
    public static FloorId_UnitTestFlatMap50x50: LFloorId = LFloorId.makeEmpty();
    public static FloorId_CharacterAI: LFloorId = LFloorId.makeEmpty();
    public static FloorId_RandomMapFloor: LFloorId = LFloorId.makeEmpty();
    public static StateId_debug_MoveRight: DStateId;
    public static StateId_Sleep: DStateId;
    public static StateId_CertainDirectAttack: DStateId;
    public static EntityId_Herb: DEntityId;
    public static EntityId_Weapon1: DEntityId;
    public static EntityId_Shield1: DEntityId;
    public static EntityId_SleepTrap: DEntityId;

    private static _databaseFiles = [
        { name: "$dataActors", src: "Actors.json" },
        { name: "$dataClasses", src: "Classes.json" },
        { name: "$dataSkills", src: "Skills.json" },
        { name: "$dataItems", src: "Items.json" },
        { name: "$dataWeapons", src: "Weapons.json" },
        { name: "$dataArmors", src: "Armors.json" },
        { name: "$dataEnemies", src: "Enemies.json" },
        { name: "$dataTroops", src: "Troops.json" },
        { name: "$dataStates", src: "States.json" },
        { name: "$dataAnimations", src: "Animations.json" },
        { name: "$dataTilesets", src: "Tilesets.json" },
        { name: "$dataCommonEvents", src: "CommonEvents.json" },
        { name: "$dataSystem", src: "System.json" },
        { name: "$dataMapInfos", src: "MapInfos.json" }
    ];

    static sequelSets: SSequelSet[];
    static activeSequelSet: SSequelSet;

    static setupDatabase() {
        MRData.testMode = true;
        this.loadRmmzDatabase();
        MRData.reset();
        MRDataManager.testMode = true;
        MRDataManager.load();
        this.integration = new TestEnvIntegration();
        MRSystem.integration = this.integration;
        MRSystem.unittest = true;

        this.UnitTestLandId = MRData.lands.findIndex(x => x.name.includes("UnitTestDungeon1"));
        this.FloorId_DefaultNormalMap = LFloorId.makeByRmmzNormalMapId(MRData.getMap("MR-Safety:テスト拠点").mapId);
        this.FloorId_FlatMap50x50 = LFloorId.makeByRmmzFixedMapName("FlatMap50x50");
        this.FloorId_UnitTestFlatMap50x50 = LFloorId.makeByRmmzFixedMapName("UnitTestFlatMap50x50");
        this.FloorId_CharacterAI = LFloorId.makeByRmmzFixedMapName("CharacterAI");
        this.FloorId_RandomMapFloor = LFloorId.make(this.UnitTestLandId, DFloorClass.FloorMap, 3);
        this.StateId_debug_MoveRight = MRData.getState("kState_Test_MoveRight").id
        this.StateId_Sleep = MRData.getState("kState_睡眠").id;
        this.StateId_CertainDirectAttack = MRData.states.findIndex(x => x.key == "kState_UnitTest_攻撃必中");
        this.EntityId_Herb = MRData.getEntity("kEntity_薬草A").id;
        this.EntityId_Weapon1 = MRData.getEntity("kEntity_こん棒A").id;
        this.EntityId_Shield1 = MRData.getEntity("kEntity_皮の盾A").id;
        this.EntityId_SleepTrap = MRData.getEntity("kEntity_眠りガスA").id;
        
        // デバッグしやすいように共通の名前を付けておく
        //const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
        //actor1._name = "actor1";
    }

    public static setupPlayer(floorId: LFloorId, mx?: number, my?: number, dir: number = 0): LEntity {
        const player = MRLively.world.entity(MRLively.system.mainPlayerEntityId);
        player._name = "Player";
        if (dir) {
            player.dir = dir;
        }
        MRLively.world.transferEntity(player, floorId, mx, my);
        TestEnv.performFloorTransfer();
        return player;
    }

    public static createReflectionObject(floorId: LFloorId, mx: number, my: number): LEntity {
        const object1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_投擲反射石A").id, [MRData.getState("kState_System_ItemStanding").id], "object1"));
        MRLively.world.transferEntity(object1, floorId, 13, 10);
        return object1;
    }

    public static performFloorTransfer(): void {
        assert(MRLively.camera.isFloorTransfering());
        this.loadMapData(MRLively.camera.transferingNewFloorId().rmmzMapId());
        SGameManager.performFloorTransfer();
    }

    private static loadRmmzDatabase(): void {
        for (const databaseFile of this._databaseFiles) {
            this.loadDataFile(databaseFile.name, databaseFile.src);
        }
    }

    private static setGlobal(name: string, value: any): void {
        if (DHelpers.isNode())
            (global as any)[name] = value;
        else
            (window as any)[name] = value;
    }
        
    // DataManager.loadDataFile
    private static loadDataFile(name: string, src: string) {
        const dataDir = "data/";    // REData.testMode ? "../data/" : 
        const data = JSON.parse(fs.readFileSync(dataDir + src).toString());
        this.setGlobal(name, data);
        this.onLoad(data);
    }
    
    // DataManager.loadMapData
    private static loadMapData(mapId: number): void {
        if (mapId > 0) {
            const filename = `Map${this.padZero(mapId, 3)}.json`;
            this.loadDataFile("$dataMap", filename);
        } else {
            throw new Error("Invalid map data.");
        }
    }

    public static newGame(): void {
        this.sequelSets = [];
        SGameManager.createGameObjects();
        SGameManager.setupNewGame();
    }

    public static padZero(v: number, length: number) {
        return String(v).padStart(length, "0");
    }

    //--------------------------------------------------
    // DataManager の実装

    private static onLoad(object: any) {
        if (this.isMapObject(object)) {
            this.extractMetadata(object);
            this.extractArrayMetadata(object.events);
        } else {
            this.extractArrayMetadata(object);
        }
    }
    
    private static isMapObject(object: any): boolean {
        return !!(object.data && object.events);
    }

    private static extractArrayMetadata(array: any) {
        if (Array.isArray(array)) {
            for (const data of array) {
                if (data && "note" in data) {
                    this.extractMetadata(data);
                }
            }
        }
    };

    private static extractMetadata(data: any) {
        DHelpers.extractMetadata(data);
    }
}

export interface SIntegrationRecord {
    type: string;
}

export class TestEnvIntegration extends SIntegration {
    public skillEmittedCount: number = 0;
    public sequelFlushCount: number = 0;
    public records: SIntegrationRecord[] = [];
    public exitResult: LandExitResult = LandExitResult.Goal;

    onEventPublished(eventId: DEventId, args: any, handled: boolean): void {
        if (eventId == MRBasics.events.skillEmitted) {
            this.skillEmittedCount++;
        }
    }

    onReserveTransferMap(mapId: number): void {
        // Game では $gamePlayer.reserveTransfer() でマップ遷移を予約し、Scene 側でマップデータをロードしてもらう。
        // Test では Camera の transfar 情報を使うため設定不要。マップデータも、TestEnv.performFloorTransfer() でロードする。
    }

    onEntityLocated(entity: LEntity): void {
    }

    onLocateRmmzEvent(eventId: number, x: number, y: number): void {
    }

    onLoadFixedMapData(map: FMap): void {
        SRmmzHelpers.buildFixedMapData(map);
    }

    /*
    onLoadFixedMapData(map: FMap): void {
        if (map.floorId() == 1) {
            // 50x50 の空マップ
            map.reset(50, 50);
        }
        else {
            throw new Error("Method not implemented.");
        }
    }
    */

    onLoadFixedMapEvents(): void {
        SRmmzHelpers.createEntitiesFromRmmzFixedMapEventData(0);
    }
    
    onUpdateBlock(block: LBlock): void {
        // Visual 表示は伴わない
    }

    onRefreshGameMap(map: LMap): void {
        // Visual 表示は伴わない
    }

    onFlushEffectResult(entity: LEntity): void {
        // Visual 表示は伴わない
    }

    onFlushSequelSet(sequelSet: SSequelSet): void {
        // 実行結果確認用に保持するだけ
        TestEnv.activeSequelSet = sequelSet;
        this.sequelFlushCount++;
        this.records.push({ type: "onFlushSequelSet" });
        TestEnv.sequelSets.push(sequelSet);
    }
    onCheckVisualSequelRunning(): boolean {
        // Visual 表示は伴わない
        return false;
    }

    onOpenDialog(model: SDialog): void {
        // Dialog の処理はテストコード内で行う
    }

    onDialogClosed(context: SDialogContext, dialog: SDialog): void {
        // Dialog の処理はテストコード内で行う
    }

    onUpdateDialog(context: SDialogContext): void {
        // Dialog の処理はテストコード内で行う
    }

    onEntityEnteredMap(entity: LEntity): void {
        // Visual 表示は伴わない
    }

    onEntityLeavedMap(entity: LEntity): void {
        this.records.push({ type: "onEntityLeavedMap" });
        // Visual 表示は伴わない
    }
    
    onEntityReEnterMap(entity: LEntity): void {
        // Visual 表示は伴わない
    }

    onSetLandExitResult(result: LandExitResult): void {
        this.exitResult = result;
    }
    
    override onEquipmentChanged(entity: LEntity): void {
    }
}
