import { MRSerializable } from "../Common";
import { MRData } from "../data/MRData";
import { LQuest, LQuestStatus, LQuestTask } from "./LQuest";

/**
 * 発生している・請けているクエストを管理する
 * 
 * クエストを受けるのは Unit ではなく Player 自身である。
 * ゲーム中に1つのインスタンスが存在する。
 * 操作キャラを切り替えても、クエストノートは共有する感じ。
 */
@MRSerializable
export class LQuestManager {
    private _quests: LQuest[] = []; // DQuest と 1:1。つまりゲーム開始時にすべてのクエストが生成される。

    public setup(): void {
        for (const data of MRData.quests) {
            if (data) {
                this._quests.push(new LQuest(data));
            }
            else {
                this._quests.push(undefined!);
            }
        }
    }

    public getQuest(questKey: string): LQuest {
        const quest = this._quests.find(x => x.data.key === questKey);
        if (!quest) throw new Error(`Quest ${questKey} not found.`);
        return quest;
    }

    /**
     * 指定したクエストを受領できる状態にします。
     * @param questKey 
     */
    public openQuest(questKey: string): LQuest | undefined {
        const quest = this.getQuest(questKey);
        if (quest.status == LQuestStatus.Inactive) {
            quest.openQuest();
            return quest;
        }
        return undefined;
    }

    /**
     * 指定したクエストを開始する
     * @param questKey 
     */
    // public assingQuest(questKey: string): void {
    //     const quest = this._quests.find(x => x.data.key === questKey);
    //     if (quest) {
    //         quest.status = LQuestStatus.InProgress;
    //     }
    // }

    /**
     * 指定したクエストの指定したタスクを開始する
     * 
     * @return 新しくタスクを開始した場合、その LQuest インスタンスを返す。タスクを開始しなかった場合は undefined を返す。
     */
    public advanceQuestTask(questKey: string, questTaskKey: string): { quest: LQuest, newTask: LQuestTask } | undefined {
        const quest = this._quests.find(x => x.data.key === questKey);
        if (quest) {
            const newTask = quest.advanceQuestTask(questTaskKey);
            if (newTask) {
                // 新しいタスクを開始した
                return { quest, newTask };
            }
        }
        return undefined;
    }

    public isQuestInactived(questkKey: string): boolean {
        return !!this._quests.find(x => x.data.key === questkKey && x.status === LQuestStatus.Inactive);
    }
    
    public isQuestTaskAcivated(questTaskKey: string): boolean {
        for (const quest of this._quests) {
            if (quest) {
                if (quest.status === LQuestStatus.InProgress) {
                    if (quest.isQuestTaskAcivated(questTaskKey)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

}

