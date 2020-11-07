import { REVisualSequel } from "../REVisualSequel";
import { REVisualSequelContext } from "../REVisualSequelContext";
import { REVisual_Entity } from "../REVisual_Entity";


export class VCollapseSequel extends REVisualSequel {
    onUpdate(visual: REVisual_Entity, context: REVisualSequelContext): void {
        const effectDuration = 24 - context.frameCount();

        /*
        const sprite = visual.rmmzSprite();
        if (sprite) {
            sprite.blendMode = PIXI.BLEND_MODES.ADD;
            sprite.setBlendColor([255, 128, 128, 128]);
            sprite.opacity *= effectDuration / (effectDuration + 1);
        }
        */
        
        if (effectDuration <= 0) {
            console.log("!!!!!!VCollapseSequel");
            context.end();
        }
    }
}


