import { Vector2 } from "ts/re/math/Vector2";
import { REVisualSequel } from "../REVisualSequel";
import { REVisualSequelContext } from "../REVisualSequelContext";
import { REVisual_Entity } from "../REVisual_Entity";


export class VWarpSequel extends REVisualSequel {

    onUpdate(visual: REVisual_Entity, context: REVisualSequelContext): void {

        const frameCount = context.frameCount();
        const event = visual.rmmzEvent();

        visual.setPosition(
            new Vector2(
                context.startPosition().x,
                context.startPosition().y - (frameCount * 0.5)));

        
        if (frameCount > 60) {
            //visual.resetPosition();
            context.end();
        }
    }
}


