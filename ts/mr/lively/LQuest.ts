import { MRSerializable, assert, tr2 } from "../Common";
import { DQuestId, DQuestTaskId } from "../data/DCommon";
import { DQuest, DQuestTask } from "../data/DQuest";
import { MRData } from "../data/MRData";
import { LEntityId } from "./LObject";

@MRSerializable
export class LQuest {
    public readonly dataId: DQuestId;
    public _status: LQuestStatus;
    public _tasks: LQuestTask[];

    /** 依頼人 */
    //client: LEntityId;

    public get data(): DQuest {
        return MRData.quests[this.dataId];
    }

    public get status(): LQuestStatus {
        return this._status;
    }

    // public set status(value: LQuestStatus) {
    //     this._status = value;
    // }
    

    public constructor(data: DQuest) {
        this.dataId = data.id;
        this._status = LQuestStatus.Inactive;
        this._tasks = [];
    }

    public openQuest(): void {
        assert(this._status === LQuestStatus.Inactive);
        this._status = LQuestStatus.Assignable;
        this.advanceQuestTask(this.data.tasks[0].key);
    }

    /**
     * 
     * @return 新しくタスクを開始した場合、その LQuestTask インスタンスを返す。タスクを開始しなかった場合は undefined を返す。
     */
    public advanceQuestTask(questTaskKey: string): LQuestTask | undefined {
        assert(this._status === LQuestStatus.Assignable || this._status === LQuestStatus.InProgress);
        const taskData = this.data.tasks.find(x => x.key === questTaskKey);
        if (!taskData) throw new Error(tr2("QuestTask %1 が見つかりません。").format(questTaskKey));

        if (this._tasks.find(x => x.data.key === questTaskKey)) {
            // 既に開始済み
            return undefined;
        }

        const task = new LQuestTask(taskData);
        this._tasks.push(task);

        this._status = LQuestStatus.InProgress;
        return task;
    }
    
    public isQuestTaskAcivated(questTaskKey: string): boolean {
        if (this._tasks.length <= 0) return false;
        return this._tasks[this._tasks.length - 1].data.key === questTaskKey;
    }
}

/** Quest の状態 */
export enum LQuestStatus {
    /** 出現していない。開始可能でもない。 */
    Inactive = 0,

    /** 依頼可能 */
    Assignable = 1,

    /** 進行中 */
    InProgress = 2,

    /** 完了 */
    Completed = 3,

    /** 失敗・破棄 */
    Abandoned = 4,
}

export class LQuestTask {
    public readonly dataId: DQuestTaskId;

    public get data(): DQuestTask {
        return MRData.questTasks[this.dataId];
    }

    public constructor(data: DQuestTask) {
        this.dataId = data.id;
    }
}
