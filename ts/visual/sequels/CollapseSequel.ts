import * as PIXI from "pixi.js";
import { REVisualSequel } from "../REVisualSequel";
import { REVisualSequelContext } from "../REVisualSequelContext";
import { REVisual_Entity } from "../REVisual_Entity";


export class VCollapseSequel extends REVisualSequel {
    onUpdate(visual: REVisual_Entity, context: REVisualSequelContext): void {
        const effectDuration = 24 - context.frameCount();

        
        //const sprite: any = visual.rmmzSprite();
        //console.log("VCollapseSequel", sprite);
        const event = visual.rmmzEvent();
        if (event) {
            event.setOpacity(255.0 * (effectDuration / 24));
            event.setBlendMode(PIXI.BLEND_MODES.ADD);
        }
        
        console.log("VCollapseSequel:", event);
        /*
        if (sprite) {
            sprite.blendMode = PIXI.BLEND_MODES.ADD;
            sprite.setBlendColor([255, 128, 128, 128]);
            sprite.opacity = 255.0 * (effectDuration / 25);//effectDuration / (effectDuration + 1);

            
            console.log("!!!!!!VCollapseSequel", effectDuration / 24);
        }
        */
        
        if (effectDuration <= 0) {
            console.log("!!!!!!end");
            context.end();
        }
    }
}


