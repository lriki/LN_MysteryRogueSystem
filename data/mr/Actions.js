//==============================================================================
// Action 設定ファイル
//------------------------------------------------------------------------------
// "投げる", "食べる" のような Action に対する追加設定を行うための設定ファイルです。
//==============================================================================
/// <reference path="./MysteryRogueSystem.d.ts" />
const MR = require("MysteryRogueSystem");
MR.db.actions = {
    //--------------------------------------------------------------------------
    // [投げる]
    //--------------------------------------------------------------------------
    "kAction_Throw": {
        flavorEffect: FlavorEffect({
            sound: { name: "Bow1", volume: 90, pitch: 120, pan: 0 }, // 投げるときの効果音を指定する
        }),
    },
    //--------------------------------------------------------------------------
    // [撃つ]
    //--------------------------------------------------------------------------
    "kAction_Shoot": {
        flavorEffect: FlavorEffect({
            sound: { name: "Crossbow", volume: 90, pitch: 100, pan: 0 } // 撃つときの効果音を指定する
        }),
    },
    //--------------------------------------------------------------------------
    // [食べる]
    //--------------------------------------------------------------------------
    "kAction_Eat": {
    },
    
};
