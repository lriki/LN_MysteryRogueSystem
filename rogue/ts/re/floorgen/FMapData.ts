import { assert } from "ts/re/Common";
import { DMonsterHouseTypeId } from "ts/re/data/DMonsterHouse";
import { LFloorId } from "ts/re/objects/LFloorId";
import { LRandom } from "ts/re/objects/LRandom";
import { TileShape } from "ts/re/objects/LBlock";
import { FStructure } from "./FStructure";
import { DItemShopTypeId } from "ts/re/data/DItemShop";


export enum FDirection {
    T = 0,  // Top
    B = 1,  // Bottom
    L = 2,  // Left
    R = 3,  // Right
}

export enum FAxis {
    H,
    V,
}

export type FSectorId = number;   // 0 is invalid
export type FRoomId = number;   // 0 is invalid
export type FConnectionId = number;

export enum FBlockComponent {
    None,   // Wall
    Room,
    Passageway,
}

export class FEdgePin {
    private _edge: FSectorEdge;
    private _pos: number;   //  (Sector 座標系)

    public constructor(edge: FSectorEdge, pos: number) {
        this._edge = edge;
        this._pos = pos;
    }

    public edge(): FSectorEdge {
        return this._edge;
    }

    public pos(): number {
        return this._pos;
    }

    public mx(): number {
        const s = this._edge.sector();
        const d = this._edge.direction();
        if (d == FDirection.L) {
            return s.x1();
        }
        else if (d == FDirection.R) {
            return s.x2();
        }
        else {
            return s.x1() + this._pos;
        }
    }

    public my(): number {
        const s = this._edge.sector();
        const d = this._edge.direction();
        if (d == FDirection.T) {
            return s.y1();
        }
        else if (d == FDirection.B) {
            return s.y2();
        }
        else {
            return s.y1() + this._pos;
        }
    }
}

export class FSectorEdge {
    private _sector: FSector;
    private _direction: FDirection;
    private _adjacencies: FSectorAdjacency[];
    private _connections: FSectorConnection[];
    private _pins: FEdgePin[];

    public constructor(sector: FSector, dir: FDirection) {
        this._sector = sector;
        this._direction = dir;
        this._adjacencies = [];
        this._connections = [];
        this._pins = [];
    }

    public sector(): FSector {
        return this._sector;
    }

    public direction(): FDirection {
        return this._direction;
    }

    public resetLength(length: number): void {
        this._pins = []
        //for (let i = 0; i < length; i++) {
        //    this._pins.push(new FEdgePin(this, i));
        //}
    }

    public addAdjacency(adjacency: FSectorAdjacency): void {
        this._adjacencies.push(adjacency);
    }

    public hasAdjacency(): boolean {
        return this._adjacencies.length > 0;
    }
    
    public adjacencies(): FSectorAdjacency[] {
        return this._adjacencies;
    }

    public addConnection(connection: FSectorConnection): void {
        this._connections.push(connection);
    }

    public hasConnection(): boolean {
        return this._connections.length > 0;
    }

    public hasConnectionFully(): boolean {
        return this._connections.length == this._adjacencies.length;
    }

    public addPin(pos: number): void {
        const pin = new FEdgePin(this, pos);
        this._pins.push(pin);
    }

    public pins():  readonly FEdgePin[] {
        return this._pins;
    }

    public isValidPinPos(pos: number): boolean {
        return this._pins.find(pin => pin.pos() == pos) != undefined;
    }
}

// 区画情報。今のところ、ランダムマップ生成時の一時情報。
export class FSector {
    private _map: FMap;
    private _id: FSectorId;
    private _x1: number = -1;   // 有効範囲内左上座標 (Map 座標系)
    private _y1: number = -1;   // 有効範囲内左上座標 (Map 座標系)
    private _x2: number = -1;   // 有効範囲内右下座標 (Map 座標系)
    private _y2: number = -1;   // 有効範囲内右下座標 (Map 座標系)
    private _px: number = 0;    // Pivot. x1 からの相対座標 (Room 座標系)
    private _py: number = 0;    // Pivot. y1 からの相対座標 (Room 座標系)
    private _edges: FSectorEdge[];
    private _room: FRoom | undefined;
    //private _wayPointsX: number[];  // x1~x2 間で、通路を作ってもよい X 座標
    //private _wayPointsY: number[];  // y1~y2 間で、通路を作ってもよい Y 座標

    public constructor(map: FMap, id: FSectorId) {
        this._map = map;
        this._id = id;
        this._edges = [
            new FSectorEdge(this, FDirection.T),
            new FSectorEdge(this, FDirection.B),
            new FSectorEdge(this, FDirection.L),
            new FSectorEdge(this, FDirection.R),
        ];
        //this._wayPointsX = [];
        //this._wayPointsY = [];
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
        this._edges[FDirection.T].resetLength(this.width());
        this._edges[FDirection.B].resetLength(this.width());
        this._edges[FDirection.L].resetLength(this.height());
        this._edges[FDirection.R].resetLength(this.height());
    }

    public id(): FSectorId {
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

    public px(): number {
        return this._px;
    }

    public py(): number {
        return this._py;
    }

    public width(): number {
        return this._x2 - this._x1 + 1;
    }

    public height(): number {
        return this._y2 - this._y1 + 1;
    }

    public setPivot(px: number, py: number): void {
        this._px = px;
        this._py = py;
    }

    public edge(d: FDirection): FSectorEdge {
        return this._edges[d];
    }

    public edges(): readonly FSectorEdge[] {
        return this._edges;
    }

    public room(): FRoom | undefined {
        return this._room;
    }

    public setRoom(room: FRoom | undefined): void {
        this._room = room;
    }

    public isRoomBesideX(mx: number): boolean {
        if (this._room) {
            return (this._room.x1() - 1 == mx) || (this._room.x2() + 1 == mx);
        }
        else {
            return false;
        }
    }

    public isRoomBesideY(my: number): boolean {
        if (this._room) {
            return (this._room.y1() - 1 == my) || (this._room.y2() + 1 == my);
        }
        else {
            return false;
        }
    }

    //public setWeyPoints(x: number[], y: number[]) {
    //    this._wayPointsX = x;
    //    this._wayPointsY = y;
    //}

    public GlobalToLocalX(gx: number): number {
        return gx - this.x1();
    }

    public GlobalToLocalY(gy: number): number {
        return gy - this.y1();
    }

    public contains(mx: number, my: number): boolean {
        return this._x1 <= mx && mx < this._x2 && this._y1 <= my && my < this._y2;
    }

    public hasAnyConnection(): boolean {
        return this._edges.some(e => e.hasConnection());
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

    public edge1(): FSectorEdge {
        return this._edge1;
    }

    public edge2(): FSectorEdge {
        return this._edge2;
    }

    public hasPair(e1: FSectorEdge, e2: FSectorEdge): boolean {
        return (e1 == this._edge1 && e2 == this._edge2) || (e2 == this._edge1 && e1 == this._edge2);
    }

    public otherSide(edge: FSectorEdge): FSectorEdge {
        if (edge == this._edge1)
            return this._edge2;
        if (edge == this._edge2)
            return this._edge1;
        throw new Error();
    }

    public otherSideBySector(sector: FSector): FSectorEdge {
        if (sector == this._edge1.sector())
            return this._edge2;
        if (sector == this._edge2.sector())
            return this._edge1;
        throw new Error();
    }
}

export class FSectorConnection {
    private _id: FConnectionId;
    private _edge1: FSectorEdge;
    private _edge2: FSectorEdge;
    private _pin1: FEdgePin | undefined;
    private _pin2: FEdgePin | undefined;

    public constructor(id: FConnectionId, edge1: FSectorEdge, edge2: FSectorEdge) {
        this._id = id;
        this._edge1 = edge1;
        this._edge2 = edge2;
    }

    public id(): FConnectionId {
        return this._id;
    }

    public edge1(): FSectorEdge {
        return this._edge1;
    }

    public edge2(): FSectorEdge {
        return this._edge2;
    }

    public pin1(): FEdgePin | undefined {
        return this._pin1;
    }

    public pin2(): FEdgePin | undefined {
        return this._pin2;
    }

    public alignedAxis(): FAxis {
        return (this._edge1.direction() == FDirection.L || this._edge1.direction() == FDirection.R) ? FAxis.H : FAxis.V;
    }

    public setConnectedPins(pin1: FEdgePin, pin2: FEdgePin): void {
        assert(this._edge1.pins().find(pin => pin == pin1));    // edge に含まれている pin であること
        assert(this._edge2.pins().find(pin => pin == pin2));    // edge に含まれている pin であること
        this._pin1 = pin1;
        this._pin2 = pin2;
    }

}

export class FMapBlock {
    private _x;
    private _y;
    private _tileShape: TileShape;
    private _blockComponent: FBlockComponent;
    private _sectorId: FSectorId;
    private _roomId: FRoomId;
    private _doorway: boolean;  // 部屋の入口
    private _continuation: boolean; // ゴールとなる階段から地続きであるか
    private _monsterHouseTypeId: DMonsterHouseTypeId;   // リージョンを使って MH をマークするために用意したもの。MH である Block をひとつでも含む Room は MH となる。
    private _itemShopTypeId: DItemShopTypeId;

    public constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
        this._tileShape = TileShape.Floor;
        this._blockComponent = FBlockComponent.None;
        this._sectorId = 0;
        this._roomId = 0;
        this._doorway = false;
        this._continuation = false;
        this._monsterHouseTypeId = 0;
        this._itemShopTypeId = 0;
    }

    public x(): number {
        return this._x;
    }

    public y(): number {
        return this._y;
    }

    public setTileShape(value: TileShape): void {
        this._tileShape = value;
    }

    public tileShape(): TileShape {
        return this._tileShape;
    }

    public setComponent(value: FBlockComponent): void {
        this._blockComponent = value;
    }

    public component(): FBlockComponent {
        return this._blockComponent;
    }

    public setMonsterHouseTypeId(value: DMonsterHouseTypeId): void {
        this._monsterHouseTypeId = value;
    }

    public monsterHouseTypeId(): DMonsterHouseTypeId {
        return this._monsterHouseTypeId;
    }

    public setItemShopTypeId(value: DItemShopTypeId): void {
        this._itemShopTypeId = value;
    }

    public itemShopTypeId(): DItemShopTypeId {
        return this._itemShopTypeId;
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

    // TODO: 水路かつ部屋、水路かつ通路、みたいなこともあるので分ける必要がある
    public isRoom(): boolean {
        return this._blockComponent == FBlockComponent.Room;
    }
    
    /**
     * 本質的なものとして通行可能であるか。
     * 例えば隠し通路 (通常攻撃で通路が姿を現す) の場合、tileKind は Wall であるが、Component は Passageway となる。
     */
    public isPassagableComponent(): boolean {
        return this._blockComponent == FBlockComponent.Room || this._blockComponent == FBlockComponent.Passageway;
    }

    public roomId(): FRoomId {
        return this._roomId;
    }

    public setDoorway(value: boolean) {
        this._doorway = value;
    }

    public isDoorway(): boolean {
        return this._doorway;
    }

    public setContinuation(value: boolean) {
        this._continuation = value;
    }

    public isContinuation(): boolean {
        return this._continuation;
    }

    
}

export class FRoom {
    private _map: FMap;
    private _id: FRoomId;
    private _sector: FSector;
    private _x1: number = -1;   // 有効範囲内左上座標 (Map 座標系)
    private _y1: number = -1;   // 有効範囲内左上座標 (Map 座標系)
    private _x2: number = -1;   // 有効範囲内右下座標 (Map 座標系)
    private _y2: number = -1;   // 有効範囲内右下座標 (Map 座標系)
    private _structures: FStructure[] = [];

    public constructor(map: FMap, id: FRoomId, sector: FSector) {
        this._map = map;
        this._id = id;
        this._sector = sector;
    }

    public id(): FRoomId {
        return this._id;
    }

    public sector(): FSector {
        return this._sector;
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

    public width(): number {
        return this._x2 - this._x1 + 1;
    }

    public height(): number {
        return this._y2 - this._y1 + 1;
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

    public setRect(x: number, y: number, w: number, h: number): void {
        this._x1 = x;
        this._y1 = y;
        this._x2 = x + w - 1;
        this._y2 = y + h - 1;
    }
    
    public blocks(): FMapBlock[] {
        const result = [];
        for (let my = this._y1; my <= this._y2; my++) {
            for (let mx = this._x1; mx <= this._x2; mx++) {
                result.push(this._map.block(mx, my));
            }
        }
        return result;
    }

    public addStructureRef(value: FStructure): void {
        this._structures.push(value);
    }

    public structures(): readonly FStructure[] {
        return this._structures;
    }
}

export class FEntryPont {
    private _mx: number;
    private _my: number;

    public constructor(mx: number, my: number) {
        this._mx = mx;
        this._my = my;
    }

    public mx(): number {
        return this._mx;
    }

    public my(): number {
        return this._my;
    }
}

export class FExitPont {
    private _mx: number;
    private _my: number;

    public constructor(mx: number, my: number) {
        this._mx = mx;
        this._my = my;
    }

    public mx(): number {
        return this._mx;
    }

    public my(): number {
        return this._my;
    }
}

export class FMap {
    private _floorId: LFloorId;
    private _randSeed: number; // for debug
    private _rand: LRandom;
    private _width: number;
    private _height: number;
    private _blocks: FMapBlock[];
    private _sectors: FSector[];
    private _sectorAdjacencies: FSectorAdjacency[];
    private _sectorConnections: FSectorConnection[];
    private _rooms: FRoom[];
    private _structures: FStructure[];
    private _entryPoint: FEntryPont | undefined;
    private _exitPont: FExitPont | undefined;

    public constructor(floorId: LFloorId, randSeed: number) {
        this._floorId = floorId;
        this._randSeed = randSeed;
        this._rand = new LRandom(this._randSeed);
        this._width = 0;
        this._height = 0;
        this._blocks = [];
        this._sectorAdjacencies = [];
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
        this._rooms = [new FRoom(this, 0, this._sectors[0])];    // dummy
    }

    public floorId(): LFloorId {
        return this._floorId;
    }

    public random(): LRandom {
        return this._rand;
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
        return this._sectors.filter(s => s.id() > 0);
    }

    public newSector(): FSector {
        const sector = new FSector(this, this._sectors.length);
        this._sectors.push(sector);
        return sector;
    }

    public attemptNewAdjacency(s1: FSector, s1Dir: FDirection, s2: FSector, s2Dir: FDirection): FSectorAdjacency {
        const edge1 = s1.edge(s1Dir);
        const edge2 = s2.edge(s2Dir);
        const exists = this._sectorAdjacencies.find(a => a.hasPair(edge1, edge2));
        if (exists) return exists;

        const adjacency = new FSectorAdjacency(edge1, edge2);
        this._sectorAdjacencies.push(adjacency);
        edge1.addAdjacency(adjacency);
        edge2.addAdjacency(adjacency);
        return adjacency;
    }

    public connectSectors(edge1: FSectorEdge, edge2: FSectorEdge): FSectorConnection {
        assert(edge1 != edge2);
        const connection = new FSectorConnection(this._sectorConnections.length, edge1, edge2);
        this._sectorConnections.push(connection);
        edge1.addConnection(connection);
        edge2.addConnection(connection);
        return connection;
    }

    public adjacencies(): readonly FSectorAdjacency[] {
        return this._sectorAdjacencies;
    }

    public connections(): readonly FSectorConnection[] {
        return this._sectorConnections;
    }

    public room(roomId: FRoomId): FRoom {
        return this._rooms[roomId];
    }

    public rooms_raw(): readonly FRoom[] {
        return this._rooms;
    }

    public rooms(): readonly FRoom[] {
        return this._rooms.filter(s => s.id() > 0);
    }

    public newRoom(sector: FSector): FRoom {
        const room = new FRoom(this, this._rooms.length, sector);
        this._rooms.push(room);
        sector.setRoom(room);
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

    public setEntryPont(value: FEntryPont) {
        this._entryPoint = value;
    }
    
    public entryPoint(): FEntryPont | undefined {
        return this._entryPoint;
    }

    public setExitPont(value: FExitPont) {
        this._exitPont = value;
    }
    
    public exitPont(): FExitPont | undefined {
        return this._exitPont;
    }

    public rmmzFixedMapData(): IDataMap {
        assert(this._floorId.isFixedMap());
        return $dataMap;
    }

    // For Debug
    public print(): void {

        let s = "";
        for (let y = 0; y < this._height; y++) {
            for (let x = 0; x < this._width; x++) {
                if (this._exitPont && this._exitPont.mx() == x && this._exitPont.my() == y) {
                    s += "!";
                }
                else if (this._sectors.find(s => (s.x1() + s.px()) == x && (s.y1() + s.py()) == y)) {
                    s += "@";
                }
                else if (this.block(x, y).isContinuation()) {
                    s += "o";
                }
                else if (this.block(x, y).isDoorway()) {
                    s += "&";
                }
                else {
                    switch (this.block(x, y).component()) {
                        case FBlockComponent.None: s += "."; break;
                        case FBlockComponent.Room: s += "*"; break;
                        case FBlockComponent.Passageway: s += "#"; break;
                    }
                }
            }
            s += "\n";
        }
        console.log(s);
        console.log("Seed:", this._randSeed);
    }
}

