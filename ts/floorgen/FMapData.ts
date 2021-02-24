import { DFloorId } from "ts/data/DLand";
import { TileKind } from "ts/objects/REGame_Block";

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

    public constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
        this._kind = TileKind.Floor;
        this._blockComponent = FBlockComponent.None;
        this._roomId = 0;
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
    private _id: FRoomId;
    private _x1: number = -1;   // 有効範囲内左上座標
    private _y1: number = -1;   // 有効範囲内左上座標
    private _x2: number = -1;   // 有効範囲内右下座標
    private _y2: number = -1;   // 有効範囲内右下座標

    public constructor(id: FRoomId) {
        this._id = id;
    }

    public id(): FRoomId {
        return this._id;
    }

    public tryInfrateRect(x: number, y: number): void {
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
}


export class FMap {
    private _floorId: DFloorId;
    private _width: number;
    private _height: number;
    private _blocks: FMapBlock[];
    private _rooms: FRoom[];

    public constructor(floorId: DFloorId) {
        this._floorId = floorId;
        this._width = 0;
        this._height = 0;
        this._blocks = [];
        this._rooms = [];
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
        this._rooms = [new FRoom(0)];    // dummy
    }

    public floorId(): DFloorId {
        return this._floorId;
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
        const room = new FRoom(this._rooms.length);
        this._rooms.push(room);
        return room;
    }

    public isValid(x: number, y: number): boolean {
        return 0 <= x && x < this._width && 0 <= y && y < this._height;
    }
    
}

