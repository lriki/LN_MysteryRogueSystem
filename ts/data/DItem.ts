import { DEntityProperties, DEntityProperties_Default } from "./DEntityProperties";
import { DEquipmentPartId } from "./DEquipmentPart";
import { DEffect, DEffectHitType, DEffectScope, DEffect_Default } from "./DSkill";

export type DItemDataId = number;

/*
ひとまず Item, Weapon Armor をまとめて表現してみる。
Item を装備するようなケースは無いが、装備品をアイテムとして扱うことはよくある。
（矢や杖を "セット" してショートカットキーで使えるようにすることはある）
食べられる武器、投げると特殊な効果を発揮する武器、アイテムを入れることができる盾、武器として使える両手盾など。
また合成印の素材は、装備品だけではなくあらゆるアイテムが対象となる。
 */
export class DItem {
    /** ID (0 is Invalid). */
    id: DItemDataId;

    /** Name */
    name: string;

    entity: DEntityProperties;

    iconIndex: number;

    scope: DEffectScope;

    animationId: number;
    
    effect: DEffect;

    /** このアイテム(装備品) を装備できる部位 */
    equipmentParts: DEquipmentPartId[];

    /** 装備したときに適用する parameters */
    parameters: number[];

    /** 装備したときに適用する Trait */
    traits: IDataTrait[];

    
    constructor(id: DItemDataId) {
        this.id = id;
        this.name = "null";
        this.entity = DEntityProperties_Default();
        this.iconIndex = 0;
        this.scope = 0;
        this.animationId = 0;
        this.effect = {
            ...DEffect_Default,
            parameterEffects: [],
            specialEffects: [],
        },
        this.equipmentParts = [];
        this.parameters = [];
        this.traits = [];
    }
}


