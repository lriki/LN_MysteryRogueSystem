import { Vector2 } from "ts/mr/math/Vector2";
import { Helpers } from "ts/mr/system/Helpers";
import { VSequel } from "../VSequel";
import { VSequelContext } from "../VSequelContext";
import { VEntity } from "../VEntity";


export class VAttackSequel extends VSequel {
    onUpdate(visual: VEntity, context: VSequelContext): void {
        const entity = visual.entity();
        const offset = Helpers.dirToTileOffset(entity.dir);

        visual.setPosition(Vector2.add(context.startPosition(), Vector2.mul(offset,0.4)));
        
        if (context.frameCount() > 10) {
            visual.resetPosition();
            context.end();
        }
    }
}


