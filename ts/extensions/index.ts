import { MRData } from "ts/mr/data/MRData";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { MRView } from "ts/mr/view/MRView";
import { THDataExtension, THGameExtension, THSystemExtension, THVisualExtension } from "./THExtensions";

export function registerExtensions() {
    MRData.ext = new THDataExtension();
    MRSystem.ext = new THSystemExtension();
    MRLively.ext = new THGameExtension();
    MRView.ext = new THVisualExtension();
}
