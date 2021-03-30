import { DFloorId } from "ts/data/DLand";
import { DMonsterHouseId } from "ts/data/DMonsterHouse";
import { TileKind } from "ts/objects/REGame_Block";
import { FStructure } from "./FStructure";

export type FRoomId = number;   // 0 is invalid

export enum FBlockComponent {
    None,
    Room,
    Passageway,
}

export class FMapBlock {
    private _x;
    private _y;
    private _kind: TileKind;
    private _blockComponent: FBlockComponent;
    private _roomId: FRoomId;
    private _monsterHouseTypeId: DMonsterHouseId;   // リージョンを使って MH をマークするために用意したもの。MH である Block をひとつでも含む Room は MH となる。

    public constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
        this._kind = TileKind.Floor;
        this._blockComponent = FBlockComponent.None;
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
    private _rooms: FRoom[];
    private _structures: FStructure[];

    public constructor() {
        this._width = 0;
        this._height = 0;
        this._blocks = [];
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
    
}

