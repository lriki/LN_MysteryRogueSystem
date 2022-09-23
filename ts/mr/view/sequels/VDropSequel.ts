import { Vector2 } from "ts/mr/math/Vector2";
import { Helpers } from "ts/mr/system/Helpers";
import { SMotionSequel } from "ts/mr/system/SSequel";
import { REVisualSequel } from "../REVisualSequel";
import { REVisualSequelContext } from "../REVisualSequelContext";
import { REVisual_Entity } from "../REVisual_Entity";

const DROP_TIME = 16;
const DROP_RADIUS = 0.2;


export class VDropSequel extends REVisualSequel {


    onUpdate(visual: REVisual_Entity, context: REVisualSequelContext): void {

        const frameCount = context.frameCount();
        const entity = visual.entity();

        const sequel = context.sequel() as SMotionSequel;
        const velocityX = (sequel.targetX() - context.startPosition().x) / DROP_TIME;
        const velocityY = (sequel.targetY() - context.startPosition().y) / DROP_TIME;

        const ratio = frameCount / DROP_TIME;

        let ox = 0;
        let oy = 0;
        const dir = context.sequel().args()?.movingDir;
        if (dir) {
            const offset = Helpers.dirToTileOffset(dir);
            ox = offset.x * ((1.0 - ratio) * DROP_RADIUS);
            oy = offset.y * ((1.0 - ratio) * DROP_RADIUS);
        }


        const pos = context.startPosition();
        //pos.y -= context.frameCount();
        const jy = Math.sin(Math.PI * ratio);


        


        visual.setPosition(new Vector2(
            (velocityX * frameCount) + (ox + pos.x),
            (velocityY * frameCount) + (oy + pos.y - jy)));
        
        if (frameCount > DROP_TIME) {
            visual.resetPosition();
            context.end();
        }
    }
}


