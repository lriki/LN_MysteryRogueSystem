
// export type DPresetId = number;
export type DActorId = number;
export type DParameterId = number & { readonly brand?: unique symbol };
export type DEntityCategoryId = number & { readonly brand?: unique symbol };

/** 属性データのインデックス。 RMMZ の ElementId と等しい。 */
export type DElementId = number & { readonly brand?: unique symbol };

export type DSkillId = number & { readonly brand?: unique symbol };

export type DSpecialEffectId = number & { readonly brand?: unique symbol };

export type DRaceId = number;
export type DTerrainShapeId = number;
export type DTerrainSettingId = number;
export type DTerrainPresetId = number;
export type DActionId = DSkillId;
export type DCommandId = number;
export type DEffectId = number & { readonly brand?: unique symbol }; // Do not include in save data
export type DEntityTemplateId = number & { readonly brand?: unique symbol };

/** Animation データのインデックス。 RMMZ の AnimationId と等しい。 */
export type DAnimationId = number & { readonly brand?: unique symbol };


export type DLandId = number;

/** DMap のインデックス。 RMMZ の MapId と等しい。 */
export type DMapId = number;


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
    kindId: DEntityCategoryId;
    tags: string[];

    public constructor() {
        this.path = "";
        this.kindId = 0;
        this.tags = [];
    }

    public static make(path: string, kindId?: DEntityCategoryId | undefined, tags?: string[] | undefined): DSubComponentEffectTargetKey {
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
    kindId: DEntityCategoryId;
    
    // Sub-Component を検索するための情報。
    // undefined ではない場合、上記の条件に一致した Entity に対して、さらにこの内容で検索をかける。
    key: DSubComponentEffectTargetKey | undefined;
}

export enum DColorIndex {
    Default = 0,
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
