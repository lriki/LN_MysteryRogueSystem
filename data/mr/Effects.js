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
        parameterValues: [
            ParameterValue({
                parameterKey: "fp",    // FPを、
                type: "recovery",       // 回復する。
                formula: "500",        // 値は5%。
                silent: true,          // メッセージを表示しない。
            }),
        ],
    }),
    //--------------------------------------------------------------------------
    "kEffect_すばやさ草A_Main": Effect({
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
    "kEffect_ちからの草A_Main": Effect({
        parameterValues: [
            ParameterValue({           // pow(ちから) が 最大値よりも小さい場合、pow の現在値(actual) を 1 回復する。
                conditionFormula: "a.pow < a.max_pow",
                parameterKey: "pow",
                point: "actual",
                type: "recovery",
                formula: "1",
            }),
            ParameterValue({           // pow が 最大値の場合、pow の最大値(の算出要因となる成長値(growth)) を 1 回復(上昇)する。
                conditionFormula: "a.pow == a.max_pow",
                parameterKey: "pow",
                point: "growth",
                type: "recovery",
                formula: "1",
            }),
        ],
        flavorEffect: FlavorEffect({
            animationId: 51,
        }),
    }),
    //--------------------------------------------------------------------------
    "kEffect_しあわせ草A_Main": Effect({
        parameterValues: [
            ParameterValue({
                parameterKey: "level",  // レベルの、
                point: "growth",        // 最大値(の基準)を
                type: "recovery",        // 回復(上昇) する。
                formula: "1",           // 値は 1。
            }),
        ],
        flavorEffect: FlavorEffect({
            animationId: 52,
        }),
    }),
    //--------------------------------------------------------------------------
    "kEffect_めつぶし草A_Main": Effect({
    }),
    //--------------------------------------------------------------------------
    "kEffect_高跳び草A_Main": Effect({
        specialEffects:[
            SpecialEffect({
                code: "RandomWarp",    // ランダムワープの特殊効果
            }),
        ],
    }),
    //--------------------------------------------------------------------------
    "kEffect_毒草A_Main": Effect({
        parameterValues: [
            ParameterValue({           // HP に 5 ダメージ
                parameterKey: "hp",
                formula: "5",
            }),
            ParameterValue({           // POW に 1 ダメージ
                parameterKey: "pow",
                formula: "3",
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
        ],
    }),
    "kEffect_毒草A_Enemy": Effect({
        parameterValues: [
            ParameterValue({           // HP に 1 ダメージ
                parameterKey: "hp",
                formula: "1",
            }),
        ],
    }),
    //--------------------------------------------------------------------------
    "kEffect_毒草B_Main": Effect({
        parameterValues: [
            ParameterValue({           // HP に 5 ダメージ
                parameterKey: "hp",
                formula: "5",
            }),
            ParameterValue({           // POW に 1 ダメージ
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
        ],
    }),
    "kEffect_毒草B_Enemy": Effect({
        parameterValues: [
            ParameterValue({           // HP に 5 ダメージ
                parameterKey: "hp",
                formula: "5",
            }),
        ],
        specialEffects:[
            SpecialEffect({             // ステート追加
                code: "AddState",
                stateKey: "kState_ATK0",
                chance: 1.0,
            }),
        ],
    }),
    //--------------------------------------------------------------------------
    "kEffect_薬草A_Main": Effect({
        parameterValues: [
            ParameterValue({
                conditionTargetCategoryKey: "kEntityCategory_Actor",
                conditionFormula: "a.hp == a.max_hp",
                parameterKey: "hp",
                point: "growth",
                type: "recovery",
                formula: "1",
            }),
            ParameterValue({
                conditionFallback: true,
                parameterKey: "hp",
                type: "recovery",
                formula: "250",
            }),
        ],
    }),
    //--------------------------------------------------------------------------
    "kEffect_弟切草A_Main": Effect({
        parameterValues: [
            ParameterValue({
                conditionTargetCategoryKey: "kEntityCategory_Actor",
                conditionFormula: "a.hp == a.max_hp",
                parameterKey: "hp",
                point: "growth",
                type: "recovery",
                formula: "2",
            }),
            ParameterValue({
                conditionFallback: true,
                parameterKey: "hp",
                type: "recovery",
                formula: "1000",
            }),
        ],
    }),
    //--------------------------------------------------------------------------
    "kEffect_毒消し草A_Main": Effect({
        parameterValues: [
            ParameterValue({
                parameterKey: "pow",
                type: "recovery",
                formula: "b.max_pow - b.pow",
                parameterFlavorEffects: [
                    ParameterFlavorEffect({
                        addition: "gain",
                        flavorEffect: FlavorEffect({
                            text: "%1の%2が回復した。",
                        }),
                    }),
                ],
            }),
        ],
    }),
    "kEffect_毒消し草A_ドレインタイプダメージ": Effect({
        parameterValues: [
            ParameterValue({
                parameterKey: "hp",
                type: "damage",
                formula: "50",
            }),
        ],
        flavorEffect: FlavorEffect({
            animationId: 45,
        }),
    }),
    //--------------------------------------------------------------------------
    "kEffect_火炎草A_Eat": Effect({
        parameterValues: [
            ParameterValue({
                parameterKey: "hp",
                type: "damage",
                formula: "75",
            }),
        ],
        flavorEffect: FlavorEffect({
            animationId: 66,
        }),
    }),
    "kEffect_火炎草A_Collide": Effect({
        parameterValues: [
            ParameterValue({
                parameterKey: "hp",
                type: "damage",
                formula: "50",
            }),
        ],
        flavorEffect: FlavorEffect({
            animationId: 66,
        }),
    }),
    //==========================================================================
    // 食料
    //==========================================================================
    //--------------------------------------------------------------------------
    "kEffect_腐ったおにぎりA_Main": Effect({
        parameterValues: [
            ParameterValue({
                parameterKey: "fp",
                type: "recovery",
                formula: "5000",
            }),
            ParameterValue({
                parameterKey: "hp",
                type: "damage",
                formula: "5",
            }),
            ParameterValue({
                parameterKey: "pow",
                type: "damage",
                formula: "1",
            }),
        ],
    }),
    //--------------------------------------------------------------------------
    "kEffect_おにぎりA_Main": Effect({
        parameterValues: [
            ParameterValue({
                conditionFormula: "a.fp >= a.max_fp",
                parameterKey: "fp",
                point: "growth",
                type: "recovery",
                formula: "200",
            }),
            ParameterValue({
                conditionFallback: true,
                parameterKey: "fp",
                type: "recovery",
                formula: "5000",
            }),
        ],
    }),
    //--------------------------------------------------------------------------
    "kEffect_大きなおにぎりA_Main": Effect({
        parameterValues: [
            ParameterValue({
                conditionFormula: "a.fp >= a.max_fp",
                parameterKey: "fp",
                point: "growth",
                type: "recovery",
                formula: "500",
            }),
            ParameterValue({
                conditionFallback: true,
                parameterKey: "fp",
                type: "recovery",
                formula: "10000",
            }),
        ],
    }),
};

