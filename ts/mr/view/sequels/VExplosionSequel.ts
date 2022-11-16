import { VSequelContext } from "../VSequelContext";
import { VEntity } from "../VEntity";

const EFFECT_FRAME_COUNT = 100;

export class VExplosionSequel {
    
    onUpdate(visual: VEntity, context: VSequelContext): void {
        const effectDuration = EFFECT_FRAME_COUNT - context.frameCount();

        if (context.frameCount() == 0) {
            context.startAnimation(109);
        }


        const event = visual.rmmzEvent();
        if (event) {
            visual.setOpacity(effectDuration / EFFECT_FRAME_COUNT);
            //event.setBlendMode(PIXI.BLEND_MODES.ADD);
        }
        
        if (effectDuration <= 0) {
            context.end();
        }
    }
}
