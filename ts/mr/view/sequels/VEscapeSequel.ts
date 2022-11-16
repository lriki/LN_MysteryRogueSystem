import { VSequel } from "../VSequel";
import { VSequelContext } from "../VSequelContext";
import { VEntity } from "../VEntity";


export class VEscapeSequel extends VSequel {

    onUpdate(visual: VEntity, context: VSequelContext): void {

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


