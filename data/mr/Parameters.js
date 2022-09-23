//==============================================================================
// Parameter 設定ファイル
//------------------------------------------------------------------------------
// 標準で定義された各種パラメータに対する追加設定や、タイトル固有の追加パラメータ
// の定義・設定を行うための設定ファイルです。
//==============================================================================
/// <reference path="./MysteryRogueSystem.d.ts" />
const MR = require("MysteryRogueSystem");
MR.db.parameters = {
    //--------------------------------------------------------------------------
    // fp: 満腹度
    //--------------------------------------------------------------------------
    "fp": {
        setup: (parameter) => {
            parameter.addFlavorEffect({
                looksFaction: MR.DFactionType.Neutral,          // 勢力を問わず、
                point: MR.DValuePoint.Current,                  // 現在値が、
                addition: MR.DValueAddition.Gain,               // 増えた時、
                conditionFormula: "value < max",                // 最大値より小さい場合は、
                flavorEffect: {
                    text: tr("%1はおなかがふくれた。"),         // "おなかがふくれた" と表示する。
                    sound: { name: "Heal1", volume: 90 },       // 効果音を再生する。
                }
            });
            parameter.addFlavorEffect({
                looksFaction: MR.DFactionType.Neutral,          // 勢力を問わず、
                point: MR.DValuePoint.Current,                  // 現在値が、
                addition: MR.DValueAddition.Gain,               // 増えた時、
                conditionFormula: "value >= max",               // 最大値に達した場合は、
                flavorEffect: {
                    text: tr("%1はおなかがいっぱいになった。"), // "おなかがいっぱいになった" と表示する。
                    sound: { name: "Heal1", volume: 90 },       // 効果音を再生する。
                }
            });
            parameter.addFlavorEffect({
                looksFaction: MR.DFactionType.Neutral,          // 勢力を問わず、
                point: MR.DValuePoint.Maximum,                  // 最大値が、
                addition: MR.DValueAddition.Gain,               // 増えた時、
                flavorEffect: {
                    text: MR.DTextManager.actorGain             // "増えた" と表示する。(ツクールのエディタで設定された文字列)
                },
            });
        }
    },
    //--------------------------------------------------------------------------
    // level: レベル
    //--------------------------------------------------------------------------
    "level": {
        setup: (parameter) => {
            // レベルアップ
            parameter.addFlavorEffect({
                looksFaction: MR.DFactionType.Neutral,          // 勢力を問わず、
                point: MR.DValuePoint.Current,                  // 現在値が、
                addition: MR.DValueAddition.Gain,               // 増えた時、
                flavorEffect: {
                    text: MR.DTextManager.levelUp.replace("%3", "%5"),  // レベルアップのメッセージを表示する。(ツクールのエディタで設定された文字列)
                    sound: { name: "Decision5", volume: 90 },           // 効果音を再生する。
                }
                // NOTE: レベルアップ時のメッセージは、ツクールのエディタで設定された文字列を使用しています。
                //       ツクールの標準システムでは、この文字列に含まれる %3 はレベルアップ後の値となります。
                //       一方このプラグインでは、レベルは特別なパラメータではなく他 (HPやATKなど) と同様に扱われるため、
                //       %3 はレベルアップ前後の増加量となります。そのため、プラグインで使用できるように %3 を %5 に置換しています。
                //       ※ %4 と %5 はそれぞれ、レベルアップ前の値、レベルアップ後の値です。
            });
            // レベルダウン
            parameter.addFlavorEffect({
                looksFaction: MR.DFactionType.Neutral,          // 勢力を問わず、
                point: MR.DValuePoint.Current,                  // 現在値が、
                addition: MR.DValueAddition.Loss,               // 減った時、
                flavorEffect: {
                    text: tr("%1は%2 %5 にさがった。"),         // レベルダウンのメッセージを表示する。
                }
            });
        }
    },

    // NOTE: 拡張パラメータのテスト
    "__test_param1": {
        setup: (parameter) => {
        }
    },
};

