import { DSkill, DSkillDataId } from "ts/data/DSkill";
import { DStateId } from "ts/data/DState";
import { ParameterDataId, REData } from "ts/data/REData";
import { LSkillBehavior } from "../objects/skills/SkillBehavior";
import { LStateBehavior } from "../objects/states/LStateBehavior";
import { BlockLayerKind } from "../objects/REGame_Block";
import { REIntegration } from "./REIntegration";
import { DItemDataId } from "ts/data/DItem";

export interface EntityKinds {
    actor: number;
    
    //static OtherKindId: number;             // その他・未分類
    WeaponKindId: number;            // 武器
    ShieldKindId: number;            // 盾
    ArrowKindId: number;             // 矢
    BraceletKindId: number;          // 腕輪
    FoodKindId: number;              // 食料
    HerbKindId: number;              // 草
    ScrollKindId: number;            // 巻物
    WandKindId: number;              // 杖
    PotKindId: number;               // 壺
    DiscountTicketKindId: number;    // 割引券
    BuildingMaterialKindId: number;  // 建材
    TrapKindId: number;              // 罠
    FigurineKindId: number;          // 土偶
    MonsterKindId: number;           // モンスター
}

export interface EntityProperty {
    id: number;
    defaultValue: any;
}

// Entity の基本プロパティのうち、Behavior によってオーバーライドされることがあるもの。
// 特に、他の状態に依存して変わる可能性がある状態を返すために使う。
export interface EntityProperties {
    // Entity が Map に配置されるとき、どのレイヤーを基本とするか。
    // Ground, Unit, System のいずれか。
    // NOTE: Entity の種別等で決定できないので、フィールドで持たせている。
    //       - やりすごし状態は、自身をアイテム化する状態異常として表現する。（やり過ごしを投げ当てる他、技によってもやり過ごし状態になる）
    //       - アイテム擬態モンスターは正体を現しているかによってレイヤーが変わる。
    //       - 土偶は落とすとアイテム、立てるとUnitのようにふるまう
    homeLayer: number;
}

// Battler 自身が持つパラメータ
export interface BasicParameters {
    // RMMZ 基礎パラメータ。(Game_Battler.params(x)) 並び順が一致するようにしておく。
    hp: ParameterDataId;    // HP / Maximum Hit Points
    mp: ParameterDataId;    // Magic Points / Maximum Magic Points
    atk: ParameterDataId;        // ATtacK power. ちから, 武器攻撃力
    def: ParameterDataId;        // DEFense power. 防具防御力
    mat: ParameterDataId;    // Magic ATtack power
    mdf: ParameterDataId;    // Magic DeFense power
    agi: ParameterDataId;    // AGIlity
    luk: ParameterDataId;    // LUcK

    tp: ParameterDataId;         // Tactical Points

    // xparam 装備やステートによって変動するパラメータ
    /*
    hit: number;    // HIT rate
    eva: number;    // EVAsion rate
    cri: number;    // CRItical rate
    cev: number;    // Critical EVasion rate
    mev: number;    // Magic EVasion rate
    mrf: number;    // Magic ReFlection rate
    cnt: number;    // CouNTer attack rate
    hrg: number;    // Hp ReGeneration rate
    mrg: number;    // Mp ReGeneration rate
    trg: number;    // Tp ReGeneration rate
    tgr: number;    // TarGet Rate
    grd: number;    // GuaRD effect rate
    rec: number;    // RECovery effect rate
    pha: number;    // PHArmacology
    mcr: number;    // Mp Cost Rate
    tcr: number;    // Tp Charge Rate
    pdr: number;    // Physical Damage Rate
    mdr: number;    // Magic Damage Rate
    fdr: number;    // Floor Damage Rate
    exr: number;    // EXperience Rate
    */

    satiety: number;    // 満腹度

}

export interface BasicAttributes {
    tile: number;
    unit: number;
}

export interface BasicBehaviors {
    decision: number;
    unit: number;
    //genericState: number;
}

export interface BasicStates {
    dead: DStateId,         // 戦闘不能
    /*
    speedDown: DStateId,    // 鈍足
    speedUp: DStateId,      // 倍速
    confusion: DStateId,    // 混乱
    sleep: DStateId,        // 睡眠
    blind: DStateId,        // 目つぶし
    paralysis: DStateId,    // かなしばり
    sealed: DStateId,       // 封印
    substitute: DStateId,   // 身代わり
    transparent: DStateId,  // 透明
    sightThrough: DStateId, // 透視
    sharpEar: DStateId,     // 地獄耳
    clairvoyant: DStateId,  // 千里眼
    deception: DStateId,    // まどわし
    mouthClosed: DStateId,  // くちなし
    */
    debug_MoveRight: DStateId,
}

export interface BasicSequels {
    /** 移動 */
    MoveSequel: number;
    
    attack: number;

    /** 
     * 倒されたとき
     * 
     * Sequel はあくまで演出が目的なので、仮に CollapseSequel の発行を忘れたときでも
     * 演出が表示されないだけで Entity は消される等処理される。
     */
    CollapseSequel: number;
}

export interface BasicSkills {
    normalAttack: DSkillDataId;
}

export interface BasicItems {
    /** ダンジョン突入時に自動的に追加される食糧アイテム */
    autoSupplyFood: DItemDataId;
}


export class RESystem {
    static propertyData:EntityProperty[] = [
        { id: 0, defaultValue: undefined },
        { id: 1, defaultValue: BlockLayerKind.Ground }
    ];

    static properties: EntityProperties = {
        homeLayer: 1,
    }

    // Database
    static entityKinds: EntityKinds;
    static parameters: BasicParameters;
    static attributes: BasicAttributes;
    static behaviors: BasicBehaviors;
    static states: BasicStates;
    static sequels: BasicSequels;
    static skills: BasicSkills;
    static items: BasicItems;
    
    
    static integration: REIntegration;

    static skillBehaviors: LSkillBehavior[];
    static stateBehaviors: LStateBehavior[];



    static createAttribute(dataId: number) {
        const i = REData._attributeFactories[dataId]();
        i.dataId = dataId;
        return i;
    }

    static createBehavior(dataId: number) {
        const i = REData._behaviorFactories[dataId]();
        i.dataId = dataId;
        return i;
    }
}




//declare var $RE_system : RESystem;
