//==============================================================================
// Item Entity 設定ファイル
//------------------------------------------------------------------------------
//==============================================================================
/// <reference path="./MysteryRogueSystem.d.ts" />
const MR = require("MysteryRogueSystem");
MR.db.entities = {
    //==========================================================================
    // 武器
    //==========================================================================
    //--------------------------------------------------------------------------
    "kEntity_ドラゴンキラーA": Entity({
        equipmentTraits: [
            Trait({ code: "RaceRate", raceKey: "kRace_ドラゴン系", value: 1.5 }),
        ],
    }),
    //==========================================================================
    // 盾
    //==========================================================================
    //--------------------------------------------------------------------------
    "kEntity_皮の盾A": Entity({
        equipmentTraits: [
            Trait({ code: "SurvivalParameterLossRate", parameterKey: "fp", value: 0.5 }),
        ],
        selfTraits: [
            Trait({ code: "ParameterDamageRate", parameterKey: "upg", value: 0.0 }),
        ],
        // NOTE:
        // - SurvivalParameterLossRate は、ターン経過で減少する FP の減少率を 0.5 にします。
        //   これを equipmentTraits へ追加することで、盾を装備している Entity、つまりプレイヤーユニットの FP へこの効果を適用します。
        // - ParameterDamageRate は、upg(UpgradeValue=強化値) へのダメージ (つまりサビ) を 0 (無効化) にします。
        //   これを selfTraits へ追加することで、この盾自身へ効果を適用します。
    }),
    //--------------------------------------------------------------------------
    "kEntity_うろこの盾A": Entity({
        equipmentTraits: [
            Trait({ code: "SkillGuard", skillKey: "kSkill_毒攻撃" }),
            Trait({ code: "SkillGuard", skillKey: "kSkill_毒攻撃_強" }),
        ],
        // NOTE:
        //   SkillGuard は skillKey で指定されたスキルを無効化します。
        //   これを equipmentTraits へ追加することで、盾を装備している Entity、つまりプレイヤーユニットの FP へこの効果を適用します。
    }),
    //--------------------------------------------------------------------------
    "kEntity_金の盾A": Entity({
        selfTraits: [
            Trait({ code: "ParameterDamageRate", parameterKey: "upg", value: 0.0 }),
        ],
    }),
    //==========================================================================
    // 草・薬
    //==========================================================================
    //--------------------------------------------------------------------------
    "kEntity_火炎草A": Entity({
        reactions: [
            Reaction({
                actionKey: "kAction_Eat",
                emittorKeys: [
                    "kEmittor_火炎草A_Main",
                    "kEmittor_火炎草A_Eat"],
                commandName: "飲む",
            }),
            Reaction({
                actionKey: "kAction_Collide",
                emittorKeys: ["kEmittor_火炎草A_Collide"],
            }),
        ],
    }),
    //--------------------------------------------------------------------------
    "kEntity_TestポーションA": Entity({
        reactions: [
            Reaction({
                actionKey: "kAction_Eat",
                emittorKeys: ["kEmittor_TestポーションA_Main"],
                commandName: "飲む",
            }),
            Reaction({
                actionKey: "kAction_Collide",
                emittorKeys: ["kEmittor_TestポーションA_投げ当て"],
            }),
        ],
        selfTraits: [
            Trait({ code: "DeathVulnerableElement", elementKey: "kElement_DeathExplosion", stateKey: "kState_System_ExplosionDeath" }),
        ],
    }),
};
