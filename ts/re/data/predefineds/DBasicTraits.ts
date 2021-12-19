import { DTraitId } from "../DTraits";


// export interface DBasicStateTraits {
//     /** 仮眠 */
//     nap: DTraitId;
// }

export interface DBasicTraits {
    TRAIT_ELEMENT_RATE: DTraitId;// = 11,
    TRAIT_DEBUFF_RATE: DTraitId;//  = 12;
    TRAIT_STATE_RATE: DTraitId;// = 13,
    TRAIT_STATE_RESIST: DTraitId;// = 14;

    /**
     * Game_BattlerBase.TRAIT_PARAM
     * dataId: RMMZ ParameterId
     * value:  
     */
    TRAIT_PARAM: DTraitId;// = 21,
    TRAIT_XPARAM: DTraitId;// = 22,
    TRAIT_SPARAM: DTraitId;// = 23,

    TRAIT_ATTACK_ELEMENT: DTraitId;// = 31,
    TRAIT_ATTACK_STATE: DTraitId;// = 32;
    TRAIT_ATTACK_SPEED: DTraitId;// = 33;
    TRAIT_ATTACK_TIMES: DTraitId;// = 34;
    TRAIT_ATTACK_SKILL: DTraitId;// = 35;
    TRAIT_STYPE_ADD: DTraitId;// = 41;
    TRAIT_STYPE_SEAL: DTraitId;// = 42;
    TRAIT_SKILL_ADD: DTraitId;// = 43;
    TRAIT_SKILL_SEAL: DTraitId;//= 44;
    TRAIT_EQUIP_WTYPE: DTraitId;// = 51;
    TRAIT_EQUIP_ATYPE: DTraitId;// = 52;
    TRAIT_EQUIP_LOCK: DTraitId;// = 53;
    TRAIT_EQUIP_SEAL: DTraitId;// = 54;
    TRAIT_SLOT_TYPE: DTraitId;// = 55;
    TRAIT_ACTION_PLUS: DTraitId;// = 61;
    TRAIT_SPECIAL_FLAG: DTraitId;//= 62;
    TRAIT_COLLAPSE_TYPE: DTraitId;//= 63;
    TRAIT_PARTY_ABILITY: DTraitId;// = 64;



    // ↑ ここまでは RMMZ の Game_BattlerBase.TRAIT_xxxx と同一
    //----------
    
    _separator: DTraitId;// = 127,

    /**
     * 直接攻撃を必中にする。（命中率・回避率にかかわらず）
     */
    CertainDirectAttack: DTraitId;//,

    CertainIndirectAttack: DTraitId;//,

    /** 物理的な関節攻撃を完全回避する。 */
    DodgePhysicalIndirectAttack: DTraitId;

    /** 物理的な間接攻撃が全く当たらなくなる。 */
    AwfulPhysicalIndirectAttack: DTraitId;


    /** 地獄耳 */
    UnitVisitor: DTraitId;//,

    /** 何らかのアクションを受けたらステート解除。(仮眠や金縛りの解除で使う) */
    StateRemoveByEffect: DTraitId;//,

    Stackable: DTraitId;//,

    /**
     * アイテム種別ごとの "使うとき" の練度。
     * 食べる・投げる・読む等。攻撃でも有効。
     * 
     * dataId: DEntityKindId
     * value: 練度。1.0 で等倍
     */
    EffectProficiency: DTraitId;//,

    /**
     * アイテム種別ごとの "装備したとき" の練度。
     * 
     * 
     * dataId: DEntityKindId
     * value: 練度。1.0 で等倍
     */
    EquipmentProficiency: DTraitId;//,

    /**
     * Activity を禁止する。
     * 
     * dataId: DActionId
     */
    SealActivity: DTraitId;//,

    /**
     * 特殊能力封印
     */
    SealSpecialAbility: DTraitId;//,

    Invisible: DTraitId;//,

    ForceVisible: DTraitId;//,  Invisible 無効化

    ItemDropRate: DTraitId;//,

    /**
     * Fixed damage.
     * - dataId: DParamId
     * - value: DamageValue
     */
    FixedDamage: DTraitId;

    /** 必ず罠にかかる */
    DrawInTrap: DTraitId;

    /** 浅い眠りを必ず起こす。 */
    AwakeStep: DTraitId;

    /** 浅い眠りを起こさない。 */
    SilentStep: DTraitId;

    /**
     * 行動後に自動発動する効果
     * dataId: DSkillId
     * value:  発生率 (0.0~1.0)
     */
    SuddenSkillEffect: DTraitId;

    /**
     * サバイバルパラメータ自動減少率
     * dataId: DParamId
     * value:  率 (double)
     */
    SurvivalParamLossRate: DTraitId;

    
    /**
     * ダメージによるパラメータ減少率
     * dataId: DParamId
     * value:  率 (double)
     */
    ParamDamageRate: DTraitId;

    /**
     * スキル自体の無効化
     * dataId: SkillId
     */
    SkillGuard: DTraitId;

    /**
     * 罠にかからなくなる。浮遊とは意味が違うので注意。
     */
    DisableTrap: DTraitId;

    
    /**
     * 指定属性の回復効果に対する倍率
     */
    RecoverRate: DTraitId;

    /**
     * 指定属性の回復効果に対する倍率
     * dataId: ElementId
     * dataIdが0の場合は属性を問わない。
     */
    //ElementedRecoverRate: DTraitId;
}

