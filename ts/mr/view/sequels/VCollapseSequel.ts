import * as PIXI from "pixi.js";
import { VSequel } from "../VSequel";
import { VSequelContext } from "../VSequelContext";
import { VEntity } from "../VEntity";


export class VCollapseSequel extends VSequel {
    onUpdate(visual: VEntity, context: VSequelContext): void {

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


