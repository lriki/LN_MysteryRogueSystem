import { ActionId, DStateId } from "ts/data/REData";
import { DecisionPhase } from "ts/RE/REGame_Behavior";
import { REGame_Entity } from "ts/RE/REGame_Entity";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";

/**
 * State
 * 
 * 各メソッドは Behavior と同一
 */
export class LState {
    _dataId: DStateId = 0;
    
    onQueryProperty(propertyId: number): any { return undefined; }

    onQueryActions(): ActionId[] { return []; }

    onDecisionPhase(entity: REGame_Entity, context: RECommandContext, phase: DecisionPhase): REResponse { return REResponse.Pass; }

    onPreAction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
    onPreReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
    onAction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
    onReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
}
