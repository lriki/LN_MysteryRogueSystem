//==============================================================================
// Emittor 設定ファイル
//------------------------------------------------------------------------------
// 
//==============================================================================
/// <reference path="./MysteryRogueSystem.d.ts" />
const MR = require("MysteryRogueSystem/ts/main");

MR.db.emittors = {
    //--------------------------------------------------------------------------
    // "kEmittor_すばやさ草A": Emittor({
    //     targetEffectKeys: [
    //         "kEffect_すばやさ草A",
    //     ],
    // }),
    "kEmittor_すばやさ草A_飲む": Emittor({
        targetEffectKeys: [
            "kEffect_すばやさ草A_Main",
            "kEffect_FP回復5",
        ],
    }),
    //--------------------------------------------------------------------------
    "kEmittor_毒草A": Emittor({
        targetEffects: [
            EffectRef({     // 他の EffectRef の条件が満たされなかった場合に、この効果を適用する
                effectKey: "kEffect_毒草A_Main",
                conditionFallback: true,
            }),
            EffectRef({     // 対象が Enemy の場合、この効果を適用する
                effectKey: "kEffect_毒草A_Enemy",
                conditionTargetCategoryKey: "kEntityCategory_Enemy",
            }),
        ],
    }),
    //--------------------------------------------------------------------------
    "kEmittor_毒草B": Emittor({
        targetEffects: [
            EffectRef({
                effectKey: "kEffect_毒草B_Main",
                conditionFallback: true,
            }),
            EffectRef({
                effectKey: "kEffect_毒草B_Enemy",
                conditionTargetCategoryKey: "kEntityCategory_Enemy",
            }),
        ],
    }),
    //--------------------------------------------------------------------------
    "kEmittor_毒消し草A": Emittor({
        targetEffects: [
            EffectRef({
                effectKey: "kEffect_毒消し草A_Main",
                conditionFallback: true,
            }),
            EffectRef({
                effectKey: "kEffect_毒消し草A_ドレインタイプダメージ",
                conditionTargetRaceKey: "kRace_ドレイン系",
            }),
        ],
    }),
    //--------------------------------------------------------------------------
    "kEmittor_火炎草A_Eat": Emittor({
        scopeType: "front",
        targetEffects: [
            EffectRef({
                effectKey: "kEffect_火炎草A_Eat",
            }),
        ],
    }),
    "kEmittor_火炎草A_Collide": Emittor({
        targetEffects: [
            EffectRef({
                effectKey: "kEffect_火炎草A_Collide",
            }),
        ],
    }),
    //--------------------------------------------------------------------------
    "kEmittor_TestポーションA_Main": Emittor({
        targetEffectKeys: [
            "kEffect_TestHP回復500_Main",
            "kEffect_FP回復5",
        ],
    }),
    "kEmittor_TestポーションA_投げ当て": Emittor({
        targetEffectKeys: [
            "kEffect_TestHP回復500_Main",
        ],
    }),
};

