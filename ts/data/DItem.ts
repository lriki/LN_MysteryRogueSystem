import { DEffect, DEffectScope, DEffectSet, DEffect_Default } from "./DEffect";
import { DEntityProperties, DEntityProperties_Default } from "./DEntityProperties";
import { DEquipmentPartId } from "./DEquipmentPart";

export type DItemDataId = number;

/**
 * ひとまず Item, Weapon Armor をまとめて表現してみる。
 *Item を装備するようなケースは無いが、装備品をアイテムとして扱うことはよくある。
 *（矢や杖を "セット" してショートカットキーで使えるようにすることはある）
 *食べられる武器、投げると特殊な効果を発揮する武器、アイテムを入れることができる盾、武器として使える両手盾など。
 *また合成印の素材は、装備品だけではなくあらゆるアイテムが対象となる。
 *
 * 
 * [2021/5/19] Effect に対してタグのように Activity を振る案
 * ----------
 * - 火炎草のように飲んだ時と投げ当てた時で効果が変わるもの。飲んだ時は FP も回復する。
 * - さらに、これを新種道具の効果として継承できるようにしたい。
 * 
 * "火炎草" というひとつの Ability より、
 * "飲むとブレススキルを発動する", "投げ当てると炎ダメージを与える" 2つの Ability に分けた方がいいかも。
 * 
 * 草を飲むことによる FP 回復は Ability ではなく、草アイテム固有の Effect.
 * なので、"火炎草" アイテムの設定は
 * - ダメージ: なし
 * - <RE-Action:Eat=Effect(Param FP +5)>
 * - <RE-Ability: k飲むとブレススキルを発動する>
 * - <RE-Ability: k投げ当てると炎ダメージを与える>
 *
 * [2021/6/3] Effect と Action は分類するべきかも
 * ----------
 * - Effect は何かしらの動作や状況変化をうけて発動する効果。
 *   - 単にスキル効果を発動するもの
 *   - 吹き飛ばしのようにスクリプト側で制御する動作を開始するもの
 * 
 * Effect は RMMZ エディタ上ではスキルとして作成するのがいいかも。
 * - パラメータダメージはツクール標準で設定。
 * - 拡張パラメータは Note で設定。
 * - 吹き飛ばし効果やブレスは Note で、「ActionEffect」 みたいな名前で設定。
 * 
 * これを考慮すると「飲むとブレススキルを発動するAbility」は、
 * - <RE-Action:Eat=Effect(PerformSkill, kSkill_炎ブレス)>
 * 
 * 「kSkill_炎ブレス」は、
 * - <RE-Motion: ブレス>
 * だけでいいかな。射程目の前だけだし。
 * 
 * [2021/6/3] Projectile
 * ----------
 * 魔法弾、ドラゴン草、矢、大砲の弾、石、"技"による弾
 * 
 * これら、もしかしたら「射程」の一部と考えたほうがよいのかも？
 * 
 * 通常攻撃や火炎草は目の前に効果を発動する。
 * 矢弾は Projectile を出現させる。
 * 
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
    
    //effect: DEffect;
    effectSet: DEffectSet;

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
        this.effectSet = new DEffectSet();
        //this.effect = {
        //    ...DEffect_Default,
        //    parameterQualifyings: [],
        //    specialEffects: [],
        //},
        this.equipmentParts = [];
        this.parameters = [];
        this.traits = [];
    }
}


