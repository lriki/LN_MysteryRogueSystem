import { VSequel } from "../VSequel";
import { VSequelContext } from "../VSequelContext";
import { VEntity } from "../VEntity";


export class VAsleepSequel extends VSequel {

    onUpdate(visual: VEntity, context: VSequelContext): void {

        const event = visual.rmmzEvent();
        if (event) {
            event.setPattern(1);
        }

    }
}


