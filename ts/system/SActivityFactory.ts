import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { DStateId } from "ts/data/DState";
import { LActivity } from "ts/objects/activities/LActivity";
import { LBackwardFloorActivity } from "ts/objects/activities/LBackwardFloorActivity";
import { LDirectionChangeActivity } from "ts/objects/activities/LDirectionChangeActivity";
import { LEatActivity } from "ts/objects/activities/LEatActivity";
import { LEquipActivity } from "ts/objects/activities/LEquipActivity";
import { LEquipOffActivity } from "ts/objects/activities/LEquipOffActivity";
import { LExchangeActivity } from "ts/objects/activities/LExchangeActivity";
import { LForwardFloorActivity } from "ts/objects/activities/LForwardFloorActivity";
import { LMoveAdjacentActivity } from "ts/objects/activities/LMoveAdjacentActivity";
import { LPickActivity } from "ts/objects/activities/LPickActivity";
import { LPutActivity } from "ts/objects/activities/LPutActivity";
import { LThrowActivity } from "ts/objects/activities/LThrowActivity";
import { LWaveActivity } from "ts/objects/activities/LWaveActivity";
import { LBehavior } from "ts/objects/behaviors/LBehavior";
import { REGame } from "ts/objects/REGame";
import { LGenericRMMZStateBehavior } from "ts/objects/states/LGenericRMMZStateBehavior";
import { LState } from "ts/objects/states/LState";
import { SBehaviorFactory } from "./internal";

export class SActivityFactory {

    public static newActivity(actionId: DActionId): LActivity {

        switch (actionId) {
            case DBasics.actions.DirectionChangeActionId:
                return new LDirectionChangeActivity();
            case DBasics.actions.MoveToAdjacentActionId:
                return new LMoveAdjacentActivity();
            case DBasics.actions.PickActionId:
                return new LPickActivity();
            case DBasics.actions.PutActionId:
                return new LPutActivity();
            case DBasics.actions.ThrowActionId:
                return new LThrowActivity();
            case DBasics.actions.ExchangeActionId:
                return new LExchangeActivity();
            case DBasics.actions.ForwardFloorActionId:
                return new LForwardFloorActivity();
            case DBasics.actions.BackwardFloorActionId:
                return new LBackwardFloorActivity();
            case DBasics.actions.EquipActionId:
                return new LEquipActivity();
            case DBasics.actions.EquipOffActionId:
                return new LEquipOffActivity();
            case DBasics.actions.EatActionId:
                return new LEatActivity();
            case DBasics.actions.WaveActionId:
                return new LWaveActivity();
            default:
                throw new Error(`Invalid Activity. (${actionId})`);
        }
    }
}
