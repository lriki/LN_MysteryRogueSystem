import { assert } from "ts/re/Common";
import { FMapBuildPass } from "./FMapBuildPass";
import { FBlockComponent, FEntryPont, FExitPont, FMap } from "../FMapData";
import { DHelpers } from "ts/re/data/DHelper";
import { REData } from "ts/re/data/REData";
import { DAnnotationReader } from "ts/re/data/DAttributeReader";
import { DEntityKind } from "ts/re/data/DEntityKind";
import { PerlinNoise } from "ts/re/math/Noise";
import { DTemplateMap } from "ts/re/data/DTemplateMap";

/**
 * ランダムマップの装飾
 */
export class FDecorationPass extends FMapBuildPass {
    
    public execute(map: FMap): void {
        /*
        const noise = new PerlinNoise(map.random().nextInt());

        for (let y = 0; y < map.fullHeight; y++) {
            for (let x = 0; x < map.fullWidth; x++) {
                const v = noise.noise2D(x / map.fullWidth, y / map.fullHeight);
                console.log("v", v);
            }
        }
        */

        const template = REData.templateMaps[map.templateId];
        this.makeFloorDecoration(map, template);
    }

    public makeFloorDecoration(map: FMap, template: DTemplateMap): void {
        
    }

}

