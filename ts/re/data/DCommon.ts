
// export type DPresetId = number;
export type DEntityKindId = number;
export type DAttackElementId = number;
export type DSkillId = number;
export type DSpecificEffectId = number;
export type DRaceId = number;
export type DTerrainPresetId = number;

// /**
//  * システムに基づいた根本的な分類。
//  * 
//  * EntityKind とは異なりユーザーが安易に増やすべきではない。そのため DB では扱わず、enum とする。
//  * これによってデフォルトで追加される Behavior が変わる。
//  * 
//  * 例えば「壺」や「札」といったアイテムの種類はタイトルごとに変わるが、
//  * 「アイテム」「罠」といった種類はローグライクRPGとしては共通の要素となる。
//  */
// export enum DEntityClass {
//     Unit,

//     /**
//      * 主に Unit のインベントリによって所有され、 Unit の行動選択肢を増やすために利用できる Entity。
//      */
//     Item,
    
//     Trap,
// }


// Sub-Component を検索するためのキー
export class DSubComponentEffectTargetKey {
    path: string;
    kindId: DEntityKindId;
    tags: string[];

    public constructor() {
        this.path = "";
        this.kindId = 0;
        this.tags = [];
    }

    public static make(path: string, kindId?: DEntityKindId | undefined, tags?: string[] | undefined): DSubComponentEffectTargetKey {
        const i =  new DSubComponentEffectTargetKey();
        i.path = path;
        if (kindId) i.kindId = kindId;
        if (tags) i.tags = tags;
        return i;
    }

    public clone(): DSubComponentEffectTargetKey {
        const i = new DSubComponentEffectTargetKey();
        i.path = this.path;
        i.kindId = this.kindId;
        i.tags = this.tags.slice();
        return i;
    }
}


export interface DSubEntityFindKey {
    kindId: DEntityKindId;
    
    // Sub-Component を検索するための情報。
    // undefined ではない場合、上記の条件に一致した Entity に対して、さらにこの内容で検索をかける。
    key: DSubComponentEffectTargetKey | undefined;
}


export enum DSpecialEffectCodes {
    /*
    Game_Action.EFFECT_RECOVER_HP = 11;
Game_Action.EFFECT_RECOVER_MP = 12;
Game_Action.EFFECT_GAIN_TP = 13;
Game_Action.EFFECT_ADD_STATE = 21;
Game_Action.EFFECT_REMOVE_STATE = 22;
Game_Action.EFFECT_ADD_BUFF = 31;
Game_Action.EFFECT_ADD_DEBUFF = 32;
Game_Action.EFFECT_REMOVE_BUFF = 33;
Game_Action.EFFECT_REMOVE_DEBUFF = 34;
Game_Action.EFFECT_SPECIAL = 41;
Game_Action.EFFECT_GROW = 42;
Game_Action.EFFECT_LEARN_SKILL = 43;
Game_Action.EFFECT_COMMON_EVENT = 44;
Game_Action.SPECIAL_EFFECT_ESCAPE = 0;

*/
    /** 致命的な爆発 */
    //DeadlyExplosion = 101,
}

export enum DColorIndex {
    Default,
    
}

export enum DBlockLayerKind {
	/** 地形情報。壁・水路など。 */
	Terrain = 0,

	/** 地表に落ちているもの。アイテム・ワナ・階段など。 */
	Ground = 1,

	/** ユニット。PC・仲間・モンスター・土偶など。 */
	Unit = 2,

	/** 発射物。矢、魔法弾、吹き飛ばされたUnitなど。 */
    Projectile = 3,
    
    /** お店のセキュリティシステムなど、非表示だが Entity として存在するもの。 */
    System = 4,


    // Iteration
    Top = System,
}

export enum DBlockLayerScope {
    TopOnly,
    All,
}
