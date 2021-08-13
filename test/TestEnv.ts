
import fs from 'fs';
import { LandExitResult, REData, REFloorMapKind } from "ts/data/REData";
import { REDataManager } from "ts/data/REDataManager";
import { FMap } from "ts/floorgen/FMapData";
import { REGame } from "ts/objects/REGame";
import { LEntity } from "ts/objects/LEntity";
import { SSequelSet } from "ts/system/SSequel";
import { SIntegration } from "ts/system/SIntegration";
import { SGameManager } from "ts/system/SGameManager";
import { SRmmzHelpers } from "ts/system/SRmmzHelpers";
import "./Extension";
import { RESystem } from 'ts/system/RESystem';
import { LFloorId } from 'ts/objects/LFloorId';
import { LMap } from 'ts/objects/LMap';
import { DHelpers } from 'ts/data/DHelper';
import { assert } from 'ts/Common';
import { DLandId } from 'ts/data/DLand';
import { DStateId } from 'ts/data/DState';
import { DPrefab, DPrefabId } from 'ts/data/DPrefab';
import { SDialogContext } from 'ts/system/SDialogContext';
import { SDialog } from 'ts/system/SDialog';
import { DEntityId } from 'ts/data/DEntity';

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

    public static UnitTestLandId: DLandId;
    public static FloorId_DefaultNormalMap: LFloorId = LFloorId.makeEmpty();
    public static FloorId_FlatMap50x50: LFloorId = LFloorId.makeEmpty();
    public static FloorId_CharacterAI: LFloorId = LFloorId.makeEmpty();
    public static FloorId_RandomMapFloor: LFloorId = LFloorId.makeEmpty();
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

    static activeSequelSet: SSequelSet;

    static setupDatabase() {
        this.loadRmmzDatabase();
        REData.reset();
        REDataManager.loadData(true);
        RESystem.integration = new TestEnvIntegration();
        RESystem.unittest = true;
        //REDataManager.loadPrefabDatabaseMap();
        {
            // Database マップ読み込み開始
            const filename = `Map${this.padZero(REDataManager.databaseMapId, 3)}.json`;
            this.loadDataFile("RE_databaseMap", filename);
        }

        this.UnitTestLandId = REData.lands.findIndex(x => x.name.includes("UnitTestDungeon1"));
        this.FloorId_DefaultNormalMap = LFloorId.makeByRmmzNormalMapId(REData.maps.findIndex(m => DHelpers.getMapName(m.mapId) == "拠点メイン"));
        this.FloorId_FlatMap50x50 = LFloorId.makeByRmmzFixedMapName("FlatMap50x50");
        this.FloorId_CharacterAI = LFloorId.makeByRmmzFixedMapName("CharacterAI");
        this.FloorId_RandomMapFloor = LFloorId.make(this.UnitTestLandId, 3);
        this.StateId_Sleep = REData.getStateFuzzy("UT睡眠").id;
        this.StateId_CertainDirectAttack = REData.states.findIndex(x => x.key == "kState_UnitTest_攻撃必中");
        this.EntityId_Herb = REData.getEntity("kキュアリーフ").id;
        this.EntityId_Weapon1 = REData.getEntity("kゴブリンのこん棒").id;
        this.EntityId_Shield1 = REData.getEntity("kレザーシールド").id;
        this.EntityId_SleepTrap = REData.getEntity("k眠りガス").id;
        
        // デバッグしやすいように共通の名前を付けておく
        //const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
        //actor1._name = "actor1";
    }

    public static performFloorTransfer(): void {
        assert(REGame.camera.isFloorTransfering());
        this.loadMapData(REGame.camera.transferingNewFloorId().rmmzMapId());
        SGameManager.performFloorTransfer();
    }

    private static loadRmmzDatabase(): void {
        for (const databaseFile of this._databaseFiles) {
            this.loadDataFile(databaseFile.name, databaseFile.src);
        }
    }
        
    // DataManager.loadDataFile
    private static loadDataFile(name: string, src: string) {
        (window as any)[name] = JSON.parse(fs.readFileSync("data/" + src).toString());
        this.onLoad((window as any)[name]);
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
        const regExp = /<([^<>:]+)(:?)([^>]*)>/g;
        data.meta = {};
        for (;;) {
            const match = regExp.exec(data.note);
            if (match) {
                if (match[2] === ":") {
                    data.meta[match[1]] = match[3];
                } else {
                    data.meta[match[1]] = true;
                }
            } else {
                break;
            }
        }
    }
}

export class TestEnvIntegration extends SIntegration {
    onReserveTransferMap(mapId: number): void {
        // Game では $gamePlayer.reserveTransfer() でマップ遷移を予約し、Scene 側でマップデータをロードしてもらう。
        // Test では Camera の transfar 情報を使うため設定不要。マップデータも、TestEnv.performFloorTransfer() でロードする。
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
        SRmmzHelpers.createEntitiesFromRmmzFixedMapEventData();
    }

    onRefreshGameMap(map: LMap, initialMap: FMap): void {
        // Visual 表示は伴わない
    }

    onFlushSequelSet(sequelSet: SSequelSet): void {
        // 実行結果確認用に保持するだけ
        TestEnv.activeSequelSet = sequelSet;
    }
    onCheckVisualSequelRunning(): boolean {
        // Visual 表示は伴わない
        return false;
    }

    onOpenDialog(model: SDialog): void {
        // Dialog の処理はテストコード内で行う
    }

    onDialogClosed(context: SDialogContext): void {
        // Dialog の処理はテストコード内で行う
    }

    onUpdateDialog(context: SDialogContext): void {
        // Dialog の処理はテストコード内で行う
    }

    onEntityEnteredMap(entity: LEntity): void {
        // Visual 表示は伴わない
    }

    onEntityLeavedMap(entity: LEntity): void {
        // Visual 表示は伴わない
    }
    
    onEntityReEnterMap(entity: LEntity): void {
        // Visual 表示は伴わない
    }

    onSetLandExitResult(result: LandExitResult): void {
    }
}
