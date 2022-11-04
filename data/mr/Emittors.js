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
            "kEffect_すばやさ草A",
            "kEffect_FP回復5",
        ],
    }),
    //--------------------------------------------------------------------------
    "kEmittor_TestポーションA_Main": Emittor({
        targetEffectKeys: [
            "kEffect_TestHP回復500",
            "kEffect_FP回復5",
        ],
    }),
    "kEmittor_TestポーションA_投げ当て": Emittor({
        targetEffectKeys: [
            "kEffect_TestHP回復500",
        ],
    }),
};

