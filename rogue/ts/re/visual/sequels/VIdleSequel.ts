import { REVisualSequel } from "../REVisualSequel";
import { REVisualSequelContext } from "../REVisualSequelContext";
import { REVisual_Entity } from "../REVisual_Entity";
import { VSequelHelper } from "./VSequelHelper";


export class VIdleSequel extends REVisualSequel {

    //private _animationCount: number = 0;

    onUpdate(visual: REVisual_Entity, context: REVisualSequelContext): void {
        VSequelHelper.updateStepAnimPattern(visual);
        visual.resetPosition();
    }
}


