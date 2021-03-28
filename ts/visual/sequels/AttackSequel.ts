import { Vector2 } from "ts/math/Vector2";
import { Helpers } from "ts/system/Helpers";
import { REVisual } from "../REVisual";
import { REVisualSequel } from "../REVisualSequel";
import { REVisualSequelContext } from "../REVisualSequelContext";
import { REVisual_Entity } from "../REVisual_Entity";


export class VAttackSequel extends REVisualSequel {
    onUpdate(visual: REVisual_Entity, context: REVisualSequelContext): void {
        console.log("REVisual._syncCamera", REVisual._syncCamera);
        const entity = visual.entity();
        const offset = Helpers.dirToTileOffset(entity.dir);

        visual.setPosition(Vector2.add(context.startPosition(), Vector2.mul(offset,0.4)));
        
        if (context.frameCount() > 10) {
            visual.resetPosition();
            context.end();
        }
    }
}


