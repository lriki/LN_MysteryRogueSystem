import { DAnnotationReader } from "./DAttributeReader";
import { DHelpers } from "./DHelper";
import { DMapId } from "./DLand";

export type DTemplateMapPartIndex = number;
export type DTemplateMapId = number;


export enum DTemplateMapPartType {
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

export enum DTemplateMapPartTileType {
    Normal,
    Autotile,
}

export enum DTemplateMapPartPlacementType {
    Random,
}

export class DTemplateMapPart {
    index: DTemplateMapPartIndex;      // DTemplateMap.parts の index. 全体で一意ではないので id という名前ではない。
    type: DTemplateMapPartType;
    tileType: DTemplateMapPartTileType;
    tiles: number[];    // 高さ1以上の場合、[0] が一番下のタイルになる。種類はすべて Normal or AutotileKind で統一されていなければならない。
    height: number;
    placementType: DTemplateMapPartPlacementType;

    public constructor(index: number) {
        this.index = index;
        this.type = DTemplateMapPartType.Floor;
        this.tileType = DTemplateMapPartTileType.Normal;
        this.tiles = [];
        this.height = 1;
        this.placementType = DTemplateMapPartPlacementType.Random;
    }
}

export class DTemplateMap {
    id: DTemplateMapId;
    name: string;
    mapId: DMapId;
    parts: DTemplateMapPart[];
    partIndex: DTemplateMapPartIndex[][];  // 要素番号は [DTemplateMapPartType][追加したもの]. 要素は parts のインデックスを示す。

    tilesetId: number;
    wallHeadAutoTileKind: number;
    wallEdgeAutoTileKind: number;
    floorAutoTileKind: number;
    itemShopFloorAutoTileKind: number;

    public constructor(id: DTemplateMapId) {
        this.id = id;
        this.name = "null";
        this.mapId = 0;
        this.parts = [new DTemplateMapPart(0)]; // [0] is dummy
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

            const part = new DTemplateMapPart(this.parts.length);
            this.parts.push(part);
            part.type = this.toTemplateMapPartType(attr.type);
            part.height = attr.height ?? 1;
            if (attr.placement) {
                part.placementType = this.toTemplateMapPartPlacementType(attr.placement);
            }

            // タイル情報読み取り
            let tileType: DTemplateMapPartTileType | undefined = undefined;
            for (let i = 0; i < part.height; i++) {
                const tileId = DHelpers.getMapTopTile(mapData, x, y - i);
                const type = DHelpers.isAutotile(tileId) ? DTemplateMapPartTileType.Autotile : DTemplateMapPartTileType.Normal;
                if (tileType === undefined) {
                    tileType = type;
                }
                else if (tileType !== type) {
                    throw new Error("Invalid tile kinds.");
                }
                part.tiles.push(tileId);
            }
            part.tileType = tileType ?? DTemplateMapPartTileType.Normal;

            // 格納
            if (this.partIndex[part.type] === undefined) {
                this.partIndex[part.type] = [part.index];
            }
            else {
                this.partIndex[part.type].push(part.index);
            }
        }
    }

    public toTemplateMapPartType(type: string): DTemplateMapPartType {
        switch (type) {
            case "Floor":
                return DTemplateMapPartType.Floor;
            case "FloorDecoration":
                return DTemplateMapPartType.FloorDecoration;
            case "Footpath":
                return DTemplateMapPartType.Footpath;
            case "FootpathDecoration":
                return DTemplateMapPartType.FootpathDecoration;
            case "Passageway":
                return DTemplateMapPartType.Passageway;
            case "PassagewayDecoration":
                return DTemplateMapPartType.PassagewayDecoration;
            case "Water":
                return DTemplateMapPartType.Water;
            case "WaterDecoration":
                return DTemplateMapPartType.WaterDecoration;
            case "ShopFloor":
                return DTemplateMapPartType.ShopFloor;
            case "ShopFloorDecoration":
                return DTemplateMapPartType.ShopFloorDecoration;
            case "Wall":
                return DTemplateMapPartType.Wall;
            case "WallDecoration":
                return DTemplateMapPartType.WallDecoration;
            case "HardWall":
                return DTemplateMapPartType.HardWall;
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
    
    public toTemplateMapPartPlacementType(type: string): DTemplateMapPartPlacementType {
        switch (type) {
            case "Random":
                return DTemplateMapPartPlacementType.Random;
        default:
            throw new Error(`Invalid type: ${type}.`);
        }
    }
}

