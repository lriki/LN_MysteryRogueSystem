import { SSoundManager } from "ts/mr/system/SSoundManager";
import { VEntity } from "../VEntity";
import { VSequel } from "../VSequel";
import { VSequelContext } from "../VSequelContext";

export class VCrackSequel extends VSequel {
    override onUpdate(visual: VEntity, context: VSequelContext): void {
        SSoundManager.playSe({ name: "Break", volume: 80, pitch: 110, pan: 0 });
        context.end();
    }
}
