import { DMapId } from "ts/data/DLand";
import { DMonsterHouseId } from "ts/data/DMonsterHouse";
import { TileKind } from "ts/objects/REGame_Block";
import { FStructure } from "./FStructure";


export enum FDirection
{
    N = 0,  // North
    S = 1,  // South
    W = 2,   // West
    E = 3,   // East
}

export type FSectorId = number;   // 0 is invalid
export type FRoomId = number;   // 0 is invalid

export enum FBlockComponent {
    None,   // Wall
    Room,
    Passageway,
}

export class FEdgePin {
    private _edge: FSectorEdge;
    private _index: number;

    public constructor(edge: FSectorEdge, index: number) {
        this._edge = edge;
        this._index = index;
    }
}

export class FSectorEdge {
    private _sector: FSector;
    private _direction: FDirection;
    private _connections: FSectorConnection[];
    private _pins: FEdgePin[];

    public constructor(sector: FSector, dir: FDirection) {
        this._sector = sector;
        this._direction = dir;
        this._connections = [];
        this._pins = [];
    }

    public resetLength(length: number): void {
        this._pins = []
        for (let i = 0; i < length; i++) {
            this._pins.push(new FEdgePin(this, i));
        }
    }
    
    public addConnection(connection: FSectorConnection): void {
        this._connections.push(connection);
    }
}

// 区画情報。今のところ、ランダムマップ生成時の一時情報。
export class FSector {
    private _map: FMap;
    private _id: FSectorId;
    private _x1: number = -1;   // 有効範囲内左上座標
    private _y1: number = -1;   // 有効範囲内左上座標
    private _x2: number = -1;   // 有効範囲内右下座標
    private _y2: number = -1;   // 有効範囲内右下座標
    private _edges: FSectorEdge[];

    public constructor(map: FMap, id: FSectorId) {
        this._map = map;
        this._id = id;
        this._edges = [
            new FSectorEdge(this, FDirection.N),
            new FSectorEdge(this, FDirection.S),
            new FSectorEdge(this, FDirection.W),
            new FSectorEdge(this, FDirection.E),
        ];
    }

    public setRect(x: number, y: number, w: number, h: number): void {
        this._x1 = x;
        this._y1 = y;
        this._x2 = x + w - 1;
        this._y2 = y + h - 1;
        
        // Link block and ection
        for (let y = this._y1; y <= this._y2; y++) {
            for (let x = this._x1; x <= this._x2; x++) {
                this._map.block(x, y).setSectorId(this._id);
            }
        }

        // Update Edge length
        this._edges[FDirection.N].resetLength(this.width());
        this._edges[FDirection.S].resetLength(this.width());
        this._edges[FDirection.W].resetLength(this.height());
        this._edges[FDirection.E].resetLength(this.height());
    }

    public width(): number {
        return this._x2 - this._x1 + 1;
    }

    public height(): number {
        return this._y2 - this._y1 + 1;
    }

    public edge(d: FDirection): FSectorEdge {
        return this._edges[d];
    }
}

// Sector の隣接性情報
export class FSectorAdjacency {
    private _edge1: FSectorEdge;
    private _edge2: FSectorEdge;

    public constructor(edge1: FSectorEdge, edge2: FSectorEdge) {
        this._edge1 = edge1;
        this._edge2 = edge2;
    }
}

export class FSectorConnection {
    private _edge1: FSectorEdge;
    private _edge2: FSectorEdge;

    public constructor(edge1: FSectorEdge, edge2: FSectorEdge) {
        this._edge1 = edge1;
        this._edge2 = edge2;
    }
}

export class FMapBlock {
    private _x;
    private _y;
    private _kind: TileKind;
    private _blockComponent: FBlockComponent;
    private _sectorId: FSectorId;
    private _roomId: FRoomId;
    private _monsterHouseTypeId: DMonsterHouseId;   // リージョンを使って MH をマークするために用意したもの。MH である Block をひとつでも含む Room は MH となる。

    public constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
        this._kind = TileKind.Floor;
        this._blockComponent = FBlockComponent.None;
        this._sectorId = 0;
        this._roomId = 0;
        this._monsterHouseTypeId = 0;
    }

    public x(): number {
        return this._x;
    }

    public y(): number {
        return this._y;
    }

    public setTileKind(value: TileKind): void {
        this._kind = value;
    }

    public tileKind(): TileKind {
        return this._kind;
    }

    public setComponent(value: FBlockComponent): void {
        this._blockComponent = value;
    }

    public component(): FBlockComponent {
        return this._blockComponent;
    }

    public setMonsterHouseTypeId(value: DMonsterHouseId): void {
        this._monsterHouseTypeId = value;
    }

    public monsterHouseTypeId(): DMonsterHouseId {
        return this._monsterHouseTypeId;
    }
    
    public setSectorId(value: FSectorId): void {
        this._sectorId = value;
    }

    public sectorId(): FSectorId {
        return this._sectorId;
    }

    public setRoomId(value: FRoomId): void {
        this._roomId = value;
    }

    public isRoom(): boolean {
        return this._blockComponent == FBlockComponent.Room;
    }

    public roomId(): FRoomId {
        return this._roomId;
    }
}

export class FRoom {
    private _map: FMap;
    private _id: FRoomId;
    private _x1: number = -1;   // 有効範囲内左上座標
    private _y1: number = -1;   // 有効範囲内左上座標
    private _x2: number = -1;   // 有効範囲内右下座標
    private _y2: number = -1;   // 有効範囲内右下座標

    public constructor(map: FMap, id: FRoomId) {
        this._map = map;
        this._id = id;
    }

    public id(): FRoomId {
        return this._id;
    }

    public x1(): number {
        return this._x1;
    }

    public y1(): number {
        return this._y1;
    }

    public x2(): number {
        return this._x2;
    }

    public y2(): number {
        return this._y2;
    }

    public tryInfrateRect(x: number, y: number): void {
        if (this._id == 0) return;

        if (this._x1 < 0) {
            this._x1 = x;
            this._y1 = y;
            this._x2 = x;
            this._y2 = y;
        }
        else {
            this._x1 = Math.min(this._x1, x);
            this._y1 = Math.min(this._y1, y);
            this._x2 = Math.max(this._x2, x);
            this._y2 = Math.max(this._y2, y);
        }
    }

    public forEachBlocks(func: (block: FMapBlock) => void): void {
        if (this._id == 0) return;
        
        for (let y = this._y1; y <= this._y2; y++) {
            for (let x = this._x1; x <= this._x2; x++) {
                func(this._map.block(x, y));
            }
        }
    }
}


export class FMap {
    private _width: number;
    private _height: number;
    private _blocks: FMapBlock[];
    private _sectors: FSector[];
    private _sectorConnections: FSectorConnection[];
    private _rooms: FRoom[];
    private _structures: FStructure[];

    public constructor() {
        this._width = 0;
        this._height = 0;
        this._blocks = [];
        this._sectorConnections = [];
        this._sectors = [];
        this._rooms = [];
        this._structures = [];
    }

    public reset(width: number, height: number) {
        this._width = width;
        this._height = height;
        this._blocks = new Array<FMapBlock>(width * height);
        for (let i = 0; i < this._blocks.length; i++) {
            const x = Math.trunc(i % this._width);
            const y = Math.trunc(i / this._width);
            this._blocks[i] = new FMapBlock(x, y);
        }
        this._sectors = [new FSector(this, 0)];    // dummy
        this._rooms = [new FRoom(this, 0)];    // dummy
    }

    public width(): number {
        return this._width;
    }
    
    public height(): number {
        return this._height;
    }

    public block(x: number, y: number): FMapBlock {
        return this._blocks[y * this._width + x];
    }

    public blockTry(x: number, y: number): FMapBlock | undefined {
        if (this.isValid(x, y)) {
            return this._blocks[y * this._width + x];
        }
        else {
            return undefined;
        }
    }

    public blocks(): readonly FMapBlock[] {
        return this._blocks;
    }

    public sectors(): readonly FSector[] {
        return this._sectors;
    }

    public newSector(): FSector {
        const sector = new FSector(this, this._sectors.length);
        this._sectors.push(sector);
        return sector;
    }

    public connectSectors(s1: FSector, s1Dir: FDirection, s2: FSector, s2Dir: FDirection): void {
        const edge1 = s1.edge(s1Dir);
        const edge2 = s2.edge(s2Dir);
        const connection = new FSectorConnection(edge1, edge2);
        this._sectorConnections.push(connection);
        edge1.addConnection(connection);
        edge2.addConnection(connection);
    }

    public rooms(): readonly FRoom[] {
        return this._rooms;
    }

    public newRoom(): FRoom {
        const room = new FRoom(this, this._rooms.length);
        this._rooms.push(room);
        return room;
    }

    public structures(): readonly FStructure[] {
        return this._structures;
    }

    public addStructure(structure: FStructure): void {
        this._structures.push(structure);
    }

    public isValid(x: number, y: number): boolean {
        return 0 <= x && x < this._width && 0 <= y && y < this._height;
    }
    
    // For Debug
    public print(): void {
        let s = "";
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                switch (this.block(x, y).component()) {
                    case FBlockComponent.None: s += "."; break;
                    case FBlockComponent.Room: s += "*"; break;
                    case FBlockComponent.Passageway: s += "+"; break;
                }
            }
            s += "\n";
        }
        console.log(s);
    }
}

