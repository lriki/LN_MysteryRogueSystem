import { assert } from "ts/mr/Common";
import { FMapBuildPass } from "./FMapBuildPass";
import { FBlockComponent, FEntryPont, FExitPont, FMap } from "../FMapData";
import { DHelpers } from "ts/mr/data/DHelper";
import { MRData } from "ts/mr/data/MRData";
import { DAnnotationReader } from "ts/mr/data/DAttributeReader";
import { DEntityKind } from "ts/mr/data/DEntityKind";
import { PerlinNoise, SimplexNoise } from "ts/mr/math/Noise";
import { DTemplateMap, DTemplateMapPartType } from "ts/mr/data/DTemplateMap";
import { FMapBlock } from "../data/FMapBlock";

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

        const template = MRData.templateMaps[map.templateId];
        this.makeFloorDecoration(map, template);
        this.makeWallDecoration(map, template);
    }

    public makeFloorDecoration(map: FMap, template: DTemplateMap): void {
        //const noise = new PerlinNoise(map.random().nextInt());
        //const noise = new SimplexNoise(map.random().nextInt());

        const freq = 0.1;
        //const basemag = 160.0;  // だいたい 0~100 で出力できるようにする
        const basemag = 100.0;
        const thr = 50;

        const parts = template.partIndex[DTemplateMapPartType.FloorDecoration].map(x => template.parts[x]);
        const noises = parts.map(x => new SimplexNoise(map.random().nextInt()));

        for (const block of map.blocks()) {
            if (block.component() == FBlockComponent.Room) {

                for (const [i, part] of parts.entries()) {

                    let v = Math.abs(noises[i].noise2D((block.mx) * freq, (block.my) * freq));
                    v = Math.floor(v * basemag);
                    if (v > thr) {
                        block.templatePartIndex = part.index;
                    }
                }

            }
        }
        
        // for (let y = 0; y < map.fullHeight; y++) {
        //     for (let x = 0; x < map.fullWidth; x++) {
        //         map.block(x, y).templatePartIndex = 1;
        //     }
        // }
    }

    public makeWallDecoration(map: FMap, template: DTemplateMap): void {
        //const noise = new PerlinNoise(map.random().nextInt());
        //const noise = new SimplexNoise(map.random().nextInt());

        const freq = 0.1;
        //const basemag = 160.0;  // だいたい 0~100 で出力できるようにする
        const basemag = 100.0;
        const thr = 50;

        const parts = template.partIndex[DTemplateMapPartType.WallDecoration].map(x => template.parts[x]);
        //console.log("wall", parts);
        const noises = parts.map(x => new SimplexNoise(map.random().nextInt()));

        for (const block of map.blocks()) {
            if (block.component() == FBlockComponent.None && this.isAroundWalls(map, block)) {

                for (const [i, part] of parts.entries()) {

                    let v = Math.abs(noises[i].noise2D((block.mx) * freq, (block.my) * freq));
                    v = Math.floor(v * basemag);
                    if (v > thr) {
                        block.templatePartIndex = part.index;
                    }
                }

            }
        }
        
        // for (let y = 0; y < map.fullHeight; y++) {
        //     for (let x = 0; x < map.fullWidth; x++) {
        //         map.block(x, y).templatePartIndex = 1;
        //     }
        // }
    }

    public isAroundWalls(map: FMap, block: FMapBlock): boolean {
        let b;
        b = map.blockTry(block.mx - 1, block.my - 1);
        if (b && b.component() != FBlockComponent.None) return false;
        b = map.blockTry(block.mx, block.my - 1);
        if (b && b.component() != FBlockComponent.None) return false;
        b = map.blockTry(block.mx + 1, block.my - 1);
        if (b && b.component() != FBlockComponent.None) return false;
        b = map.blockTry(block.mx - 1, block.my);
        if (b && b.component() != FBlockComponent.None) return false;
        b = map.blockTry(block.mx + 1, block.my);
        if (b && b.component() != FBlockComponent.None) return false;
        b = map.blockTry(block.mx - 1, block.my + 1);
        if (b && b.component() != FBlockComponent.None) return false;
        b = map.blockTry(block.mx, block.my + 1);
        if (b && b.component() != FBlockComponent.None) return false;
        b = map.blockTry(block.mx + 1, block.my + 1);
        if (b && b.component() != FBlockComponent.None) return false;
        return true;
    }
}

