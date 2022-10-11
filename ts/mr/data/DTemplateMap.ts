import { DAnnotationReader } from "./importers/DAttributeReader";
import { DHelpers } from "./DHelper";
import { DMapId } from "./DCommon";

/** 0 is invalid. */
export type DBlockVisualPartIndex = number;

/** 0 is invalid. */
export type DTemplateMapId = number;

export enum DBlockVisualPartType {
    /** 床 */
    Floor,

    /** 床の装飾 */
    FloorDecoration,
    
    /** あぜ道 */
    Footpath,

    /** あぜ道の装飾 */
    FootpathDecoration,

    /** 通路 */
    Passageway,

    /** 通路の装飾 */
    PassagewayDecoration,

    /** 水路 */
    Water,

    /** 水路の装飾 */
    WaterDecoration,

    /** 店の床 */
    ShopFloor,

    /** 店の床の装飾 */
    ShopFloorDecoration,

    /** 壁 */
    Wall,

    /** 壁の装飾 */
    WallDecoration,

    /** 壊れない壁 */
    HardWall,

    // /** 壁（上面） */
    // WallHead,

    // /** 壁（上面） の装飾 */
    // WallHeadDecoration,

    // /** 壁（側面） */
    // WallSide,

    // /** 壁（側面） の装飾 */
    // WallSideDecoration,

    // /** 壊れない壁（上面） */
    // HardWallHead,

    // /** 壊れない壁（側面） */
    // HardWallSide,
}

export enum DBlockVisualPartTileType {
    Normal,
    Autotile,
}

export enum DBlockVisualPartPlacementType {
    Random,
}

export class DBlockVisualPart {
    index: DBlockVisualPartIndex;      // DTemplateMap.parts の index. 全体で一意ではないので id という名前ではない。
    type: DBlockVisualPartType;
    tileType: DBlockVisualPartTileType;
    tiles: number[];    // 高さ1以上の場合、[0] が一番下のタイルになる。種類はすべて Normal or AutotileKind で統一されていなければならない。
    height: number;
    placementType: DBlockVisualPartPlacementType;

    public constructor(index: number) {
        this.index = index;
        this.type = DBlockVisualPartType.Floor;
        this.tileType = DBlockVisualPartTileType.Normal;
        this.tiles = [];
        this.height = 1;
        this.placementType = DBlockVisualPartPlacementType.Random;
    }
}

export class DTemplateMap {
    id: DTemplateMapId;
    name: string;
    mapId: DMapId;
    parts: DBlockVisualPart[];
    partIndex: DBlockVisualPartIndex[][];  // 要素番号は [DTemplateMapPartType][追加したもの]. 要素は parts のインデックスを示す。

    tilesetId: number;
    wallHeadAutoTileKind: number;
    wallEdgeAutoTileKind: number;
    floorAutoTileKind: number;
    itemShopFloorAutoTileKind: number;

    public constructor(id: DTemplateMapId) {
        this.id = id;
        this.name = "null";
        this.mapId = 0;
        this.parts = [new DBlockVisualPart(0)]; // [0] is dummy
        this.partIndex = [];
        this.tilesetId = 0;
        this.wallHeadAutoTileKind = 0;
        this.wallEdgeAutoTileKind = 0;
        this.floorAutoTileKind = 0;
        this.itemShopFloorAutoTileKind = 0;
    }

    public import(mapData: IDataMap): void {
        this.tilesetId = mapData.tilesetId;
        this.wallHeadAutoTileKind = DHelpers.getAutotileKind(DHelpers.getMapTopTile(mapData, 1, 1));
        this.wallEdgeAutoTileKind = DHelpers.getAutotileKind(DHelpers.getMapTopTile(mapData, 1, 2));
        this.floorAutoTileKind = DHelpers.getAutotileKind(DHelpers.getMapTopTile(mapData, 1, 3));
        this.itemShopFloorAutoTileKind = DHelpers.getAutotileKind(DHelpers.getMapTopTile(mapData, 1, 7));

        for (const event of mapData.events) {
            if (!event) continue;
            const x = event.x;
            const y = event.y;
    
            // @MR-TemplatePart
            const attr = DAnnotationReader.readTemplatePartAttributeFromPage(event.pages[0]);
            if (!attr) continue;

            if (!attr.type) {
                throw new Error("Invalid @MR-TemplatePart type");
            }

            const part = new DBlockVisualPart(this.parts.length);
            this.parts.push(part);
            part.type = this.toTemplateMapPartType(attr.type);
            part.height = attr.height ?? 1;
            if (attr.placement) {
                part.placementType = this.toTemplateMapPartPlacementType(attr.placement);
            }

            // タイル情報読み取り
            let tileType: DBlockVisualPartTileType | undefined = undefined;
            for (let i = 0; i < part.height; i++) {
                const tileId = DHelpers.getMapTopTile(mapData, x, y - i);
                const type = DHelpers.isAutotile(tileId) ? DBlockVisualPartTileType.Autotile : DBlockVisualPartTileType.Normal;
                if (tileType === undefined) {
                    tileType = type;
                }
                else if (tileType !== type) {
                    throw new Error("Invalid tile kinds.");
                }

                if (type == DBlockVisualPartTileType.Autotile) {
                    part.tiles.push(DHelpers.getAutotileKind(tileId));
                }
                else {
                    part.tiles.push(tileId);
                }
            }
            part.tileType = tileType ?? DBlockVisualPartTileType.Normal;

            // 格納
            if (this.partIndex[part.type] === undefined) {
                this.partIndex[part.type] = [part.index];
            }
            else {
                this.partIndex[part.type].push(part.index);
            }
        }
    }

    public toTemplateMapPartType(type: string): DBlockVisualPartType {
        switch (type) {
            case "Floor":
                return DBlockVisualPartType.Floor;
            case "FloorDecoration":
                return DBlockVisualPartType.FloorDecoration;
            case "Footpath":
                return DBlockVisualPartType.Footpath;
            case "FootpathDecoration":
                return DBlockVisualPartType.FootpathDecoration;
            case "Passageway":
                return DBlockVisualPartType.Passageway;
            case "PassagewayDecoration":
                return DBlockVisualPartType.PassagewayDecoration;
            case "Water":
                return DBlockVisualPartType.Water;
            case "WaterDecoration":
                return DBlockVisualPartType.WaterDecoration;
            case "ShopFloor":
                return DBlockVisualPartType.ShopFloor;
            case "ShopFloorDecoration":
                return DBlockVisualPartType.ShopFloorDecoration;
            case "Wall":
                return DBlockVisualPartType.Wall;
            case "WallDecoration":
                return DBlockVisualPartType.WallDecoration;
            case "HardWall":
                return DBlockVisualPartType.HardWall;
            // case "WallHead":
            //     return DTemplateMapPartType.WallHead;
            // case "WallHeadDecoration":
            //     return DTemplateMapPartType.WallHeadDecoration;
            // case "WallSide":
            //     return DTemplateMapPartType.WallSide;
            // case "WallSideDecoration":
            //     return DTemplateMapPartType.WallSideDecoration;
            // case "HardWallHead":
            //     return DTemplateMapPartType.HardWallHead;
            // case "HardWallSide":
            //     return DTemplateMapPartType.HardWallSide;
        default:
            throw new Error(`Invalid type: ${type}.`);
        }
    }
    
    public toTemplateMapPartPlacementType(type: string): DBlockVisualPartPlacementType {
        switch (type) {
            case "Random":
                return DBlockVisualPartPlacementType.Random;
        default:
            throw new Error(`Invalid type: ${type}.`);
        }
    }
}

