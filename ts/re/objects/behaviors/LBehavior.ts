
/**
 * 
 * [2020/11/30] シンボル関数名 vs Id(number)
 * ----------
 * 少なくとも、シンボルを関数名として使うのはやめた方がよさそう。
 * post 側は、相手側の関数名を知る必要は無くしたい。
 * 
 * post では ActionId(Symbol or Number) を渡し、フレームワークによって
 * 従来の onPreReaction, onReaction を呼んでもらう。
 * 
 * ### 相手側の関数名を知っていたいときもある
 * 
 * 相手…というより、自分自身に post したいとき。向き変更や歩行が代表的かな。
 * これらは Action-Reaction のフレームワークがマッチしなかった者たち。
 * 
 * 
 * 
 * 
 * [2020/9/29] Behavior の代用
 * レンサのワナ、吸収の壺、あくまだんしゃく系
 * 
 * 
 * @note Attribute と Behavior を分ける必要はあるのか？
 * やはり移動がイメージしやすいかな。
 * Player, Enemy 共に Position は持つが、それをキー入力で更新するのか、AI で更新するのかは異なる。
 */

import { assert } from "ts/re/Common";
import { DActionId } from "ts/re/data/DAction";
import { DEventId } from "ts/re/data/predefineds/DBasicEvents";
import { SEffectContext, SEffectSubject } from "ts/re/system/SEffectContext";
import { RECommand, REResponse, SPhaseResult } from "../../system/RECommand";
import { SCommandContext } from "../../system/SCommandContext";
import { LBehaviorId, LEntityId, LObject, LObjectType } from "../LObject";
import { LEntity } from "../LEntity";
import { LActivity } from "../activities/LActivity";
import { DParameterId } from "ts/re/data/DParameter";
import { BlockLayerKind } from "../LBlockLayer";
import { LEventResult } from "../LEventServer";
import { DPrefabImage } from "ts/re/data/DPrefab";
import { DEntityNamePlate } from "ts/re/data/DEntity";
import { LCharacterAI } from "../ai/LCharacterAI";
import { SEffectorFact } from "ts/re/system/SEffectApplyer";
import { DSkillDataId } from "ts/re/data/DSkill";

export enum DecisionPhase {
    Prepare,
    Manual,
    AIMinor,
    UpdateState,
    ResolveAdjacentAndMovingTarget,
    AIMajor,
}

export enum LBehaviorGroup {
    Underlying = 0,
    SpecialAbility = 1,
}

export interface LNameView {
    name: string;
    iconIndex: number;
    upgrades: number;
    capacity?: number;
    initialCapacity?: number;
}

export interface CommandArgs {
    /** Behavior がアタッチされている Entity. */
    self: LEntity,

    /** Command を Post した人 */
    sender: LEntity,
    
    /**
     * 効果発動時に参照する subject. 経験値の取得者などを示す。
     * 
     * 1度のコマンドチェーンの中で複数回の攻撃とカウンターが互い違いに発生するケースでは
     * 個々のコールツリーごとに subject を持ちまわる必要があるため、CommandContext 側で管理するのは難しい。
     * そのため頑張って持ちまわる。
     */
    subject: SEffectSubject,
    

    args: any,
};

export const onPreThrowReaction = Symbol("onPreThrowReaction");
export const onThrowReaction = Symbol("onThrowReaction");
export const onMoveAsProjectile = Symbol("onMoveAsProjectile");
export const onWalkedOnTopAction = Symbol("onWalkedOnTopAction");
export const onWalkedOnTopReaction = Symbol("onWalkedOnTopReaction");
export const onMoveAsMagicBullet = Symbol("onMoveAsMagicBullet");



/**
 * Response
 * - Canceled : 呪い状態等のため、Inventory からアイテムを取り出すことはできない。
 */
export const testPickOutItem = Symbol("testPickOutItem");

/**
 * Response
 * - Canceled : 容量オーバーなどのため、アイテムを入れることができない。
 */
export const testPutInItem = Symbol("testPutInItem");

/**
 * knockback 状態の別の Entity が衝突しようとしている
 */
export const onCollidePreReaction = Symbol("onCollidePreReaction");

/**
 * 自分が knockback 状態であり、何らかの別の Entity に衝突した
 */
export const onCollideAction = Symbol("onCollideAction");


/**
 * 食べられた
 */
export const onEatReaction = Symbol("onEatReaction");

/**
 * (杖など) 振られた
 */
export const onWaveReaction = Symbol("onWaveReaction");

//export const onReadReaction = Symbol("onReadReaction");

/**
 * (階段など) 進まれた
 */
export const onProceedFloorReaction = Symbol("onProceedFloorReaction");

/**
 * 攻撃された
 */
export const onAttackReaction = Symbol("onAttackReaction");

/**
 * 直接攻撃がヒットし、ダメージを受けた。
 * - 外れたときは呼ばれない。
 * - ヤリなど、隣接していなくても呼ばれることがある。
 */
export const onDirectAttackDamaged = Symbol("onDirectAttackDamaged");

/**
 * 接地した。
 * 
 * 落下とはことなり、例えば既にアイテムがあるところに落ちようとした時は周囲タイルへ落ちていくが、
 * そういった落下完了までの諸々の処理が解決され、本当に地面上に着地したときに呼ばれる。
 */
export const onGrounded = Symbol("onGrounded");


export interface CollideActionArgs {
    dir: number;    // 飛翔中の Entity の移動方向。必ずしも Entity の向きと一致するわけではないため、Args として渡す必要がある。
}

/*
    NOTE: test** について
    指定された Command を実行できるかを確認する。
    その際、呪いのため装備を外せない等の場合はメッセージログを通じてプレイヤーに見える形で表示する。

    Command の実行可否にかかわらず、test** は "絶対に World(Entity) の状態を変えない" 点に注意。

    なお、実行できる可能性のある Action を返すことが目的の queryActions() とは異なるので注意。


    Pass : そもそも

    [2020/12/28]
    例えば倉庫でアイテムを移す処理で…
    1. Player 側の都合を考慮して、Item が取り出せるか確認する。(呪いなど)
    2. 倉庫 側の都合を考慮して、Item を格納できるか確認する。(容量など)
    3. 上記双方が OK の場合、Item を移す。
    1 と 2 について、倉庫側の処理で呪いの有無を判断するのは責任範囲的におかしいので、Command にしておきたい。
    しかし、1 と 2 の時点では実際に Item を移していいのかはわからない。確認のみにとどめたい。
*/

/**
 * Entity の動作を定義する
 * 
 * [2021/3/14]
 * ----------
 * 従来は派生クラスで State 用の StateBehavior や Ability 用の AbilityBehavior を作っていたが、これを禁止する。
 * たとえば "ハラヘリ" という Behavior は "ハラヘリ状態異常" や "ハラヘリの腕輪" で共有できるようにしておくことで、カスタマイズ性を確保しておきたい。
 */
export abstract class LBehavior extends LObject {
    //private _id: LBehaviorId = { index: 0, key: 0 };
    //private _ownerObjectId: LObjectId = { index: 0, key: 0 };
    
    public constructor() {
        super(LObjectType.Behavior);
    }

    public setup(...args: any[]): void {

    }

    public id(): LBehaviorId {
        return this.__objectId();
    }

    //public _setOwnerObjectId(id: LObjectId): void {
    //    assert(this._ownerObjectId.index == 0); // 初回設定のみ許可
    //    this._ownerObjectId = id;
    //}

    //public ownerObjectId(): LObjectId {
    //    return this._ownerObjectId;
    //}

    //public ownerObject(): LObject {
    //    return REGame.world.object(this._ownerObjectId);
    //}

    public ownerEntity(): LEntity {
        const owner = this.parentObject();
        if (owner.objectType() == LObjectType.Ability ||
            owner.objectType() == LObjectType.State) {
            // Entity がフィールドに保持して参照する Object は、Entity までさかのぼって返す
            const owner2 = owner.parentObject();
            assert(owner2.objectType() == LObjectType.Entity);
            return owner2 as LEntity;
        }
        else if (owner.objectType() == LObjectType.Entity) {
            return owner as LEntity;
        }
        else {
            throw new Error();
        }
    }

    /**
     * 子オブジェクトが破棄されるなど、親オブジェクトから直ちに取り除くべき時に呼び出される。
     * この動作はキャンセルできないため、例えば呪い状態による装備の着脱判定などは行わず、確実に除外しなければならない。
     */
    onRemoveChild(entity: LEntity): void {}

    /**
     * 親オブジェクトから直ちに取り除くべき時に呼び出される。
     * この動作はキャンセルできないため、例えば呪い状態による装備の着脱判定などは行わず、確実に除外しなければならない。
     */
     onOwnerRemoveFromParent(owner: LObject): void {}

    onAttached(self: LEntity): void {}
    onDetached(self: LEntity): void {}
    onEvent(context: SCommandContext, eventId: DEventId, args: any): LEventResult { return LEventResult.Pass; }
    onPartyEvent(eventId: DEventId, args: any): LEventResult { return LEventResult.Pass; }



    dataId: number = 0;
    //_ownerEntityId: LEntityId = { index: 0, key: 0 };
    

    //onRemoveEntityFromWhereabouts(context: SCommandContext, entity: LEntity): REResponse { return REResponse.Pass; }

    public behaviorGroup(): LBehaviorGroup { return LBehaviorGroup.Underlying; }

    public queryDisplayName(): LNameView | undefined { return undefined; }
    public queryCharacterFileName(): DPrefabImage | undefined { return undefined; }
    
    public queryInnermostFactionId(): number | undefined { return undefined; }
    public queryOutwardFactionId(): number | undefined { return undefined; }
    
    // Entity が Map に配置されるとき、どのレイヤーを基本とするか。
    // NOTE: Entity の種別等で決定できないので、フィールドで持たせている。
    //       - やりすごし状態は、自身をアイテム化する状態異常として表現する。（やり過ごしを投げ当てる他、技によってもやり過ごし状態になる）
    //       - アイテム擬態モンスターは正体を現しているかによってレイヤーが変わる。
    //       - 土偶は落とすとアイテム、立てるとUnitのようにふるまう
    public queryHomeLayer(): BlockLayerKind | undefined { return undefined; }


    public onGetIdealParamBase(paramId: DParameterId): number | undefined {
        return 0;
    }
    

    // Attach されている Behavior や Attribute の状態に依存して変化する情報を取得する。
    // propertyId: see EntityProperties
    // undefined を返した場合は後続の Behavior の onQueryProperty() を呼び出し続ける。
    onQueryProperty(propertyId: number): any { return undefined; }

    // results: index is DParameterId
    onQueryIdealParameterPlus(parameterId: DParameterId): number { return 0; }

    /**
     * この Behavior が Attach されている Entity が送信できる Action を取得する。
     * 例えばキャラクターはアイテムを "拾う" ことができる。
     * 
     * 基本的に状態異常等は関係なく、その Entity が元々とれる行動を返すこと。
     * 例えば "封印" 状態であれば "食べる" ことはできないが、メニューから行動として
     * "食べる" を選択することはできるので、このメソッドは EatAction を返すべき。
     */
    public onQueryActions(actions: DActionId[]): DActionId[] { return actions; }

    /**
     * この Behavior が Attach されている Entity に対して送信できる Action を取得する。
     * 例えばアイテムはキャラクターに "拾われる" ことができる。
     * 
     * こちらも onQueryActions() 同様、状態に関係なくEntity が反応できる行動を返すこと。
     * 例えば "床に張り付いた聖域の巻物" は "拾う" ことはできないが、メニューから行動として
     * "拾う" を選択することはできるので、このメソッドは PickAction を返すべき。
     * 
     * なお "階段" Entity がこのメソッドで PickAction を返すと、階段を拾うことができてしまう。
     */
    public onQueryReactions(actions: DActionId[]): void { }

    public onQueryCharacterAI(characterAIs: LCharacterAI[]): void { }
    


    
    public onRefreshConditions(): void { }



    // 従来ver は Command 扱いだった。
    // 行動決定に関係する通知は Scheduler から同期的に送られるが、
    // できればこれを RECommandContext.sendCommand みたいに公開したくないので個別定義にしている。
    // また実行内容も onAction などとは少し毛色が違うので、あえて分離してみる。
    onDecisionPhase(entity: LEntity, context: SCommandContext, phase: DecisionPhase): SPhaseResult { return SPhaseResult.Pass; }

    public onPreprocessActivity(context: SCommandContext, activity: LActivity): LActivity { return activity; }

    onAction(entity: LEntity, context: SCommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
    
    /**
     * Activity の処理。
     * [飲む] [振る] [読む] など。
     */
    onActivity(self: LEntity, context: SCommandContext, activity: LActivity): REResponse { return REResponse.Pass; }
    
    /**
     * Activity を受ける側の処理。
     * [飲まれた] [振られた] [読まれた] など。
     */
    onActivityReaction(self: LEntity, context: SCommandContext, activity: LActivity): REResponse { return REResponse.Pass; }

    onApplyEffect(self: LEntity, context: SCommandContext, effect: SEffectContext): REResponse { return REResponse.Pass; }




    onCollectEffector(owner: LEntity, data: SEffectorFact): void {}
    onCollectTraits(result: IDataTrait[]): void {}

    /** 主に AI 行動決定用に、スキルの一覧を取得する */
    onCollectSkillActions(result: IDataAction[]): void {}

    /** 1行動消費単位の終了時点 */
    onStepEnd(context: SCommandContext): REResponse { return REResponse.Pass; }

    onPertyChanged(self: LEntity): void { }

    /**
     * self が発動したスキルの処理が終わった (成否は target の result を確認すること)
     * Skill の効果として、特定 Behavior の状態を変えたりするのに使う。
     */
    onSkillPerformed(context: SCommandContext, self: LEntity, target: LEntity, skillId: DSkillDataId): void {}

    
    //public removeThisState(): void {
    //    this.ownerAs(LState)?.removeThisState();
    //}

    public abstract clone(newOwner: LEntity): LBehavior;

    //--------------------

    //this.parentAs(LState)?.removeThisState();
}
