import { Vector2 } from "ts/math/Vector2";
import { Helpers } from "ts/system/Helpers";
import { REVisualSequel } from "../REVisualSequel";
import { REVisualSequelContext } from "../REVisualSequelContext";
import { REVisual_Entity } from "../REVisual_Entity";

const DROP_TIME = 10;
const DROP_RADIUS = 0.2;


export class VDropSequel extends REVisualSequel {


    onUpdate(visual: REVisual_Entity, context: REVisualSequelContext): void {

        const entity = visual.entity();

        const ratio = context.frameCount() / DROP_TIME;


        let ox = 0;
        let oy = 0;
        const dir = context.sequel().args().movingDir;
        if (dir) {
            const offset = Helpers.dirToTileOffset(dir);
            ox = offset.x * ((1.0 - ratio) * DROP_RADIUS);
            oy = offset.y * ((1.0 - ratio) * DROP_RADIUS);
        }


        const pos = context.startPosition();
        //pos.y -= context.frameCount();
        const y = Math.sin(Math.PI * ratio);

        visual.setPosition(new Vector2(ox + pos.x, oy + pos.y - y));
        
        if (context.frameCount() > DROP_TIME) {
            visual.resetPosition();
            context.end();
        }
    }
}


