import { assert } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { RoomEventArgs } from "ts/re/data/predefineds/DBasicEvents";
import { REGame } from "ts/re/objects/REGame";
import { LBlock } from "ts/re/objects/LBlock";
import { LEntity } from "ts/re/objects/LEntity";
import { LMap, MovingMethod } from "ts/re/objects/LMap";
import { Helpers } from "../system/Helpers";
import { RESystem } from "../system/RESystem";
import { LRandom } from "ts/re/objects/LRandom";
import { UBlock } from "ts/re/usecases/UBlock";
import { SCommandContext } from "../system/SCommandContext";
import { DBlockLayerKind } from "../data/DCommon";
import { LRoom } from "../objects/LRoom";

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

export class UMovement {
    // 8 を基準に時計回り
    private static readonly _edgeOffsetTable: number[] = [
        0,
        5, 4, 3,
        6, 0, 2,
        7, 0, 1,
    ];

    // 左折の法則のオフセット
    // http://twist.jpn.org/sfcsiren/index.php?%E3%83%A2%E3%83%B3%E3%82%B9%E3%82%BF%E3%83%BC%E3%81%AE%E8%A1%8C%E5%8B%95%E3%82%A2%E3%83%AB%E3%82%B4%E3%83%AA%E3%82%BA%E3%83%A0#zd804a50
    private static readonly LHRuleOffsets: SPoint[] = [
        { x: 0, y: -1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
    ];

    // 正面3方向用オフセット
    private static readonly way3Offsets: SPoint[] = [
        { x: 0, y: -1 }, { x: -1, y: -1 }, { x: 1, y: -1 }
    ];

    public static directions: number[] = [
        1, 2, 3, 4, 6, 7, 8, 9,
    ];

    public static adjacent8Offsets: number[][] = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1],
    ];

    public static distanceSq(x1: number, y1: number, x2: number, y2: number): number {
        const x = x1 - x2;
        const y = y1 - y2;
        return (x * x) + (y * y);
    }

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
     * 2 つの Entity が隣接しているか確認する
     */
    public static checkAdjacentEntities(entity1: LEntity, entity2: LEntity): boolean {
        return (Math.abs(entity1.x - entity2.x) <= 1 && Math.abs(entity1.y - entity2.y) <= 1);
    }
    

    /**
     * 2つの 座標 が隣接しているかどうか
     */
     public static checkAdjacentPositions(x1: number, y1: number, x2: number, y2: number): boolean {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
    }

    /**
     * 2つの Entity が隣接しているかどうか
     */
    public static checkEntityAdjacent(e1: LEntity, e2: LEntity): boolean {
        const dx = e1.x - e2.x;
        const dy = e1.y - e2.y;
        return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
    }

    /**
     * 2つの Entity が直接隣接しているかどうか (壁角を挟んだ斜めは隣接とみなさない)
     */
    public static checkDirectlyAdjacentEntity(e1: LEntity, e2: LEntity): boolean {
        const d = this.getLookAtDir(e1, e2)
        if (this.checkDiagonalWallCornerCrossing(e1, d)) return false;
        return this.checkEntityAdjacent(e1, e2);
    }

    /**
     * entity が指定方向(斜め)を向くとき、壁の角と交差しているかを確認する。
     */
    public static checkDiagonalWallCornerCrossing(entity: LEntity, d: number): boolean {
        const map = REGame.map;
        if (UMovement.isDiagonalMoving(d)) {
            // 斜め場合
            const fl = UMovement.rotatePositionByDir(7, d);  // 左前
            const fr = UMovement.rotatePositionByDir(9, d);  // 右前
            const flBlock = map.block(entity.x + fl.x, entity.y + fl.y);
            const frBlock = map.block(entity.x + fr.x, entity.y + fr.y);
            if (flBlock.isWallLikeShape()) return true;
            if (frBlock.isWallLikeShape()) return true;
            return false;
        }
        else {
            // 平行の場合
            return false;
        }
    }

    /**
     * entity が指定した方向に歩行移動できるかを確認する。
     */
    public static checkPassageToDir(entity: LEntity, dir: number): boolean {
        const offset = Helpers.dirToTileOffset(dir);
        const map = REGame.map;
        const oldBlock = map.block(entity.x, entity.y);
        const newBlock = map.block(entity.x + offset.x, entity.y + offset.y);
        return this.checkPassageBlockToBlock(entity, oldBlock, newBlock, MovingMethod.Walk);
    }
    
    /**
     * entity が指定した隣接位置へ移動できるかを確認する。
     */
    /*
    public static checkPassageToAdjacent(entity: LEntity, mx: number, my: number): boolean {
        const map = REGame.map;
        const oldBlock = map.block(entity.x, entity.y);
        const newBlock = map.block(mx, my);
        return this.checkPassageBlockToBlock(entity, oldBlock, newBlock, MovingMethod.Walk);
    }
    */
    
    /**
     * entity が oldBlock から newBlock へ "歩行" 移動できるか判定する。
     * 
     * 地形および Block 性質を判断材料とする点に注意。 (Block 種類及び Block 性質と、Entity 性質の確認)
     * 状態異常などによる移動制限は Behavior など他で行う。
     * 
     * 移動可否は entity や Block の性質を考慮する。
     * 例えば entity が水路侵入可能であり、Block が水路であれば移動先候補になる。
     */
    public static checkPassageBlockToBlock(entity: LEntity, oldBlock: LBlock, newBlock: LBlock, method: MovingMethod, layer?: DBlockLayerKind): boolean {
        const map = REGame.map;
        const actualLayer = layer || entity.getHomeLayer();

        const dx = newBlock.x() - oldBlock.x();
        const dy = newBlock.y() - oldBlock.y();

        if (Math.abs(dx) > 1) return false; // 隣接 Block への移動ではない
        if (Math.abs(dy) > 1) return false; // 隣接 Block への移動ではない

        if (!map.canLeaving(oldBlock, entity)) return false;
        if (!map.canWalkEntering(newBlock, entity, method, actualLayer)) return false;

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


    /**
     * base が target を向く時の方向を計算する
     */
    public static getLookAtDir(base: LEntity, target: LEntity): number {
        const dx = target.x - base.x;
        const dy = target.y - base.y;
        return Helpers.offsetToDir(dx, dy);
    }

    /**
     * base が target を向く時の方向を計算する
     */
     public static getLookAtDirFromPos(baseX: number, baseY: number, targetX: number, targetY: number): number {
        return Helpers.offsetToDir(targetX - baseX, targetY - baseY);
    }

    /**
     * 重心を取得する
     */
    public static getCenter(entities: LEntity[]): SPoint {
        let x = 0;
        let y = 0;
        for (const e of entities) {
            x += e.x;
            y += e.y;
        }
        return {x: Math.floor(x / entities.length), y: Math.floor(y / entities.length)};
    }

    /**
     * 重心を取得する
     */
    public static getCenterOfRoom(room: LRoom): SPoint {
        const x = (room.x1() + room.x2()) / 2;
        const y = (room.y1() + room.y2()) / 2;
        return {x: Math.floor(x), y: Math.floor(y )};
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
     * Entity に隣接する指定した方向にある Block を取得する。
     * @param entity 
     * @param dir 
     * @returns 
     */
    static getAdjacentBlock(entity: LEntity, dir: number): LBlock {
        const offset = Helpers._dirToTileOffsetTable[dir];
        const block = REGame.map.block(entity.x + offset.x, entity.y + offset.y);
        return block;
    }

    /**
     * Entity の正面の Block を取得する
     */
    public static getFrontBlock(entity: LEntity): LBlock {
        const front = Helpers.makeEntityFrontPosition(entity, 1);
        const block = REGame.map.block(front.x, front.y);
        return block;
    }

    /**
     * Entity の周囲 8 マスの Block を取得する。(有効座標のみ)
     */
    public static getAdjacentBlocks(entity: LEntity): LBlock[] {
        const map = REGame.map;
        assert(map.floorId().equals(entity.floorId));

        const blocks: LBlock[] = [];
        for (const offset of this.adjacent8Offsets) {
            const x = entity.x + offset[0];
            const y = entity.y + offset[1];
            if (map.isValidPosition(x, y)) {
                blocks.push(map.block(x, y));
            }
        }
        return blocks;
    }

    /**
     * Entity の周囲 8 マスの隣接 Entity を取得する。
     * layerKind を指定すると、そのレイヤーだけ取得する。
     * 足元は取得しない。
     * 単純に列挙するだけで、通行判定や攻撃可能判定は行わない。
     */
    public static getAdjacentEntities(entity: LEntity, layerKind?: DBlockLayerKind): LEntity[] {
        const result: LEntity[] = [];
        for (const block of this.getAdjacentBlocks(entity)) {
            for (const entity of block.getEntities()) {
                result.push(entity);
            }
        }
        return result;
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
            const e = map.block(mx, my).aliveEntity(DBlockLayerKind.Unit);
            if (e) {
                return d;
            }
            d = this.getNextDirCW(d);
        }
        return entity.dir;
    }

    /**
     * 左折の法則に従い、移動候補にできる Block を優先度順に取得する。
     */
    public static getMovingCandidateBlockAsLHRule(entity: LEntity, dir: number): LBlock | undefined {
        /*
        const result: LBlock[] = [];
        for (const offset of this.LHRuleOffsets) {
            const pos = this.transformRotationBlock(offset.x, offset.y, entity.dir);
            const block = REGame.map.tryGetBlock(pos.x, pos.y);
            if (block) result.push(block);
        }
        */
        const map = REGame.map;
        const oldBlock = map.block(entity.x, entity.y);
        for (const offset of this.LHRuleOffsets) {
            const pos = this.transformRotationBlock(offset.x, offset.y, dir);
            const block = map.tryGetBlock(entity.x + pos.x, entity.y + pos.y);
            if (block && this.checkPassageBlockToBlock(entity, oldBlock, block, MovingMethod.Walk)) {
                return block;
            }
        }
        return undefined;
    }

    /**
     * dir 方向の正面 3 Block を取得する。
     */
    public static getWay3FrontBlocks(entity: LEntity, dir: number): LBlock[] {
        const result = [];
        const map = REGame.map;
        for (const offset of this.way3Offsets) {
            const pos = this.transformRotationBlock(offset.x, offset.y, dir);
            const block = map.tryGetBlock(entity.x + pos.x, entity.y + pos.y);
            if (block) {
                result.push(block);
            }
        }
        return result;
    }
    

    /**
     * "移動" できる隣接 Block を取得する
     */
    public static getMovableAdjacentTiles(entity: LEntity): LBlock[] {
        const result: LBlock[] = [];
        const map = REGame.map;
        const oldBlock = map.block(entity.x, entity.y);
        for (const d of this.AdjacentDirs) {
            const offset = Helpers.dirToTileOffset(d);
            const block = map.tryGetBlock(entity.x + offset.x, entity.y + offset.y);
            if (block && this.checkPassageBlockToBlock(entity, oldBlock, block, MovingMethod.Walk)) {
                result.push(block);
            }
        }
        return result;
    }
    private static AdjacentDirs: number[] = [1, 2, 3, 4, 6, 7, 8 ,9];

    /** entity を配置できる直近の Block を選択する。 */
    public static selectNearbyLocatableBlock(rand: LRandom, mx: number, my: number, layerKind: DBlockLayerKind, entity: LEntity): LBlock | undefined {
        const maxDistance = 3;
        for (let distance = 0; distance <= maxDistance; distance++) {
            const candidates = REGame.map.getEdgeBlocks(mx, my, distance)
                .filter(b => {
                    const layer = b.layer(layerKind);
                    if (layer.isContainsAnyEntity())   // 既に何か Entity がいる？
                        if (layer.entityIds().length == 1 && layer.entityIds()[0].equals(entity.entityId()))
                            return true;    // それが自分自身であれば配置はできることにする。再Drop とかで使いたい。
                        else
                            return false;
                    else
                        return true;
                });
            if (candidates.length > 0) {
                return rand.select(candidates);
            }
        }
        return undefined;
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

    public static rotateDir(localDir: number, dir: number): number {
        const localPos = Helpers.dirToTileOffset(localDir);
        const pos = this.transformRotationBlock(localPos.x, localPos.y, dir);
        return Helpers.offsetToDir(pos.x, pos.y);
    }

    public static checkDashStopBlock(entity: LEntity): boolean {
        const x = entity.x;
        const y = entity.y;
        const map = REGame.map;
        const front = Helpers.dirToTileOffset(entity.dir);
        const block = map.block(x, y);
        const frontBlock = map.block(x + front.x, y + front.y);
        if (!this.checkPassageBlockToBlock(entity, block, frontBlock, MovingMethod.Walk)) return false;    // そもそも Block 間の移動ができない
        if (block.layer(DBlockLayerKind.Ground).isContainsAnyEntity()) return false;     // 足元に何かしらある場合はダッシュ停止
        if (block._roomId != frontBlock._roomId) return false;                          // 部屋と部屋や、部屋と通路の境界

        if (UBlock.adjacentBlocks8XY(map, x, y).find(b => b.layer(DBlockLayerKind.Unit).isContainsAnyEntity() || b.layer(DBlockLayerKind.Ground).isContainsAnyEntity())) return false;

        if (block.isPassageway()) {
            const back = Helpers.dirToTileOffset(this.reverseDir(entity.dir));
            const count1 = UBlock.adjacentBlocks4(map, x + back.x, y + back.y).filter(b => b.isFloorLikeShape()).length;
            const count2 = UBlock.adjacentBlocks4(map, x, y).filter(b => b.isFloorLikeShape()).length;
            if (count1 < count2) return false;
        }
        else {
            if (block.isDoorway()) return false;
        }

        return true;
    }

    public static moveEntity(context: SCommandContext, entity: LEntity, x: number, y: number, method: MovingMethod, toLayer: DBlockLayerKind): boolean {
        const map = REGame.map;

        assert(entity.floorId.equals(map.floorId()));

        if (!map.isValidPosition(x, y)) {
            return false;   // マップ外への移動
        }
        
        const oldBlock = map.block(entity.x, entity.y);
        const newBlock = map.block(x, y);

        if (this.checkPassageBlockToBlock(entity, oldBlock, newBlock, method, toLayer)) {
            assert(oldBlock.removeEntity(entity));
            entity.x = x;
            entity.y = y;
            newBlock.addEntity(toLayer, entity);
            this._postLocate(entity, oldBlock, newBlock, map, context);
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
    public static locateEntity(entity: LEntity, x: number, y: number, toLayer?: DBlockLayerKind): void {
        const map = REGame.map;
        assert(entity.floorId.equals(map.floorId()));

        const oldBlock = map.block(entity.x, entity.y);
        const newBlock = map.block(x, y);
        
        const layer = (toLayer) ? toLayer : entity.getHomeLayer();

        oldBlock.removeEntity(entity);
        entity.x = x;
        entity.y = y;
        newBlock.addEntity(layer, entity);
        this._postLocate(entity, oldBlock, newBlock, map, undefined);
    }
    
    private static _postLocate(entity: LEntity, oldBlock: LBlock, newBlock: LBlock, map: LMap, context: SCommandContext | undefined) {
        if (REGame.camera.focusedEntityId().equals(entity.entityId())) {
            this.markPassed(map, newBlock);
        }

        if (context) {
            if (oldBlock._roomId != newBlock._roomId) {
                const args: RoomEventArgs = {
                    entity: entity,
                    newRoomId: newBlock._roomId,
                    oldRoomId: oldBlock._roomId,
                };
            
                REGame.eventServer.publish(context, REBasics.events.roomEnterd, args);
                REGame.eventServer.publish(context, REBasics.events.roomLeaved, args);
            }
        }

        entity._located = true;
    }

    private static markPassed(map: LMap, block: LBlock): void {
        block._passed = true;
        if (block._roomId > 0) {
            const room = map.room(block._roomId);
            room.forEachBlocks(b => b._passed = true);
            room.forEachEdgeBlocks(b => b._passed = true);
        }
        else {
            // 通路なら外周1タイルを通過済みにする
            this.adjacent8Offsets.forEach(offset => {
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
