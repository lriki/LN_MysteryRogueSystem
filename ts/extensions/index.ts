import { MRData } from "ts/mr/data/MRData";
import { REGame } from "ts/mr/lively/REGame";
import { RESystem } from "ts/mr/system/RESystem";
import { REVisual } from "ts/mr/view/REVisual";
import { THDataExtension, THGameExtension, THSystemExtension, THVisualExtension } from "./THExtensions";

export function registerExtensions() {
    MRData.ext = new THDataExtension();
    RESystem.ext = new THSystemExtension();
    REGame.ext = new THGameExtension();
    REVisual.ext = new THVisualExtension();
}
