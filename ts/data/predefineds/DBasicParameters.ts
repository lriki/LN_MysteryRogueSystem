import { ParameterDataId } from "../REData";


// Battler 自身が持つパラメータ。
// Property との違いは、戦闘ダメージなどに関係するものを集めたものである、という点。すべて number で表される。
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
