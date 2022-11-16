import { VSequel } from "../VSequel";
import { VSequelContext } from "../VSequelContext";
import { VEntity } from "../VEntity";
import { VSequelHelper } from "./VSequelHelper";


export class VIdleSequel extends VSequel {

    //private _animationCount: number = 0;

    onUpdate(visual: VEntity, context: VSequelContext): void {
        VSequelHelper.updateStepAnimPattern(visual);
        visual.resetPosition();
    }
}


