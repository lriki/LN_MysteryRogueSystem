import { assert } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import { RoomEventArgs } from "ts/mr/data/predefineds/DBasicEvents";
import { MRLively } from "ts/mr/lively/MRLively";
import { LBlock } from "ts/mr/lively/LBlock";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { LMap, MovingMethod } from "ts/mr/lively/LMap";
import { Helpers } from "../system/Helpers";
import { MRSystem } from "../system/MRSystem";
import { LRandom } from "ts/mr/lively/LRandom";
import { UBlock } from "ts/mr/utility/UBlock";
import { SCommandContext } from "../system/SCommandContext";
import { DBlockLayerKind } from "../data/DCommon";
import { LRoom } from "../lively/LRoom";
import { SPoint } from "./UCommon";
import { LFloorId } from "../lively/LFloorId";
import { paramDefaultVisibiltyLength } from "../PluginParameters";
import { HMovement } from "../lively/helpers/HMovement";
import { LDashType } from "../lively/activities/LActivity";


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
     * 2 つの Entity が隣接しているか確認する
     */
    public static checkAdjacentEntities(entity1: LEntity, entity2: LEntity): boolean {
        return (Math.abs(entity1.mx - entity2.mx) <= 1 && Math.abs(entity1.my - entity2.my) <= 1);
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
        const dx = e1.mx - e2.mx;
        const dy = e1.my - e2.my;
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
        const map = MRLively.mapView.currentMap;
        if (HMovement.isDiagonalMoving(d)) {
            // 斜め場合
            const fl = HMovement.rotatePositionByDir(7, d);  // 左前
            const fr = HMovement.rotatePositionByDir(9, d);  // 右前
            const flBlock = map.block(entity.mx + fl.x, entity.my + fl.y);
            const frBlock = map.block(entity.mx + fr.x, entity.my + fr.y);
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
        const map = MRLively.mapView.currentMap;
        const oldBlock = map.block(entity.mx, entity.my);
        const newBlock = map.block(entity.mx + offset.x, entity.my + offset.y);
        return HMovement.checkPassageBlockToBlock(entity, oldBlock, newBlock, MovingMethod.Walk);
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
     * base が target を向く時の方向を計算する
     */
    public static getLookAtDir(base: LEntity, target: LEntity): number {
        const dx = target.mx - base.mx;
        const dy = target.my - base.my;
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
            x += e.mx;
            y += e.my;
        }
        return {x: Math.floor(x / entities.length), y: Math.floor(y / entities.length)};
    }

    /**
     * 重心を取得する
     */
    public static getCenterOfRoom(room: LRoom): SPoint {
        const x = (room.mx1 + room.mx2) / 2;
        const y = (room.my1 + room.my2) / 2;
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
     * 方向 d に対する右手方向を求める
     */
    public static getRightDir(d: number): number {
        return this.getNextDirCW(this.getNextDirCW(d));
    }
    
    /**
     * Entity に隣接する指定した方向にある Block を取得する。
     * @param entity 
     * @param dir 
     * @returns 
     */
    static getAdjacentBlock(entity: LEntity, dir: number): LBlock {
        const offset = Helpers._dirToTileOffsetTable[dir];
        const block = MRLively.mapView.currentMap.block(entity.mx + offset.x, entity.my + offset.y);
        return block;
    }

    /**
     * Entity の正面の Block を取得する
     */
    public static getFrontBlock(entity: LEntity): LBlock {
        const front = Helpers.makeEntityFrontPosition(entity, 1);
        const block = MRLively.mapView.currentMap.block(front.x, front.y);
        return block;
    }

    /**
     * Entity の周囲 8 マスの Block を取得する。(有効座標のみ)
     */
    public static getAdjacentBlocks(entity: LEntity): LBlock[] {
        const map = MRLively.mapView.currentMap;
        assert(map.floorId().equals(entity.floorId));

        const blocks: LBlock[] = [];
        for (const offset of this.adjacent8Offsets) {
            const x = entity.mx + offset[0];
            const y = entity.my + offset[1];
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
        const map = MRLively.mapView.currentMap;
        let d = entity.dir;
        for (let i = 0; i < 9; i++) {
            const offset = Helpers.dirToTileOffset(d);
            const mx = entity.mx + offset.x;
            const my = entity.my + offset.y;
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
        const map = MRLively.mapView.currentMap;
        const oldBlock = map.block(entity.mx, entity.my);
        for (const offset of this.LHRuleOffsets) {
            const pos = HMovement.transformRotationBlock(offset.x, offset.y, dir);
            const block = map.tryGetBlock(entity.mx + pos.x, entity.my + pos.y);
            if (block && HMovement.checkPassageBlockToBlock(entity, oldBlock, block, MovingMethod.Walk)) {
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
        const map = MRLively.mapView.currentMap;
        for (const offset of this.way3Offsets) {
            const pos = HMovement.transformRotationBlock(offset.x, offset.y, dir);
            const block = map.tryGetBlock(entity.mx + pos.x, entity.my + pos.y);
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
        const map = MRLively.mapView.currentMap;
        const oldBlock = map.block(entity.mx, entity.my);
        for (const d of this.AdjacentDirs) {
            const offset = Helpers.dirToTileOffset(d);
            const block = map.tryGetBlock(entity.mx + offset.x, entity.my + offset.y);
            if (block && HMovement.checkPassageBlockToBlock(entity, oldBlock, block, MovingMethod.Walk)) {
                result.push(block);
            }
        }
        return result;
    }
    private static AdjacentDirs: number[] = [1, 2, 3, 4, 6, 7, 8 ,9];

    /** entity を配置できる直近の Block を選択する。 */
    public static selectNearbyLocatableBlock(map: LMap, rand: LRandom, mx: number, my: number, layerKind: DBlockLayerKind, entity: LEntity): LBlock | undefined {
        const maxDistance = 3;
        for (let distance = 0; distance <= maxDistance; distance++) {
            const candidates = map.getEdgeBlocks(mx, my, distance)
                .filter(b => {
                    if (b.isWallLikeShape()) {
                        // 壁の中には落ちない
                        return false;
                    }

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



    public static rotateDir(localDir: number, dir: number): number {
        const localPos = Helpers.dirToTileOffset(localDir);
        const pos = HMovement.transformRotationBlock(localPos.x, localPos.y, dir);
        return Helpers.offsetToDir(pos.x, pos.y);
    }

    public static checkDashStopBlock(entity: LEntity, dir: number, type: LDashType): boolean {
        const x = entity.mx;
        const y = entity.my;
        const map = MRLively.mapView.currentMap;
        const front = Helpers.dirToTileOffset(dir);
        const block = map.block(x, y);
        const frontBlock = map.block(x + front.x, y + front.y);
        if (!HMovement.checkPassageBlockToBlock(entity, block, frontBlock, MovingMethod.Walk)) return false;    // そもそも Block 間の移動ができない

        //if (type == LDashType.StraightDash) {
            if (block.layer(DBlockLayerKind.Ground).isContainsAnyEntity()) return false;     // 足元に何かしらある場合はダッシュ停止
        // }
        // else {

        // }

        if (block._roomId != frontBlock._roomId) return false;                          // 部屋と部屋や、部屋と通路の境界

        // 周辺ブロックのチェック
        if (type == LDashType.StraightDash) {
            if (UBlock.adjacentBlocks8XY(map, x, y).find(b => b.layer(DBlockLayerKind.Unit).isContainsAnyEntity() || b.layer(DBlockLayerKind.Ground).isContainsAnyEntity())) return false;
        }

        if (block.isPassageway()) {
            const back = Helpers.dirToTileOffset(this.reverseDir(dir));
            const count1 = UBlock.adjacentBlocks4(map, x + back.x, y + back.y).filter(b => b.isFloorLikeShape()).length;
            const count2 = UBlock.adjacentBlocks4(map, x, y).filter(b => b.isFloorLikeShape()).length;
            if (count1 < count2) return false;
        }
        else {
            if (block.isRoomInnerEntrance()) return false;
        }

        return true;
    }

    public static moveEntity(cctx: SCommandContext, entity: LEntity, x: number, y: number, method: MovingMethod, toLayer: DBlockLayerKind): boolean {
        const map = MRLively.mapView.currentMap;

        assert(entity.floorId.equals(map.floorId()));

        if (!map.isValidPosition(x, y)) {
            return false;   // マップ外への移動
        }
        
        const oldBlock = map.block(entity.mx, entity.my);
        const newBlock = map.block(x, y);

        if (HMovement.checkPassageBlockToBlock(entity, oldBlock, newBlock, method, toLayer)) {
            assert(oldBlock.removeEntity(entity));
            entity.mx = x;
            entity.my = y;
            newBlock.addEntity(toLayer, entity);
            this._postLocate(entity, oldBlock, newBlock, map, cctx);
            return true;
        }
        else {
            return false;
        }
    }
    
    
    public static locateEntityAtFloorMoved(entity: LEntity, floorId: LFloorId, x: number, y: number): void {
        entity.floorId = floorId.clone();
        entity.mx = x;
        entity.my = y;
    }

    public static _postLocate(entity: LEntity, oldBlock: LBlock | undefined, newBlock: LBlock, map: LMap, cctx: SCommandContext | undefined) {
        assert(!entity.isOnOffstage());

        newBlock.setFootpoint(entity);
        
        if (MRLively.mapView.focusedEntityId().equals(entity.entityId())) {
            MRSystem.fovSystem.markBlockPlayerPassed(map, newBlock.mx, newBlock.my);
        }

        if (oldBlock && cctx) {
            if (oldBlock._roomId != newBlock._roomId) {
                const args: RoomEventArgs = {
                    entity: entity,
                    newRoomId: newBlock._roomId,
                    oldRoomId: oldBlock._roomId,
                };
            
                MRLively.eventServer.publish(cctx, MRBasics.events.roomEnterd, args);
                MRLively.eventServer.publish(cctx, MRBasics.events.roomLeaved, args);
            }
        }

        entity._located = true;
    }
}
