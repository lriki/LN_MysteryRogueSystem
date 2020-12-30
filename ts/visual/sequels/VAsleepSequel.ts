import { REVisualSequel } from "../REVisualSequel";
import { REVisualSequelContext } from "../REVisualSequelContext";
import { REVisual_Entity } from "../REVisual_Entity";


export class VAsleepSequel extends REVisualSequel {

    onUpdate(visual: REVisual_Entity, context: REVisualSequelContext): void {


        
        const event = visual.rmmzEvent();
        if (event) {
            event.setPattern(1);
        }

    }
}


