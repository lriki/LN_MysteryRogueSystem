import { assert } from "ts/re/Common";
import { FAxis, FConnectionId, FDirection, FEdgePin, FMap, FRoom, FSectorEdge, FSectorId } from "../FMapData";

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
    private _roomShapeType: string;
    private _structureType: string;
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
        this._roomShapeType = "";
        this._structureType = "";
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

    public get roomShapeType(): string {
        return this._roomShapeType;
    }

    public set roomShapeType(value: string) {
        this._roomShapeType = value;
    }

    public get structureType(): string {
        return this._structureType;
    }

    public set structureType(value: string) {
        this._structureType= value;
    }

    public room(): FRoom | undefined {
        return this._room;
    }

    public setRoom(room: FRoom | undefined): void {
        this._room = room;
    }

    // 指定された mx 座標が、この Sector に含まれる Room の左端のひとつ左、または、右端のひとつ右 (つまり床に隣接した壁) であるか
    public isRoomBesideX(mx: number): boolean {
        if (this._room) {
            return (this._room.x1() - 1 == mx) || (this._room.x2() + 1 == mx);
        }
        else {
            return false;
        }
    }

    // 指定された my 座標が、この Sector に含まれる Room の上端のひとつ上、または、下端のひとつ下 (つまり床に隣接した壁) であるか
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
