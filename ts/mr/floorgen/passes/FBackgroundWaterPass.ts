import { assert } from "ts/mr/Common";
import { FMapBuildPass } from "./FMapBuildPass";
import { FBlockComponent, FEntryPont, FExitPont, FMap } from "../FMapData";
import { DHelpers } from "ts/mr/data/DHelper";
import { MRData } from "ts/mr/data/MRData";
import { DAnnotationReader } from "ts/mr/data/importers/DAttributeReader";
import { DEntityCategory } from "ts/mr/data/DEntityCategory";
import { PerlinNoise, SimplexNoise } from "ts/mr/math/Noise";
import { DTemplateMap, DBlockVisualPartType } from "ts/mr/data/DTemplateMap";
import { FMapBlock } from "../data/FMapBlock";
import { LTileShape } from "ts/mr/lively/LBlock";

/**
 */
export class FBackgroundWaterPass extends FMapBuildPass {
    
    public execute(map: FMap): void {
        const template = MRData.templateMaps[map.templateId];
        
        if (0) {
            for (let y = 0; y < map.fullHeight; y++) {
                for (let x = 0; x < map.fullWidth; x++) {
                    const block = map.block(x, y);
                    if (block.tileShape() == LTileShape.Wall) {
                        block.setTileShape(LTileShape.Water);
                        block.setShapeVisualPartIndex(template.partIndex[DBlockVisualPartType.Water][0]);
                    }
                }
            }
        }
    }
}

