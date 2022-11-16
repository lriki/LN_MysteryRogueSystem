import { VSequelContext } from "./VSequelContext";
import { VEntity } from "./VEntity";



export abstract class VSequel {
    abstract onUpdate(visual: VEntity, context: VSequelContext): void;
}

