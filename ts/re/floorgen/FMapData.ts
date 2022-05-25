import { assert } from "ts/re/Common";
import { DMonsterHouseTypeId } from "ts/re/data/DMonsterHouse";
import { LFloorId } from "ts/re/objects/LFloorId";
import { LRandom } from "ts/re/objects/LRandom";
import { TileShape } from "ts/re/objects/LBlock";
import { FStructure } from "./FStructure";
import { DItemShopTypeId } from "ts/re/data/DItemShop";
import { FSector, FSectorAdjacency, FSectorConnection } from "./data/FSector";


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
            return s.mx1;
        }
        else if (d == FDirection.R) {
            return s.mx2;
        }
        else {
            return s.mx1 + this._pos;
        }
    }

    public my(): number {
        const s = this._edge.sector();
        const d = this._edge.direction();
        if (d == FDirection.T) {
            return s.my1;
        }
        else if (d == FDirection.B) {
            return s.my2;
        }
        else {
            return s.my1 + this._pos;
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

export class FMapBlock {
    private _mx;
    private _my;
    private _tileShape: TileShape;
    private _blockComponent: FBlockComponent;
    private _sectorId: FSectorId;
    private _roomId: FRoomId;
    private _doorway: boolean;  // 部屋の入口
    private _continuation: boolean; // ゴールとなる階段から地続きであるか
    private _fixedMapMonsterHouseTypeId: DMonsterHouseTypeId;   // リージョンを使って MH をマークするために用意したもの。MH である Block をひとつでも含む Room は MH となる。
    private _fixedMapItemShopTypeId: DItemShopTypeId;

    public constructor(mx: number, my: number) {
        this._mx = mx;
        this._my = my;
        this._tileShape = TileShape.Wall;
        this._blockComponent = FBlockComponent.None;
        this._sectorId = 0;
        this._roomId = 0;
        this._doorway = false;
        this._continuation = false;
        this._fixedMapMonsterHouseTypeId = 0;
        this._fixedMapItemShopTypeId = 0;
    }

    public get mx(): number {
        return this._mx;
    }

    public get my(): number {
        return this._my;
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

    public setFixedMapMonsterHouseTypeId(value: DMonsterHouseTypeId): void {
        this._fixedMapMonsterHouseTypeId = value;
    }

    public fixedMapMonsterHouseTypeId(): DMonsterHouseTypeId {
        return this._fixedMapMonsterHouseTypeId;
    }

    public setFixedMapItemShopTypeId(value: DItemShopTypeId): void {
        this._fixedMapItemShopTypeId = value;
    }

    public fixedMapItemShopTypeId(): DItemShopTypeId {
        return this._fixedMapItemShopTypeId;
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
    private _mx1: number = -1;   // 有効範囲内左上座標 (Map 座標系)
    private _my1: number = -1;   // 有効範囲内左上座標 (Map 座標系)
    private _mx2: number = -1;   // 有効範囲内右下座標 (Map 座標系)
    private _my2: number = -1;   // 有効範囲内右下座標 (Map 座標系)
    private _structures: FStructure[] = [];

    public poorVisibility: boolean = false; // 視界不明瞭？

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

    public get mx1(): number {
        return this._mx1;
    }

    public get my1(): number {
        return this._my1;
    }

    public get mx2(): number {
        return this._mx2;
    }

    public get my2(): number {
        return this._my2;
    }

    public get width(): number {
        return this._mx2 - this._mx1 + 1;
    }

    public get height(): number {
        return this._my2 - this._my1 + 1;
    }

    public tryInfrateRect(mx: number, my: number): void {
        if (this._id == 0) return;

        if (this._mx1 < 0) {
            this._mx1 = mx;
            this._my1 = my;
            this._mx2 = mx;
            this._my2 = my;
        }
        else {
            this._mx1 = Math.min(this._mx1, mx);
            this._my1 = Math.min(this._my1, my);
            this._mx2 = Math.max(this._mx2, mx);
            this._my2 = Math.max(this._my2, my);
        }
    }

    public forEachBlocks(func: (block: FMapBlock) => void): void {
        if (this._id == 0) return;
        
        for (let y = this._my1; y <= this._my2; y++) {
            for (let x = this._mx1; x <= this._mx2; x++) {
                func(this._map.block(x, y));
            }
        }
    }

    public setRect(mx: number, my: number, mw: number, mh: number): void {
        this._mx1 = mx;
        this._my1 = my;
        this._mx2 = mx + mw - 1;
        this._my2 = my + mh - 1;
    }
    
    public blocks(): FMapBlock[] {
        const result = [];
        for (let my = this._my1; my <= this._my2; my++) {
            for (let mx = this._mx1; mx <= this._mx2; mx++) {
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
    private _innerWidth: number;
    private _innerHeight: number;
    private _fullWidth: number;
    private _fullHeight: number;
    private _paddingX: number;
    private _paddingY: number;
    private _blocks: FMapBlock[];
    private _innerBlocks: FMapBlock[];
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
        this._innerWidth = 0;
        this._innerHeight = 0;
        this._fullWidth = 0;
        this._fullHeight = 0;
        this._paddingX = 0;
        this._paddingY = 0;
        this._blocks = [];
        this._innerBlocks = [];
        this._sectorAdjacencies = [];
        this._sectorConnections = [];
        this._sectors = [];
        this._rooms = [];
        this._structures = [];
    }

    public resetFromInnerSize(innerWidth: number, innerHeight: number, paddingX: number, paddingY: number): void {
        this.resetFromFullSize(innerWidth + (paddingX * 2), innerHeight + (paddingY * 2), paddingX, paddingY);
    }

    public resetFromFullSize(fullWidth: number, fullHeight: number, paddingX: number, paddingY: number): void {
        this._fullWidth = fullWidth;
        this._fullHeight = fullHeight;
        this._innerWidth = fullWidth - (paddingX * 2);
        this._innerHeight = fullHeight - (paddingY * 2);
        this._paddingX = paddingX;
        this._paddingY = paddingY;
        this._blocks = new Array<FMapBlock>(fullWidth * fullHeight);
        this._innerBlocks = [];//new Array<FMapBlock>(this._innerWidth * this._innerHeight);
        for (let i = 0; i < this._blocks.length; i++) {
            const mx = Math.trunc(i % this._fullWidth);
            const my = Math.trunc(i / this._fullWidth);
            const block = new FMapBlock(mx, my);
            this._blocks[i] = block;
            if (this.ox <= mx && mx < this.ox + this._innerWidth &&
                this.oy <= my && my < this.oy + this._innerHeight) {
                this._innerBlocks.push(block);
            }
            else {
                block.setTileShape(TileShape.Wall);
            }
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

    /** Inner の左上 X 座標 */
    public get ox(): number {
        return this._paddingX;
    }
    
    /** Inner の左上 Y 座標 */
    public get oy(): number {
        return this._paddingY;
    }

    public get fullWidth(): number {
        return this._fullWidth;
    }
    
    public get fullHeight(): number {
        return this._fullHeight;
    }

    public get innerWidth(): number {
        return this._innerWidth;
    }
    
    public get innerHeight(): number {
        return this._innerHeight;
    }

    public blocks(): readonly FMapBlock[] {
        return this._blocks;
    }

    public get innerBlocks(): readonly FMapBlock[] {
        return this._innerBlocks;
    }

    public innerBlock(x: number, y: number): FMapBlock {
        return this.block(this._paddingX + x, this._paddingY + y);
    }

    public blockTry(x: number, y: number): FMapBlock | undefined {
        if (this.isValid(x, y)) {
            return this._blocks[y * this._fullWidth + x];
        }
        else {
            return undefined;
        }
    }

    public block(x: number, y: number): FMapBlock {
        const block = this._blocks[y * this._fullWidth + x];
        assert(block);
        return block;
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
        return 0 <= x && x < this._fullWidth && 0 <= y && y < this._fullHeight;
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
        for (let y = 0; y < this._fullHeight; y++) {
            for (let x = 0; x < this._fullWidth; x++) {
                if (this._exitPont && this._exitPont.mx() == x && this._exitPont.my() == y) {
                    s += "!";
                }
                else if (this._sectors.find(s => (s.mx1 + s.px()) == x && (s.my1 + s.py()) == y)) {
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

