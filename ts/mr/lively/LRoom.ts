import { FRoom } from "ts/mr/floorgen/FMapData";
import { MRLively } from "./MRLively";
import { LBlock, LTileShape } from "./LBlock";
import { LEntity } from "./LEntity";
import { MRSerializable } from "../Common";

export enum MonsterHouseState {
    Sleeping = 0,
    Activated = 1,
}

@MRSerializable
export class LRoom {
    private _roomId: number = 0;
    private _mx1: number = -1;   // 有効範囲内左上座標
    private _my1: number = -1;   // 有効範囲内左上座標
    private _mx2: number = -1;   // 有効範囲内右下座標
    private _my2: number = -1;   // 有効範囲内右下座標
    private _poorVisibility: boolean = false; // 視界不明瞭？

    public setup(room: FRoom): void {
        this._roomId = room.id();
        this._mx1 = room.mx1;
        this._my1 = room.my1;
        this._mx2 = room.mx2;
        this._my2 = room.my2;
        this._poorVisibility = room.poorVisibility;
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

    public get poorVisibility(): boolean {
        return this._poorVisibility;
    }

    public contains(mx: number, my: number): boolean {
        return this._mx1 <= mx && mx <= this._mx2 && this._my1 <= my && my <= this._my2;
    }

    /** 外周1マスも考慮し、mx,my が部屋に含まれているか確認する */
    public containsWithEdge(mx: number, my: number): boolean {
        return this._mx1 - 1 <= mx && mx <= this._mx2 + 1 && this._my1 - 1 <= my && my <= this._my2 + 1;
    }
    
    public forEachEntities(func: (entity: LEntity) => void): void {
        for (const entity of MRLively.mapView.currentMap.entities()) {
            if (this.contains(entity.mx, entity.my)) {
                func(entity);
            }
        }
    }
    
    public findEntityInRoom(func: (entity: LEntity) => boolean): LEntity | undefined {
        for (const entity of MRLively.mapView.currentMap.entities()) {
            if (this.contains(entity.mx, entity.my)) {
                if (func(entity)) {
                    return entity;
                }
            }
        }
        return undefined;
    }

    /** 部屋内の Block を列挙する。 */
    public forEachBlocks(func: (block: LBlock) => void): void {
        const map = MRLively.mapView.currentMap;
        for (let y = this._my1; y <= this._my2; y++) {
            for (let x = this._mx1; x <= this._mx2; x++) {
                const block = map.block(x, y);
                func(block);
            }
        }
    }
    
    /** 部屋の外側、外周1タイル分の Block を列挙する */
    public forEachEdgeBlocks(func: (block: LBlock) => void): void {
        const map = MRLively.mapView.currentMap;
        const left = Math.max(0, this._mx1 - 1);
        const right = Math.min(this._mx2 + 1, map.width() - 1);

        if (1 <= this._my1) {
            for (let x = left; x <= right; x++) {
                func(map.block(x, this._my1 - 1));
            }
        }
        if (1 <= this._mx1) {
            for (let y = this._my1; y <= this._my2; y++) {
                func(map.block(this._mx1 - 1, y));
            }
        }
        if (this._mx2 < MRLively.mapView.currentMap.width() - 1) {
            for (let y = this._my1; y <= this._my2; y++) {
                func(map.block(this._mx2 + 1, y));
            }
        }
        if (this._my2 < MRLively.mapView.currentMap.height() - 1) {
            for (let x = left; x <= right; x++) {
                func(map.block(x, this._my2 + 1));
            }
        }
    }

    public forEachSightableBlocks(func: (block: LBlock) => void): void {
        this.forEachBlocks(func);
        this.forEachEdgeBlocks(func);
    }

    /** 部屋の入口 Block リスト。埋蔵金部屋など、入り口が無い場合は空リストを返す。 */
    public getRoomInnerEntranceBlocks(): LBlock[] {
        const result: LBlock [] = [];
        this.forEachBlocks(b => {
            if (b.isRoomInnerEntrance()) result.push(b);
        });
        return result;
    }

    /**
     * 指定した Block が、この部屋として有効な視界内にあるかを確認する。
     * (部屋の床タイルと、周囲１マスの壁は有効視界である)
     * 
     * @see USearch.checkInSightBlockFromSubject
     */
    public checkVisibilityBlock(block: LBlock): boolean {
        return this._mx1 - 1 <= block.mx && block.mx <= this._mx2 + 1 &&
               this._my1 - 1 <= block.my && block.my <= this._my2 + 1;
    }
}


