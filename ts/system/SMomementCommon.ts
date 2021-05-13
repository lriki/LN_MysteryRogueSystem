import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { RoomEventArgs } from "ts/data/predefineds/DBasicEvents";
import { LUnitAttribute } from "ts/objects/attributes/LUnitAttribute";
import { testPutInItem } from "ts/objects/behaviors/LBehavior";
import { MonsterHouseState } from "ts/objects/LRoom";
import { REGame } from "ts/objects/REGame";
import { BlockLayerKind, LBlock } from "ts/objects/LBlock";
import { LEntity } from "ts/objects/LEntity";
import { LMap } from "ts/objects/LMap";
import { Helpers } from "./Helpers";
import { SCommandContext } from "./SCommandContext";
import { RESystem } from "./RESystem";
import { System } from "pixi.js";

export interface SPoint {
    x: number;
    y: number;
}

interface Edge {
    x: number;      // 始点X
    y: number;      // 始点Y
    forwardX: number;   // 進行方向X
    forwardY: number;   // 進行方向Y
    beginOffset: number;
    endOffset: number;
}

export class SMomementCommon {
    // 8 を基準に時計回り
    private static readonly _edgeOffsetTable: number[] = [
        0,
        5, 4, 3,
        6, 0, 2,
        7, 0, 1,
    ];

    /**
     * 向き反転
     */
    public static reverseDir(d: number): number {
        return 10 - d;
    }

    /**
     * 斜め方向であるかを判断する
     */
    public static isDiagonalMoving(d: number): boolean {
        return (d % 2) != 0;
    }

    /**
     * base が target を向く時の方向を計算する
     */
    public static getLookAtDir(base: LEntity, target: LEntity): number {
        const dx = target.x - base.x;
        const dy = target.y - base.y;
        return Helpers.offsetToDir(dx, dy);
    }

    /**
     * 方向 d から時計回りに、次の方向を求める
     */
    public static getNextDirCW(d: number): number {
        switch (d) {
            case 1: return 4;
            case 2: return 1;
            case 3: return 2;
            case 4: return 7;
            case 6: return 3;
            case 7: return 8;
            case 8: return 9;
            case 9: return 6;
            default: return 2;
        }
    }

    /**
     * 
     */
    public static getNextAdjacentEntityDirCW(entity: LEntity): number {
        const map = REGame.map;
        let d = entity.dir;
        for (let i = 0; i < 9; i++) {
            const offset = Helpers.dirToTileOffset(d);
            const mx = entity.x + offset.x;
            const my = entity.y + offset.y;
            const e = map.block(mx, my).aliveEntity(BlockLayerKind.Unit);
            if (e) {
                return d;
            }
            d = this.getNextDirCW(d);
        }
        return entity.dir;
    }
    
    /**
     * entity が oldBlock から newBlock へ "歩行" 移動できるか判定する。
     * 
     * 地形のみを判断する点に注意。状態異常などによる移動制限は Behavior など他で行う。
     */
    private static checkPassageBlockToBlock(entity: LEntity, oldBlock: LBlock, newBlock: LBlock, layer?: BlockLayerKind): boolean {
        const map = REGame.map;
        const actualLayer = layer || entity.queryProperty(RESystem.properties.homeLayer);

        const dx = newBlock.x() - oldBlock.x();
        const dy = newBlock.y() - oldBlock.y();

        if (Math.abs(dx) > 1) return false; // 隣接 Block への移動ではない
        if (Math.abs(dy) > 1) return false; // 隣接 Block への移動ではない

        if (!map.canLeaving(oldBlock, entity)) return false;
        if (!map.canEntering(newBlock, actualLayer)) return false;

        const d = Helpers.offsetToDir(dx, dy);
        if (this.isDiagonalMoving(d)) {
            // 斜め移動の場合
            const fl = this.rotatePositionByDir(7, d);  // 左前
            const fr = this.rotatePositionByDir(9, d);  // 右前
            const flBlock = map.block(entity.x + fl.x, entity.y + fl.y);
            const frBlock = map.block(entity.x + fr.x, entity.y + fr.y);
            if (flBlock.isWallLikeShape()) return false;    // 壁があるので移動できない
            if (frBlock.isWallLikeShape()) return false;    // 壁があるので移動できない
        }
        else {
            // 平行移動の場合
        }

        return true;
    }



    // 2点間の距離 (到達に必要な移動ブロック数) を求める。
    // 斜め移動を許可している Block 単位の距離なので、マンハッタン距離やユークリッド距離とは違う点に注意。
    public static blockDistance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        return Math.max(dx, dy);
    }

    /**
     * 8(↑) 方向を基準としたローカル座標を、dir 方向に回転させたときのローカル座標を求める
     * @param localX 
     * @param localY 
     * @param dir 
     * 
     * 隣接ブロックや短い距離の扇形を変換するときなどで使用する。
     * 射程無限など広大な範囲をこれで変換するとパフォーマンスに影響が出るので、
     * そういったものは別途メソッドを用意すること。(TODO:)
     */
    public static transformRotationBlock(localX: number, localY: number, dir: number): SPoint {
        /*

        距離3を例にする。

        まず↓のように辺を分けて考える。

        00001
        3...1
        3.@.1
        3...1
        32222

        時計回りを正の移動方向と考えて、四辺は各 Edge の始点とする。(例：左上は Edge[0] の始点)

        


        */


        const distance = this.blockDistance(0, 0, localX, localY);
        const edgeLength = distance * 2;
        const edges: Edge[] = [
            {
                x: Helpers.dirToTileOffset(7).x * distance,
                y: Helpers.dirToTileOffset(7).y * distance,
                forwardX: 1,
                forwardY: 0,
                beginOffset: 0 * edgeLength,
                endOffset: 1 * edgeLength,
            },
            {
                x: Helpers.dirToTileOffset(9).x * distance,
                y: Helpers.dirToTileOffset(9).y * distance,
                forwardX: 0,
                forwardY: 1,
                beginOffset: 1 * edgeLength,
                endOffset: 2 * edgeLength,
            },
            {
                x: Helpers.dirToTileOffset(3).x * distance,
                y: Helpers.dirToTileOffset(3).y * distance,
                forwardX: -1,
                forwardY: 0,
                beginOffset: 2 * edgeLength,
                endOffset: 3 * edgeLength,
            },
            {
                x: Helpers.dirToTileOffset(1).x * distance,
                y: Helpers.dirToTileOffset(1).y * distance,
                forwardX: 0,
                forwardY: -1,
                beginOffset: 3 * edgeLength,
                endOffset: 4 * edgeLength,
            }
        ];

        let pos = -1;
        for (const edge of edges) {
            const sx = Math.min(edge.x, edge.x + edge.forwardX * edgeLength);
            const sy = Math.min(edge.y, edge.y + edge.forwardY * edgeLength);
            const ex = Math.max(edge.x, edge.x + edge.forwardX * edgeLength);
            const ey = Math.max(edge.y, edge.y + edge.forwardY * edgeLength);
            if (sx <= localX && localX <= ex && sy <= localY && localY <= ey) {
                pos = this.blockDistance(edge.x, edge.y, localX, localY) + edge.beginOffset;
                break;
            }
        }
        assert(pos >= 0);

        // dir に向けるには、外周上を何 Block 分移動すればよいか？
        const offset = this._edgeOffsetTable[dir] * distance;
        const newPos = (pos + offset) % edges[3].endOffset;   // 特に dir=7で変換すると、右方向が1週分回ることもある

        const edge = edges.find(e => e.beginOffset <= newPos && newPos < e.endOffset);
        assert(edge);

        const edgeLocalPos = newPos - edge.beginOffset;

        return {
            x: edge.x + (edge.forwardX * edgeLocalPos),
            y: edge.y + (edge.forwardY * edgeLocalPos),
        }
    }


    /**
     * 8(↑) 方向を基準としたローカル座標を、dir 方向に回転させたときのローカル座標を求める。
     * （ローカル座標は、座標の代わりに向きを指定）
     */
    public static rotatePositionByDir(localDir: number, dir: number): SPoint {
        const localPos = Helpers.dirToTileOffset(localDir);
        return this.transformRotationBlock(localPos.x, localPos.y, dir);
    }

    public static checkDashStopBlock(entity: LEntity): boolean {
        const x = entity.x;
        const y = entity.y;
        const map = REGame.map;
        const front = Helpers.dirToTileOffset(entity.dir);
        const block = map.block(x, y);
        const frontBlock = map.block(x + front.x, y + front.y);
        if (!this.checkPassageBlockToBlock(entity, block, frontBlock)) return false;    // そもそも Block 間の移動ができない
        if (block.layer(BlockLayerKind.Ground).isContainsAnyEntity()) return false;     // 足元に何かしらある場合はダッシュ停止
        if (block._roomId != frontBlock._roomId) return false;                          // 部屋と部屋や、部屋と通路の境界


        if (map.adjacentBlocks8(x, y).find(b => b.layer(BlockLayerKind.Unit).isContainsAnyEntity() || b.layer(BlockLayerKind.Ground).isContainsAnyEntity())) return false;

        
        if (block.isPassageway()) {
            const back = Helpers.dirToTileOffset(this.reverseDir(entity.dir));
            const count1 = map.adjacentBlocks4(x + back.x, y + back.y).filter(b => b.isFloorLikeShape()).length;
            const count2 = map.adjacentBlocks4(x, y).filter(b => b.isFloorLikeShape()).length;
            if (count1 < count2) return false;
        }
        else {
            if (block.isDoorway()) return false;
        }

        return true;
    }

    public static moveEntity(entity: LEntity, x: number, y: number, toLayer: BlockLayerKind): boolean {
        const map = REGame.map;
        assert(entity.floorId == map.floorId());

        if (!map.isValidPosition(x, y)) {
            return false;   // マップ外への移動
        }
        
        const oldBlock = map.block(entity.x, entity.y);
        const newBlock = map.block(x, y);

        if (this.checkPassageBlockToBlock(entity, oldBlock, newBlock, toLayer)) {
            assert(oldBlock.removeEntity(entity));
            entity.x = x;
            entity.y = y;
            newBlock.addEntity(toLayer, entity);
            this._postLocate(entity, oldBlock, newBlock, map);
            return true;
        }
        else {
            return false;
        }
    }
    
    /**
     * Entity の位置設定
     * 
     * - moveEntity() と異なり、移動可能判定を行わずに強制移動する。
     * - マップ生成時の Entity 配置や、ワープ移動などで使用する。
     * - 侵入判定を伴う。
     */
    public static locateEntity(entity: LEntity, x: number, y: number, toLayer?: BlockLayerKind): void {
        const map = REGame.map;
        assert(entity.floorId == map.floorId());

        const oldBlock = map.block(entity.x, entity.y);
        const newBlock = map.block(x, y);
        
        const layer = (toLayer) ? toLayer : entity.queryProperty(RESystem.properties.homeLayer);

        oldBlock.removeEntity(entity);
        entity.x = x;
        entity.y = y;
        newBlock.addEntity(layer, entity);
        this._postLocate(entity, oldBlock, newBlock, map);
    }
    
    private static _postLocate(entity: LEntity, oldBlock: LBlock, newBlock: LBlock, map: LMap) {
        if (REGame.camera.focusedEntityId().equals(entity.entityId())) {
            this.markPassed(map, newBlock);
        }

        if (oldBlock._roomId != newBlock._roomId) {
            const args: RoomEventArgs = {
                entity: entity,
                newRoomId: newBlock._roomId,
                oldRoomId: oldBlock._roomId,
            };
        
            REGame.eventServer.send(DBasics.events.roomEnterd, args);
            REGame.eventServer.send(DBasics.events.roomLeaved, args);
        }

        entity._located = true;
    }

    private static adjacentOffsets: number[][] = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1],
    ];

    private static markPassed(map: LMap, block: LBlock): void {
        block._passed = true;
        if (block._roomId > 0) {
            const room = map.room(block._roomId);
            room.forEachBlocks(b => b._passed = true);
            room.forEachEdgeBlocks(b => b._passed = true);
        }
        else {
            // 通路なら外周1タイルを通過済みにする
            this.adjacentOffsets.forEach(offset => {
                const x = block.x() + offset[0];
                const y = block.y() + offset[1];
                if (map.isValidPosition(x, y)) {
                    map.block(x, y)._passed = true;
                }
            });
        }
        RESystem.minimapData.setRefreshNeeded();
    }
}
