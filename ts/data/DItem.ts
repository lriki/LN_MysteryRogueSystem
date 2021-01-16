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
export interface DItem {
    /** ID (0 is Invalid). */
    id: DItemDataId;

    /** Name */
    name: string;

    iconIndex: number;

    scope: DEffectScope;
    
    effect: DEffect;

    /** このアイテム(装備品) を装備できる部位 */
    equipmentParts: DEquipmentPartId[];

    /** 装備したときに適用する parameters */
    parameters: number[];

    /** 装備したときに適用する Trait */
    traits: IDataTrait[];
}

export const DItem_Default: DItem = {
    id: 0,
    name: "null",
    iconIndex: 0,
    scope: 0,
    effect: DEffect_Default,
    equipmentParts: [],
    parameters: [],
    traits: [],
}


