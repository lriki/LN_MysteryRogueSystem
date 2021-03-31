import { couldStartTrivia } from "typescript";
import { DHelpers } from "./DHelper";
import { DMapId } from "./DLand";

export type DTemplateMapId = number;

export interface DTemplateMap {
    id: DTemplateMapId;
    name: string;
    mapId: DMapId;

    tilesetId: number;
    wallHeadAutoTileKind: number,
    wallEdgeAutoTileKind: number,
    floorAutoTileKind: number,

}

export function DTemplateMap_Default(): DTemplateMap {
    return {
        id: 0,
        name: "null",
        mapId: 0,
        tilesetId: 0,
        wallHeadAutoTileKind: 0,
        wallEdgeAutoTileKind: 0,
        floorAutoTileKind: 0,
    };
}

export function buildTemplateMapData(mapData: IDataMap, data: DTemplateMap): void {
    data.tilesetId = mapData.tilesetId;
    data.wallHeadAutoTileKind = DHelpers.getAutotileKind(DHelpers.getMapTopTile(mapData, 1, 1));
    data.wallEdgeAutoTileKind = DHelpers.getAutotileKind(DHelpers.getMapTopTile(mapData, 1, 2));
    data.floorAutoTileKind = DHelpers.getAutotileKind(DHelpers.getMapTopTile(mapData, 1, 3));
}

