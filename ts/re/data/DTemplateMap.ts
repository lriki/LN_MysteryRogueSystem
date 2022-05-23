import { DHelpers } from "./DHelper";
import { DMapId } from "./DLand";

export type DTemplateMapId = number;

export class DTemplateMap {
    id: DTemplateMapId;
    name: string;
    mapId: DMapId;

    tilesetId: number;
    wallHeadAutoTileKind: number;
    wallEdgeAutoTileKind: number;
    floorAutoTileKind: number;
    itemShopFloorAutoTileKind: number;

    public constructor(id: DTemplateMapId) {
        this.id = id;
        this.name = "null";
        this.mapId = 0;
        this.tilesetId = 0;
        this.wallHeadAutoTileKind = 0;
        this.wallEdgeAutoTileKind = 0;
        this.floorAutoTileKind = 0;
        this.itemShopFloorAutoTileKind = 0;
    }
}


export function buildTemplateMapData(mapData: IDataMap, data: DTemplateMap): void {
    data.tilesetId = mapData.tilesetId;
    data.wallHeadAutoTileKind = DHelpers.getAutotileKind(DHelpers.getMapTopTile(mapData, 1, 1));
    data.wallEdgeAutoTileKind = DHelpers.getAutotileKind(DHelpers.getMapTopTile(mapData, 1, 2));
    data.floorAutoTileKind = DHelpers.getAutotileKind(DHelpers.getMapTopTile(mapData, 1, 3));
    data.itemShopFloorAutoTileKind = DHelpers.getAutotileKind(DHelpers.getMapTopTile(mapData, 1, 7));
}

