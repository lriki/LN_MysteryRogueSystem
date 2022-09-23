import { SScheduler } from "./SScheduler";
import { LEntity } from "../../lively/LEntity";
import { LUnitBehavior } from "../../lively/behaviors/LUnitBehavior";

export abstract class SSchedulerPhase {
    //abstract nextPhase(): SchedulerPhase;

    // AIMinor で iteration (stepのマージ) を許可してしまうと、
    // 倍速 Unit に対する罠の発動が、2回移動終了時になってしまう。
    //
    // ### MainProcess 終了時にワナ発動処理をすればよいのでは？
    // 罠の発動は、他の Unit の歩行が全部終わってから処理したい。そのため iteration でまとめて移動してしまうと都合が悪い。
    // ※ただし、AIMajorPhase での ワナ発動は、移動直後でも構わない、というかその方が自然に見えそう。
    abstract isAllowIterationAtPrepare(): boolean;

    onStart(): void {}



    abstract testProcessable(entity: LEntity, unitBehavior: LUnitBehavior): boolean;

    // この処理の中で CommandContext にコマンドが積まれた場合、
    // Scheduler はその処理を始め、全てコマンドを実行し終えたら次の unit の処理に移る。
    // コマンドが積まれなかった場合、即座に次の unit の処理に移る。
    abstract onProcess(entity: LEntity, unitBehavior: LUnitBehavior): void;

    onAfterProcess(entity: LEntity): void {}

    // Phase 終了時に1度呼ばれる
    onEnd(scheduler: SScheduler): void {}

}
