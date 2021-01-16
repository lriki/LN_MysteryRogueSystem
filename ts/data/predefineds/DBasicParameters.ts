import { DParameterId } from "../REData";

export type DXParamId = number;
export type DSParamId = number;

// Battler 自身が持つパラメータ。
// Property との違いは、戦闘ダメージなどに関係するものを集めたものである、という点。すべて number で表される。
export interface BasicParameters {
    // RMMZ 基礎パラメータ。(Game_Battler.params(x)) 並び順が一致するようにしておく。
    hp: DParameterId; // = 0    // HP / Maximum Hit Points
    mp: DParameterId; // = 1    // Magic Points / Maximum Magic Points
    atk: DParameterId; // = 2        // ATtacK power. ちから, 武器攻撃力
    def: DParameterId; // = 3        // DEFense power. 防具防御力
    mat: DParameterId; // = 4    // Magic ATtack power
    mdf: DParameterId; // = 5    // Magic DeFense power
    agi: DParameterId; // = 6    // AGIlity
    luk: DParameterId; // = 7    // LUcK

    tp: DParameterId;         // Tactical Points

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


// 追加能力値。加算で計算する。
export interface DBasicXParams {
    // HIT rate
    hit: DXParamId,// = 0,

    // EVAsion rate
    eva: DXParamId,// = 1,

    // CRItical rate
    cri: DXParamId,// = 2,

    // Critical EVasion rate
    cev: DXParamId,// = 3,

    // Magic EVasion rate
    mev: DXParamId,// = 4,

    // Magic ReFlection rate
    mrf: DXParamId,// = 5,

    // CouNTer attack rate
    cnt: DXParamId,// = 6,

    // Hp ReGeneration rate
    hrg: DXParamId,// = 7,

    // Mp ReGeneration rate
    mrg: DXParamId,// = 8,

    // Tp ReGeneration rate
    trg: DXParamId,// = 9,
}

// 特殊能力値。乗算で計算する。
export interface DBasicSParams {
    // TarGet Rate
    tgr: DSParamId,// = 0,

    // GuaRD effect rate
    grd: DSParamId,// = 1,

    // RECovery effect rate
    rec: DSParamId,// = 2,

    // PHArmacology
    pha: DSParamId,// = 3,

    // Mp Cost Rate
    mcr: DSParamId,// = 4,

    // Tp Charge Rate
    tcr: DSParamId,// = 5,

    // Physical Damage Rate
    pdr: DSParamId,// = 6,

    // Magic Damage Rate
    mdr: DSParamId,// = 7,

    // Floor Damage Rate
    fdr: DSParamId,// = 8,

    // EXperience Rate
    exr: DSParamId,// = 9,
}
