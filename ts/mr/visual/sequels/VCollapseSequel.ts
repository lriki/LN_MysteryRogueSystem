import * as PIXI from "pixi.js";
import { REVisualSequel } from "../REVisualSequel";
import { REVisualSequelContext } from "../REVisualSequelContext";
import { REVisual_Entity } from "../REVisual_Entity";


export class VCollapseSequel extends REVisualSequel {
    onUpdate(visual: REVisual_Entity, context: REVisualSequelContext): void {

        const effectDuration = 24 - context.frameCount();

        
        const event = visual.rmmzEvent();
        if (event) {
            visual.setOpacity((effectDuration / 24.0));
            event.setBlendMode(PIXI.BLEND_MODES.ADD);
        }
        
        
        if (effectDuration <= 0) {
            context.end();
        }
    }
}


