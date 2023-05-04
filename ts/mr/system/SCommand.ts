import { DActionId, DCommandId } from "../data/DCommon";
import { MRData } from "../data/MRData";
import { LEntity } from "../lively/entity/LEntity";
import { SCommandContext } from "./SCommandContext";
import { SEffectContext } from "./SEffectContext";
import { SSubTaskChain, STaskYieldResult } from "./tasks/STask";

/**
 * RECommand の処理結果
 * 
 * 
 *
 * NOTE:
 * Behavior の Command 実行処理は、直前の Behavior の Response 結果にかかわらず呼び出されます。
 * 直前の結果が Pass であるような前提を期待せず、基本的には
 * 「直前の Behavior の処理で Command が失敗したら、この Command も実行しない」といった判定を入れてください。
 * 例外は「武器を振るだけでステータスダウン」のような、Command の成否にかかわらず実行したい処理です。
 * 
 */
export enum SCommandResponse
{
    /** 
     * 目的の処理を、意味のある結果を以って実行し終え、Command は実行済みであることを示します。
     * 
     * Behavior の実装の中でこのコマンドを return した場合、後続の Behavior に Command は通知されません。
     */
    Handled,

    /** RECommand はハンドリングされませんでした。続けて後続の Behavior に RECommand を通知します。 */
    Pass,

    /** 状態異常の制限により、目的の処理を実行できなかったことを示します。後続の Behavior に RECommand は通知されません。 */
    Canceled,

    //Aborted,

    /*
    デフォルトの動作をオーバーライドしたいケース
    - Behavior を additionalBehavior として追加する



    全部 Behavior が Pass を返した場合は？
    - Entity は指定コマンドに対して無関心であるか、処理が想定されていない（未知のアクションである）ということ。
      この場合データ保護の観点から、コマンド発行側は「意味のないことをした」として処理しなければならない。
      例えばアイテムっぽいものを拾おうとしたが、そのアイテムっぽいEntity が
      Pick アクションを処理できない (Pass を返した) 場合は、elona 的な「空気をつかんだ」にする。
    */
}

export enum SPhaseResult {
    /** Behavior Chain の実行を続ける。 */
    Pass,

    /** Behavior Chain の実行を終了する。 */
    Handled,
}

export function checkContinuousResponse(r: SCommandResponse): boolean {
    return r == SCommandResponse.Pass;
}

// export enum SCommandResolveMode {
//     /**
//      * Command は Behavior に対して、処理の許可を問い合わせるものであることを示す。
//      * 
//      * onCommand() では、
//      * - accept() を呼び出すと、postCommand() の後続 Task が続行される。
//      * - accept() が一度も呼ばれない場合、postCommand() の後続 Task は実行されない。
//      */
//     Accept,

//     /**
//      * Command は Behavior に対して、処理の拒否を問い合わせるものであることを示す。
//      * 
//      * onCommand() では、
//      * - reject() を呼び出すと、postCommand() の後続 Task は続行されない。
//      * - reject() が一度も呼ばれない場合、postCommand() の後続 Task が実行される。
//      */
//     Reject,
// }


/**
 * onCommand の引数。
 * 
 * LActivity と似ているが、こちらは Recoding 対象外。シリアライズされるものではない。
 * LActivity は意思決定の履歴と考えることができる。対して SCommand は単純な引数のセットである。
 * 
 * Entity の行動ではなく、 GUI フレームワークでよくあるイベントのようなものであると考えるとわかりやすいかもしれない。
 * 例えばメニューを実行するコマンドはよく使うが、それと同じ仕組みで、メニューの実行自体ができるかどうかをチェックするコマンドもある。
 * 
 * [2023/4/5]
 * ----------
 * Data に Command 持たせて CommandId で運用していたが、継承ベースに変更した。
 * 理由は、
 * - コマンドに紐づく引数がわかりやすい。
 * - 元の DCommand 実装時から時間が経ったが、 DB 化する利点があまり思いつかなかった。
 * 
 * 将来的なこととして、 Command じゃなくて Query という名前の方がいいかも知しれない。
 * 今の Command の用途は何か実行させるだけではなく、実行できるかどうかを確認するために使うこともある。
 */
export class SCommand {
    public readonly receiver: LEntity;  // このコマンドを受け取る Entity
    //public readonly target: LEntity;
    //private _objects: readonly LEntity[];
    public readonly acceptRequired: boolean;

    public constructor(receiver: LEntity, acceptRequired: boolean) {
        this.receiver = receiver;
        this.acceptRequired = acceptRequired;
        //this.target = target;
        //this._objects = [];
    }

    // public get objects(): readonly LEntity[] {
    //     return this._objects;
    // }

    // public withObject(object: LEntity): this {
    //     this._objects = [object];
    //     return this;
    // }

    // public withObjects(objects: readonly LEntity[]): this {
    //     this._objects = objects;
    //     return this;
    // }

    public *onExecute(entity: LEntity, cctx: SCommandContext): Generator<STaskYieldResult> {
    }
}

/**
 * Item (target) を、今ある場所 (Owner) から取り出せるかテストする。
MRBasics.commands.testPickOutItem
 */
export class STestTakeItemCommand extends SCommand {
    /** 取得しようとしている人 (Item を持っている人ではなくて、それを得ようとしている人) */
    public readonly actor: LEntity;

    public constructor(item: LEntity, actor: LEntity) {
        super(item, false);
        this.actor = actor;
    }

}

/**
 * Item (target) を、Owner (actor) へ追加できるかテストする。
 * MRBasics.commands.testPutInItem
 */
export class STestAddItemCommand extends SCommand {
    public readonly item: LEntity;

    public constructor(entity: LEntity, item: LEntity) {
        super(entity, true);
        this.item = item;
    }
}



export class SEndProjectileMovingCommand extends SCommand {
    public readonly cause: SEndProjectileMovingCause;

    public constructor(receiver: LEntity, cause: SEndProjectileMovingCause) {
        super(receiver, false);
        this.cause = cause;
    }
}

export enum SEndProjectileMovingCause {
    Fall,           // 射程限界による落下など
    NoPassage,      // 通行不可
    HitToEntity,    // 命中
}

/*
[2023/4/19] SystemAction と ItemAction(仮) に分けたほうが良いのでは？
----------

ItemAction は、 Entity の Reaction に指定できるもの。
今 LItemBehavior が持っているようなのが対象で、次のようなものがある。
- 食べる
- 読む
- 振る
- 衝突する
これらは subject,target,item が必要であり、Reaction にて Effect を発動できるなど、ほぼフレームワーク化できる。
考え方としては、「subject が target へ item を action させる」という具合。
- Player が Player へ Item を 食べさせる
- Player が Enemy へ Item を 衝突させる

対して、次のようなものは Reaction を伴うようなものではない。
- 移動する
- (NPCと)話す
- (罠で)転ぶ
- スキルを発動する
- (足元のアイテムを)拾う
- (足元のアイテムと)交換する
強引に伴わせることもできるし今はそうなっているが、このため処理のイメージが非常につかみにくくなっている。

Item を伴う Activity はいったん全部 ItemAction にしてもよいかもしれない。
- 拾う
- 交換する
- 投げる
このあたりも Item を伴う。

*/
export class SItemReactionCommand extends SCommand {
    public readonly itemActionId: DActionId;
    public readonly item: LEntity;
    public readonly target: LEntity;
    public readonly objects: LEntity[]; // 壺に入れるアイテムや、識別の巻物の対象など
    public readonly subject: LEntity;
    public readonly direction: number;  // 衝突処理時に方向が必要になる場合に参照する

    public constructor(itemActionId: DActionId, item: LEntity, target: LEntity, objects: LEntity[], subject: LEntity, direction: number) {
        super(item, false);
        this.itemActionId = itemActionId;
        this.item = item;
        this.target = target;
        this.objects = [...objects];
        this.subject = subject;
        this.direction = direction;
    }
}

/**
 * 罠などで転びバラまかれた Item に対して通知するコマンド。
 * 
 * 転ばぬ先の杖や、モンスターが転び石にかかったときなど、いわゆる「アイテムドロップ」の時は発生しない。
 * このコマンドでは、壺などのアイテムが割れる可能性がある。
 */
export class SSprinkleDropedCommand extends SCommand {
    public readonly item: LEntity;
    public constructor(item: LEntity) {
        super(item, false);
        this.item = item;
    }
}
