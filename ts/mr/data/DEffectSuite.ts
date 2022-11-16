import { DEffectId, DEntityCategoryId, DRaceId } from "./DCommon";
import { DEffect, DEffectHitType } from "./DEffect";
import { MRData } from "./MRData";

export interface DEffectConditions {
    targetCategoryId: DEntityCategoryId;

    /** 判定する RaceId。 0 の場合は対象外。 */
    targetRaceId: DRaceId;
    
    applyRating: number;  // EnemyAction と同じ整数。0 はレート無し
    

    fallback: boolean;
}

/**
 * Script での設定のしやすさを考慮して、 condition を Emittor 寄りの情報とした、 Effect 参照情報。
 * 
 * 条件は Effect 単体以外にも、複数の Effect と関連してどれか一つを選びだしたりするものがあるため、
 * Effect に付く情報ではなく、そのひとつ上の、Effect たちを取りまとめる側に付ける方がイメージしやすい。
 */
export class DEffectRef {
    private _effectId: DEffectId;

    conditions: DEffectConditions;

    public constructor(effectId: DEffectId) {
        this._effectId = effectId;
        this.conditions = { targetCategoryId: 0, targetRaceId: 0, applyRating: 0, fallback: false };
    }

    public get effectId(): DEffectId {
        return this._effectId;
    }

    public get effect(): DEffect {
        return MRData.effects[this._effectId];
    }

    public hasCondition(): boolean {
        if (this.conditions.targetCategoryId != 0) return true;
        if (this.conditions.targetRaceId != 0) return true;
        if (this.conditions.applyRating != 0) return true;
        if (this.conditions.fallback) return true;
        return false;
    }

    public copyFrom(src: DEffectRef): void {
        this._effectId = src._effectId;
        this.conditions = { ...src.conditions };
    }

    public clone(): DEffectRef {
        const effect = MRData.cloneEffect(this.effect);
        const ref = new DEffectRef(effect.id);
        ref.conditions = { ...this.conditions };
        return ref;
    }
}


/**
 * SEffectContext のエントリポイントに入力する情報。
 * 
 * Emittor の発動条件をクリアした後の、ひとつの「効果適用」に関係する様々な Effect をまとめるクラス。
 * このクラスの情報は Emittor に統合することも検討したが、 Effect 適用周りのコードは複雑なので、
 * あえて分離し、EffectContext 内の処理では Emittor の情報を参照しないようにした。
 * 
 * 新種道具を作るときは、これが効果の1単位となる。
 */
 export class DEffectSuite {

    /** 使用者に対して与える効果 */
    selfEffectId: DEffectRef;

    /**
     *  対象への効果が成功したときのみ、使用者に与える効果。
     * v0.5.0時点ではもろはの杖しか使っていないが、他にもしあわせ草の武器印の効果等に使える。
     */
    succeededSelfEffect: DEffectRef | undefined;
    
    /** 対象に対して与える効果。matchConditions を判定して、最終的に適用する Effect を決める */
    private _targetEffectRefs: DEffectRef[];

    public constructor(sourceKey: string) {
        this.selfEffectId = new DEffectRef(MRData.newEffect(sourceKey).id);
        this._targetEffectRefs = [];
    }

    public get selfEffect(): DEffectRef {
        return this.selfEffectId;
    }
    
    public targetEffects(): readonly DEffectRef[] {
        return this._targetEffectRefs;
    }

    public targetEffect(index: number): DEffectRef {
        return this._targetEffectRefs[index];
    }

    public clearTargetEffects(): void {
        this._targetEffectRefs = [];
    }

    public setTargetEffect(index: number, value: DEffectRef): void {
        this._targetEffectRefs[index] = value;
    }

    public addTargetEffect(value: DEffectRef): void {
        this._targetEffectRefs.push(value);
    }

    public copyFrom(src: DEffectSuite): void {
        this.selfEffect.copyFrom(src.selfEffect);
        this._targetEffectRefs = [];
        for (const ref of src._targetEffectRefs) {
            this._targetEffectRefs.push(ref.clone());
        }
    }

    public hitType(): DEffectHitType {
        return this.targetEffect(0).effect.hitType;
    }
}


//------------------------------------------------------------------------------
// Props


/*
基本の考えは RMMZ イベントの [出現条件] と同じ。
条件は AND。設定されているものが全て満たされていれば、マッチする。
ただし、全く未設定の場合は無条件で有効となる。

選択処理は次の通り。
- 条件が何も設定されてないものは常に発動する。
    複数ある場合は同時に発動する。
    他に条件指定がある Effect とも同時発動する。
- 条件が設定されているものは次のように選択する。
    - まず条件が設定されているものをフィルタリングする。
    - rating を持つものがひとつでもある場合、rating が 1 以上の Effect を対象にランダム選択する。
    - rating が 0 のものは常に発動する。
    - 上記の結果ひとつも実行できるものが無い場合、fallback の Effect を発動する。



*/


export interface IEffectRef {
    effectKey: string;
    //conditions?: IEffectConditionsProps;

    
    conditionTargetCategoryKey?: string;

    /** 判定する RaceId。 0 の場合は対象外。 */
    conditionTargetRaceKey?: string;
    
    /** EnemyAction と同じ整数。0 はレート無し。 */
    conditionRating?: number;
    
    conditionFallback?: boolean;

    // NOTE: conditions は interface を分けずに、ここに直接書くようにする。
    //       設定ファイルはそこそこ複雑なので、あまりネストを増やしたりしたくない。
    //       Ojbect は XXXX({}) の書き方で統一したい。
}


// export interface IEffectConditionsProps {


//     targetCategoryKey?: string;

//     /** 判定する RaceId。 0 の場合は対象外。 */
//     targetRaceKey?: string;
    
//     /** EnemyAction と同じ整数。0 はレート無し。 */
//     rating?: number;
    
//     fallback?: boolean;


// }
