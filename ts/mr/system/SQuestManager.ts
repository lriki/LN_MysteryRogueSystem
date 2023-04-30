import { tr2 } from "../Common";
import { MRLively } from "../lively/MRLively";
import { MRSystem } from "./MRSystem";

export class SQuestManager {

    public openQuest(questKey: string): void {
        const newQuest = MRLively.questManager.openQuest(questKey);
        // if (newQuest) {
        //     MRSystem.commandContext.postMessage(tr2("クエスト \"%1\" を開始しました。").format(questKey));
        // }
    }
    
    public advanceQuestTask(questKey: string, questTaskKey: string): void {
        // const info = MRLively.questManager.advanceQuestTask(questKey, questTaskKey);
        // if (info) {
        //     MRSystem.commandContext.postMessage(tr2("クエスト \"%1\" を開始しました。").format(info.));
        // }
    }
}

