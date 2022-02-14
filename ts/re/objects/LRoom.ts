import { FRoom } from "ts/re/floorgen/FMapData";
import { REGame } from "./REGame";
import { LBlock, TileShape } from "./LBlock";
import { LEntity } from "./LEntity";
import { RESerializable } from "../Common";

export enum MonsterHouseState {
    Sleeping = 0,
    Activated = 1,
}

@RESerializable
export class LRoom {
    private _roomId: number = 0;
    private _x1: number = -1;   // 有効範囲内左上座標
    private _y1: number = -1;   // 有効範囲内左上座標
    private _x2: number = -1;   // 有効範囲内右下座標
    private _y2: number = -1;   // 有効範囲内右下座標

    public setup(room: FRoom): void {
        this._roomId = room.id();
        this._x1 = room.x1();
        this._y1 = room.y1();
        this._x2 = room.x2();
        this._y2 = room.y2();
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

    public get width(): number {
        return this._x2 - this._x1 + 1;
    }

    public get height(): number {
        return this._y2 - this._y1 + 1;
    }

    public contains(x: number, y: number): boolean {
        return this._x1 <= x && x <= this._x2 && this._y1 <= y && y <= this._y2;
    }
    
    public forEachEntities(func: (entity: LEntity) => void): void {
        for (const entity of REGame.map.entities()) {
            if (this.contains(entity.x, entity.y)) {
                func(entity);
            }
        }
    }
    
    public findEntityInRoom(func: (entity: LEntity) => boolean): LEntity | undefined {
        for (const entity of REGame.map.entities()) {
            if (this.contains(entity.x, entity.y)) {
                if (func(entity)) {
                    return entity;
                }
            }
        }
        return undefined;
    }

    /** 部屋内の Block を列挙する。 */
    public forEachBlocks(func: (block: LBlock) => void): void {
        const map = REGame.map;
        for (let y = this._y1; y <= this._y2; y++) {
            for (let x = this._x1; x <= this._x2; x++) {
                const block = map.block(x, y);
                func(block);
            }
        }
    }
    
    /** 部屋の外側、外周1タイル分の Block を列挙する */
    public forEachEdgeBlocks(func: (block: LBlock) => void): void {
        const map = REGame.map;
        const left = Math.max(0, this._x1 - 1);
        const right = Math.min(this._x2 + 1, map.width() - 1);

        if (1 <= this._y1) {
            for (let x = left; x <= right; x++) {
                func(map.block(x, this._y1 - 1));
            }
        }
        if (1 <= this._x1) {
            for (let y = this._y1; y <= this._y2; y++) {
                func(map.block(this._x1 - 1, y));
            }
        }
        if (this._x2 < REGame.map.width() - 1) {
            for (let y = this._y1; y <= this._y2; y++) {
                func(map.block(this._x2 + 1, y));
            }
        }
        if (this._y2 < REGame.map.height() - 1) {
            for (let x = left; x <= right; x++) {
                func(map.block(x, this._y2 + 1));
            }
        }
    }

    /** 部屋の入口 Block リスト。埋蔵金部屋など、入り口が無い場合は空リストを返す。 */
    public doorwayBlocks(): LBlock[] {
        const result: LBlock [] = [];
        this.forEachBlocks(b => {
            if (b.isDoorway()) result.push(b);
        });
        return result;
    }

    /**
     * 指定した Block が、この部屋として有効な視界内にあるかを確認する。
     * (部屋の床タイルと、周囲１マスの壁は有効視界である)
     */
    public checkVisibilityBlock(block: LBlock): boolean {
        return this._x1 - 1 <= block.x() && block.x() <= this._x2 + 1 &&
               this._y1 - 1 <= block.y() && block.y() <= this._y2 + 1;
    }

    /*
    public forEachEntranceBlocks(func: (block: REGame_Block) => void): void {
        const map = REGame.map;
        if (1 <= this._x1) {
            for (let y = this._y1; y <= this._y2; y++) {
                const block = map.block(this._x1 - 1, y);
                if (block.tileKind() == TileKind.Floor) {
                    func(block);
                }
            }
        }
        if (1 <= this._y1) {
            for (let x = this._x1; x <= this._x2; x++) {
                const block = map.block(x, this._y1 - 1);
                if (block.tileKind() == TileKind.Floor) {
                    func(block);
                }
            }
        }
        if (this._x2 < REGame.map.width() - 1) {
            for (let y = this._y1; y <= this._y2; y++) {
                const block = map.block(this._x2 + 1, y);
                if (block.tileKind() == TileKind.Floor) {
                    func(block);
                }
            }
        }
        if (this._y2 < REGame.map.height() - 1) {
            for (let x = this._x1; x <= this._x2; x++) {
                const block = map.block(x, this._y1 + 1);
                if (block.tileKind() == TileKind.Floor) {
                    func(block);
                }
            }
        }
    }
    */

}


