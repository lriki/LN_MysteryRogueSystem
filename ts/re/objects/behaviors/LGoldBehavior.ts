import { RESerializable } from "ts/re/Common";
import { DBlockLayerKind } from "ts/re/data/DCommon";
import { REData } from "ts/re/data/REData";
import { Helpers } from "ts/re/system/Helpers";
import { SPhaseResult } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LCandidateSkillAction } from "ts/re/usecases/UAction";
import { UMovement } from "ts/re/usecases/UMovement";
import { LCharacterAI } from "../ai/LCharacterAI";
import { LEscapeAI } from "../ai/LEscapeAI";
import { LCharacterAI_Normal } from "../ai/LStandardAI";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { DecisionPhase, LBehavior } from "./LBehavior";
import { LInventoryBehavior } from "./LInventoryBehavior";
import { LItemBehavior } from "./LItemBehavior";




/**
 * お金
 */
@RESerializable
export class LGoldBehavior extends LBehavior {
    /*
    [2021/9/29] 金額の持ち方
    -----------
    upgradeValue や capacity と共有してみる？
    ↓
    しないほうがよさそう。
    それぞれ値の範囲が決まっている。 (-ベース~+99 など)
    */

    public _gold: number;

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LGoldBehavior);
        return b;
    }

    public constructor() {
        super();
        this._gold = 0;
    }

    public gold(): number {
        return this._gold;
    }

    public setGold(value: number) {
        this._gold = value;
    }

    



}

