import { REVisualSequelContext } from "../REVisualSequelContext";
import { REVisual_Entity } from "../REVisual_Entity";

const EFFECT_FRAME_COUNT = 100;

export class VExplosionSequel {
    
    onUpdate(visual: REVisual_Entity, context: REVisualSequelContext): void {
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
