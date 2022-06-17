import { MRData } from "ts/re/data/MRData";
import { REGame } from "ts/re/objects/REGame";
import { RESystem } from "ts/re/system/RESystem";
import { REVisual } from "ts/re/visual/REVisual";
import { THDataExtension, THGameExtension, THSystemExtension, THVisualExtension } from "./THExtensions";

export function registerExtensions() {
    MRData.ext = new THDataExtension();
    RESystem.ext = new THSystemExtension();
    REGame.ext = new THGameExtension();
    REVisual.ext = new THVisualExtension();
}
