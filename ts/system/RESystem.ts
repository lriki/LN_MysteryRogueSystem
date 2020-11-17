import { DStateId } from "ts/data/DState";
import { REData } from "ts/data/REData";
import { LSkillBehavior } from "ts/objects/skills/SkillBehavior";
import { BlockLayerKind } from "ts/RE/REGame_Block";
import { REIntegration } from "./REIntegration";

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

// Entity の基本プロパティのうち、Behavior によってオーバーライドされることがあるもの
export interface EntityProperties {
    // Entity が Map に配置されるとき、どのレイヤーを基本とするか。
    // Ground, Unit, System のいずれか。
    // NOTE: Entity の種別等で決定できないので、フィールドで持たせている。
    //       代表的なのはアイテム擬態モンスター。自分の状態によってレイヤーが変わる。
    homeLayer: number;
}

// Battler 自身が持つパラメータ
export interface BasicParameters {
    // RMMZ 基礎パラメータ。(Game_Battler.params(x)) 並び順が一致するようにしておく。
    hp: number;    // HP / Maximum Hit Points
    mp: number;    // Magic Points / Maximum Magic Points
    atk: number;        // ATtacK power. ちから, 武器攻撃力
    def: number;        // DEFense power. 防具防御力
    mat: number;    // Magic ATtack power
    mdf: number;    // Magic DeFense power
    agi: number;    // AGIlity
    luk: number;    // LUcK

    tp: number;         // Tactical Points

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
    genericState: number;
}

export interface BasicStates {
    dead: DStateId,         // 戦闘不能
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


export class RESystem {
    static propertyData:EntityProperty[] = [
        { id: 0, defaultValue: undefined },
        { id: 1, defaultValue: BlockLayerKind.Unit }
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
    
    
    static integration: REIntegration;

    static skillBehaviors: LSkillBehavior[];

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

    
    static createState(dataId: DStateId) {
        const i = REData._stateFactories[dataId]();
        i._dataId = dataId;
        return i;
    }
    
}

