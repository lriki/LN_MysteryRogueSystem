import { REVisualSequelContext } from "../REVisualSequelContext";
import { REVisual_Entity } from "../REVisual_Entity";

export class VExplosionSequel {
    
    onUpdate(visual: REVisual_Entity, context: REVisualSequelContext): void {
        const effectDuration = 24 - context.frameCount();

        const event = visual.rmmzEvent();
        if (event) {
            event.setOpacity(255.0 * (effectDuration / 24));
            event.setBlendMode(PIXI.BLEND_MODES.ADD);
        }
        
        if (effectDuration <= 0) {
            context.end();
        }
    }
}
