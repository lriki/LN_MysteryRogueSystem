import { DEffect } from "./DSkill";

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

    effect: DEffect;
}


