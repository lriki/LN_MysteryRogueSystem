import { paramRandomMapDefaultHeight, paramRandomMapDefaultWidth } from "../PluginParameters";
import { DTerrainPresetId, DTerrainSettingId } from "./DCommon";
import { DTerrainSettingRef } from "./DLand";

export enum DSectorConnectionPreset {
    Default,
    C,
    H,
    N,
    S,
    O,
    F,
    T,
}

export interface DForceTerrainRoomShape {
    typeName: string;
}

export interface DTerrainStructureDef {
    typeName: string;
    rate: number;
}

export interface DForceTerrainStructure {
    typeName: string;
}

export interface DTerrainShopDef {
    typeName: string;
    rate: number;
}

export interface DTerrainMonsterHouseDef {
    typeName: string;
    rate: number;
}

/**
 * 
 * 
 * 
 * [2022/2/21] Structure を Preset で指定する必要があるのか？FloorInfo 側で指定したほうが良いのではないか？
 * ----------
 * 必須ではない。これはどちらかというと、設定を楽にするため。
 * 
 * - そのフロアは、通常マップか大部屋の2種類をとりえる。
 * - 大部屋となった場合は確定でモンスターハウス。
 * 
 * このような条件の場合、次のように書くことができる。
 * 
 * ```
 * @MR-Floor
 *     presets: [
 *         ["kTerrainSetting_Default", 5],
 *         ["kTerrainSetting_GreatHallMonsterHouse", 5],
 *     ]
 * ```
 * 
 * もし Structure を Preset で持たない場合、次のように書く必要があるだろう。
 * 
 * ```
 * @MR-Floor
 *     presets: [
 *         {
 *             key: "kTerrainSetting_Default",
 *             rate: 5,
 *         },
 *         {
 *             key: "kTerrainSetting_GreatHallMonsterHouse",
 *             rate: 5,
 *             forceStructures: ["MonsterHouse"]
 *         },
 *     ]
 * ```
 * 
 * 当然ながら、ツクールの注釈には入りきらない。
 * 
 * またシレン2中腹の井戸のように、定期的に大部屋モンスターハウスが発生するような場合、上記全く同じ設定をたくさんのフロア情報に記述する必要がある。
 * 設定を変更したいときに全フロア見直すのはかなり大変。
 * 例えば次のような Preset を作るのが良いだろう。
 * 
 * - kTerrainPreset_中腹の井戸_Default
 * - kTerrainPreset_中腹の井戸_大部屋モンスターハウス
 * 
 * [2022/2/21] @MR-Floor での指定を、もう一段グループ化したい
 * ----------
 * 
 * ```
 * @MR-Floor
 *     terrain: "kTerrainPresets_Default"
 * ```
 * 
 * 前項のままだと、アルファベットマップをランダム選択するときに、@MR-Floor にそれぞれの Preset を書かなければならなくなる。
 * 次のようなのを用意できるといいかも。
 * 
 * - kTerrainPresets_ダンジョンA_低層
 * - kTerrainPresets_ダンジョンA_中層
 * - kTerrainPresets_ダンジョンA_深層
 */
export class DTerrainSetting {
    id: DTerrainSettingId;
    key: string;
    width: number;
    height: number;
    divisionCountX: number;
    divisionCountY: number;
    connectionPreset: DSectorConnectionPreset;
    forceRoomShapes: DForceTerrainRoomShape[];
    structureDefs: DTerrainStructureDef[];
    forceStructures: DForceTerrainStructure[];
    shopDefs: DTerrainShopDef[];
    monsterHouseDefs: DTerrainMonsterHouseDef[];
    
    public constructor(id: DTerrainSettingId) {
        this.id = id;
        this.key = "";
        this.width = paramRandomMapDefaultWidth;
        this.height = paramRandomMapDefaultHeight;
        this.divisionCountX = 3;
        this.divisionCountY = 3;
        this.connectionPreset = DSectorConnectionPreset.Default;
        this.forceRoomShapes = [];
        this.structureDefs = [{typeName: "default", rate: 5}];
        this.forceStructures = [];
        this.shopDefs = [{typeName: "default", rate: 5}];
        this.monsterHouseDefs = [{typeName: "default", rate: 5}];
    }
}

export class DTerrainPreset {
    id: DTerrainPresetId;
    key: string;
    presets: DTerrainSettingRef[];
    
    public constructor(id: DTerrainPresetId) {
        this.id = id;
        this.key = "";
        this.presets = [];
    }
}
