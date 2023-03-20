
import { DSkill, DSkillClass } from "ts/mr/data/DSkill";
import { MRData } from "ts/mr/data/MRData";
import { LEntityId } from "../LObject";

/**
 * Think フェーズで列挙される行動候補
 */
export class LThinkingAction {
    action: IDataAction;
    targets: LEntityId[];     // ターゲット候補 (範囲攻撃の時など)

    // デバッグ用の強制移動や、逃げAIでの逃走先(特に、追い詰められて部屋の入り口ではなく壁を目指す場合)を指定するための座標。
    priorityTargetX?: number | undefined;
    priorityTargetY?: number | undefined;
    priorityMovingDirection?: number | undefined;
    forceMovedDirection?: number | undefined;

    public constructor(action: IDataAction, targets: LEntityId[]) {
        this.action = action;
        this.targets = targets;
    }

    public clone(): LThinkingAction {
        const i = new LThinkingAction({ ...this.action }, this.targets.map(x => x.clone()));
        i.priorityTargetX = this.priorityTargetX;
        i.priorityTargetY = this.priorityTargetY;
        i.priorityMovingDirection = this.priorityMovingDirection;
        i.forceMovedDirection = this.forceMovedDirection;
        return i;
    }

    public get skill(): DSkill { return MRData.skills[this.action.skillId]; }

    public get isMinor(): boolean { return this.skill.skillClass == DSkillClass.Minor; }
    public get isMajor(): boolean { return this.skill.skillClass == DSkillClass.Major; }
}
