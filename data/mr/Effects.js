//==============================================================================
// Effect 設定ファイル
//------------------------------------------------------------------------------
// アイテムやスキルの効果をカスタマイズするためのファイルです。
//==============================================================================
/// <reference path="./MysteryRogueSystem.d.ts" />
const MR = require("MysteryRogueSystem/ts/main");

MR.db.effects = {
    //==========================================================================
    // 草・薬
    //==========================================================================
    //--------------------------------------------------------------------------
    "kEffect_FP回復5": Effect({
        parameterDamages: [
            ParameterDamage({
                parameterKey: "fp",    // FPを、
                type: "recover",       // 回復する。
                formula: "500",        // 値は5%。
                silent: true,          // メッセージを表示しない。
            }),
        ],
    }),
    //--------------------------------------------------------------------------
    "kEffect_すばやさ草A": Effect({
        parameterBuffs: [
            ParameterBuff({
                parameterKey: "agi",    // すばやさの、
                type: "constant",       // 定数バフを、
                level: +1,              // 1レベル分上昇させる。
                turn: 10,               // ターン数は10。
            }),
        ],
        flavorEffect: FlavorEffect({
            animationId: 12,            // 効果発動時に対象へ ID:12 のアニメーションを再生する。
        }),
    }),
    //--------------------------------------------------------------------------
    "kEffect_ちからの草A": Effect({
        parameterDamages: [
            ParameterDamage({           // pow(ちから) が 最大値よりも小さい場合、pow の現在値(actual) を 1 回復する。
                conditionFormula: "a.pow < a.max_pow",
                parameterKey: "pow",
                point: "actual",
                type: "recover",
                formula: "1",
            }),
            ParameterDamage({           // pow が 最大値の場合、pow の最大値(の算出要因となる成長値(growth)) を 1 回復(上昇)する。
                conditionFormula: "a.pow == a.max_pow",
                parameterKey: "pow",
                point: "growth",
                type: "recover",
                formula: "1",
            }),
        ],
        flavorEffect: FlavorEffect({
            animationId: 51,
        }),
    }),
    //--------------------------------------------------------------------------
    "kEffect_しあわせ草A": Effect({
        parameterDamages: [
            ParameterDamage({
                parameterKey: "level",  // レベルの、
                point: "growth",        // 最大値(の基準)を
                type: "recover",        // 回復(上昇) する。
                formula: "1",           // 値は 1。
            }),
        ],
        flavorEffect: FlavorEffect({
            animationId: 52,
        }),
    }),
    //--------------------------------------------------------------------------
    "kEffect_めつぶし草A": Effect({
    }),
    //--------------------------------------------------------------------------
    "kEffect_高跳び草A": Effect({
        specialEffects:[
            SpecialEffect({
                code: "RandomWarp",    // ランダムワープの特殊効果
            }),
        ]
    }),
    //--------------------------------------------------------------------------
    "kEffect_毒草B_Main": Effect({
        parameterDamages: [
            ParameterDamage({           // HP に 5 ダメージ
                parameterKey: "hp",
                formula: "5",
            }),
            ParameterDamage({           // POW に 1 ダメージ
                parameterKey: "pow",
                formula: "1",
            }),
        ],
        specialEffects:[
            SpecialEffect({             // ステート解除
                code: "RemoveState",
                stateKey: "kState_UTまどわし",
                chance: 1.0,
            }),
            SpecialEffect({             // ステート解除
                code: "RemoveState",
                stateKey: "kState_UT混乱",
                chance: 1.0,
            }),
        ]
    }),

    
    //==========================================================================
    // 食料
    //==========================================================================
    //--------------------------------------------------------------------------
    "kEffect_腐ったおにぎりA": Effect({
        parameterDamages: [
            ParameterDamage({
                parameterKey: "fp",
                type: "recover",
                formula: "5000",
            }),
            ParameterDamage({
                parameterKey: "hp",
                type: "damage",
                formula: "5",
            }),
            ParameterDamage({
                parameterKey: "pow",
                type: "damage",
                formula: "1",
            }),
        ],
    }),
    //--------------------------------------------------------------------------
    "kEffect_おにぎりA": Effect({
        parameterDamages: [
            ParameterDamage({
                conditionFormula: "a.fp >= a.max_fp",
                parameterKey: "fp",
                point: "growth",
                type: "recover",
                formula: "200",
            }),
            ParameterDamage({
                conditionFallback: true,
                parameterKey: "fp",
                type: "recover",
                formula: "5000",
            }),
        ],
    }),
    //--------------------------------------------------------------------------
    "kEffect_大きなおにぎりA": Effect({
        parameterDamages: [
            ParameterDamage({
                conditionFormula: "a.fp >= a.max_fp",
                parameterKey: "fp",
                point: "growth",
                type: "recover",
                formula: "500",
            }),
            ParameterDamage({
                conditionFallback: true,
                parameterKey: "fp",
                type: "recover",
                formula: "10000",
            }),
        ],
    }),
};

