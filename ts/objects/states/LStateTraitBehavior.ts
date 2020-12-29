
import { ActionId } from "ts/data/REData";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { DecisionPhase } from "../behaviors/LBehavior";

/**
 * State
 * 
 * 各メソッドは Behavior と同一
 */
export class LStateTraitBehavior {
    //_dataId: DStateId = 0;
    
    
    onQueryProperty(propertyId: number): any { return undefined; }

    //onQueryActions(): ActionId[] { return []; }

    onDecisionPhase(entity: REGame_Entity, context: RECommandContext, phase: DecisionPhase): REResponse { return REResponse.Pass; }

    onPreAction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
    onPreReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
    onAction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
    onReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
    
}
