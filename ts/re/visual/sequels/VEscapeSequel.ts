import { REVisualSequel } from "../REVisualSequel";
import { REVisualSequelContext } from "../REVisualSequelContext";
import { REVisual_Entity } from "../REVisual_Entity";


export class VEscapeSequel extends REVisualSequel {

    onUpdate(visual: REVisual_Entity, context: REVisualSequelContext): void {

        const frameCount = context.frameCount();
        const entity = visual.entity();
        const event = visual.rmmzEvent();

        if (frameCount == 0) {
            context.startAnimation(117);
        }

        if (frameCount == 60) {
            event.setTransparent(true);
        }
        
        if (frameCount > 120) {
            visual.resetPosition();
            context.end();
        }
    }
}


