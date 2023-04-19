

// 基本能力値。

import { DParameterId } from "../DCommon";
import { DSParamId, DXParamId } from "../DParameter";

// [2021/7/14] 強化値や使用回数は Paramter にする必要ある？
// ----------
// エディタからカスタムパラメータとして制御できるようにするための対策。
// モンスターの特技によって、強化値-1 だったり -3 だったりは、エディタから指定したいところ。
// 
export interface DBasicParameters {
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

    fp: DParameterId;    // 満腹度
    pow: DParameterId;  // ちから
    upgradeValue: DParameterId; // 装備の修正値
    remaining: DParameterId; // 装備の修正値
    //capacity: DParameterId; // (壺の)容量
    gold: DParameterId; // 金額 (所持金ではない。拾った時にGoldアイテムだけが持つパラメータ)

    /**
     * レベル
     * 
     * Level は IdealPlus で変動させる。IdealBase, Damage は常に 0 でなければならない。
     * Level にはバフを適用できる。例えば「一定ターンの間、レベルが半分になる」効果を実装できる。
     * しかしこのとき、次のレベルに必要な Exp を計算する際のレベル値を ActualValue から取得してしまうと、半減したレベルで計算してしまい、
     * 現在の Exp と次のレベルに必要な Exp の矛盾が発生してしまう。
     * このためバフ適用前の値である IdealValue からレベルを取得する必要がある。
     * 
     * Parameter としては制限の多いものとなるが、 Parameter 扱いしておくことで増減やダメージ計算式のオペランドとして利用する際に
     * レベル専用の処理が不要となるため、値は汎用的に利用できるようになる。
     */
    level: DParameterId;

    /**
     * 経験値
     * 
     * Exp は ActualValue で変動させる。IdelBase, IdealPlus は常に 0 でなければならない。
     * Param 扱いするのは、経験値を増加させるアイテムの実装を容易にするため。
     * 例えば「経験値を 500 与える」効果は、HP 等と同じように回復効果として設定できるようになり、 Exp 専用の処理は不要となる。
     */
    exp: DParameterId;
}


// 追加能力値。加算で計算する。攻撃側が必要とするパラメータがメイン。
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

// 特殊能力値。乗算で計算する。防御側が必要とするパラメータがメイン。
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
