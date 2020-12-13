import { Vector2 } from "ts/math/Vector2";
import { REVisualSequelContext } from "./REVisualSequelContext";
import { REVisual_Entity } from "./REVisual_Entity";



export abstract class REVisualSequel {
    abstract onUpdate(visual: REVisual_Entity, context: REVisualSequelContext): void;
}

