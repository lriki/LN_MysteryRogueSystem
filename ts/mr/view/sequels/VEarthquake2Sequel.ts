import { VSequel } from "../VSequel";
import { VSequelContext } from "../VSequelContext";
import { VEntity } from "../VEntity";


export class VEarthquake2Sequel extends VSequel {

    onUpdate(visual: VEntity, context: VSequelContext): void {

        const frameCount = context.frameCount();
        
        if (frameCount == 0) {
            $gameScreen.startShake(9, 9, 120);
        }
        
        if (frameCount > 120) {
            visual.resetPosition();
            context.end();
        }
    }
}


