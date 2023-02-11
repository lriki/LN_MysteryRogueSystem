import { assert } from "ts/mr/Common";
import { DBlockLayerKind } from "ts/mr/data/DCommon";
import { LBlock } from "../LBlock";
import { LEntity } from "../LEntity";
import { LMap, MovingMethod } from "../LMap";
import { MRLively } from "../MRLively";

interface Point {
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


export class HMovement {
    public static readonly directions8 = [1, 2, 3, 4, 6, 7, 8, 9];

    public static readonly directionOffset: number[][] = [
        [0, 0],
        [-1, 1], [0, 1], [1, 1],
        [-1, 0], [0, 0], [1, 0],
        [-1, -1], [0, -1], [1, -1],
    ];

    public static readonly adjacent8Offsets: number[][] = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1],
    ];

    // 8 を基準に時計回り
    private static readonly _edgeOffsetTable: number[] = [
        0,
        5, 4, 3,
        6, 0, 2,
        7, 0, 1,
    ];

    public static directionToOffset(d: number): Point {
        return { x: this.directionOffset[d][0], y: this.directionOffset[d][1] };
    }

    /**
     * 座標オフセットを向きに変換する
     */
    public static offsetToDirectionSafety(offsetX: number, offsetY: number): number {
        return this.offsetToDirection(offsetX, offsetY) || 2;
    }
    
    /**
     * 座標オフセットを向きに変換する
     */
    public static offsetToDirection(offsetX: number, offsetY: number): number | undefined {
        if (offsetX == 0) {
            if (offsetY == 0) {
                return undefined;
            }
            else if (offsetY > 0) {
                return 2;
            }
            else {  // if (offsetY < 0)
                return 8;
            }
        }
        else if (offsetX > 0) {
            if (offsetY == 0) {
                return 6;
            }
            else if (offsetY > 0) {
                return 3;
            }
            else {  // if (offsetY < 0)
                return 9;
            }
        }
        else {  // if (offsetX < 0)
            if (offsetY == 0) {
                return 4;
            }
            else if (offsetY > 0) {
                return 1;
            }
            else {  // if (offsetY < 0)
                return 7;
            }
        }
    }

    // 2点間の距離 (到達に必要な移動ブロック数) を求める。
    // 斜め移動を許可している Block 単位の距離なので、マンハッタン距離やユークリッド距離とは違う点に注意。
    /** @deprecated LBlockHelper */
    public static blockDistance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        return Math.max(dx, dy);
    }

    /**
     * 指定した向きが斜め方向であるかを判断する
     */
    public static isDiagonalMoving(d: number): boolean {
        return (d % 2) != 0;
    }

    /**
     * 8(↑) 方向を基準としたローカル座標を、dir 方向に回転させたときのローカル座標を求める。
     * （ローカル座標は、座標の代わりに向きを指定）
     */
    public static rotatePositionByDir(localDir: number, dir: number): Point {
        const localPos = this.directionToOffset(localDir);
        return this.transformRotationBlock(localPos.x, localPos.y, dir);
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
    public static transformRotationBlock(localX: number, localY: number, dir: number): Point {
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
                x: this.directionToOffset(7).x * distance,
                y: this.directionToOffset(7).y * distance,
                forwardX: 1,
                forwardY: 0,
                beginOffset: 0 * edgeLength,
                endOffset: 1 * edgeLength,
            },
            {
                x: this.directionToOffset(9).x * distance,
                y: this.directionToOffset(9).y * distance,
                forwardX: 0,
                forwardY: 1,
                beginOffset: 1 * edgeLength,
                endOffset: 2 * edgeLength,
            },
            {
                x: this.directionToOffset(3).x * distance,
                y: this.directionToOffset(3).y * distance,
                forwardX: -1,
                forwardY: 0,
                beginOffset: 2 * edgeLength,
                endOffset: 3 * edgeLength,
            },
            {
                x: this.directionToOffset(1).x * distance,
                y: this.directionToOffset(1).y * distance,
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
     * entity が oldBlock から newBlock へ "歩行" 移動できるか判定する。
     * 
     * 地形および Block 性質を判断材料とする点に注意。 (Block 種類及び Block 性質と、Entity 性質の確認)
     * 状態異常などによる移動制限は Behavior など他で行う。
     * 
     * 移動可否は entity や Block の性質を考慮する。
     * 例えば entity が水路侵入可能であり、Block が水路であれば移動先候補になる。
     */
    public static checkPassageBlockToBlock(entity: LEntity, oldBlock: LBlock, newBlock: LBlock, method: MovingMethod, layer?: DBlockLayerKind): boolean {
        const map = MRLively.mapView.currentMap;
        const actualLayer = layer || entity.getHomeLayer();

        const dx = newBlock.mx - oldBlock.mx;
        const dy = newBlock.my - oldBlock.my;

        if (Math.abs(dx) > 1) return false; // 隣接 Block への移動ではない
        if (Math.abs(dy) > 1) return false; // 隣接 Block への移動ではない

        if (layer == DBlockLayerKind.Projectile) {  
            // 矢の罠など、壁Blockを移動開始地点とする場合に備える。
            // この場合は移動先への侵入判定のみ行い、斜め移動のエッジ判定は不要。
            if (!map.canMoveEntering(newBlock, entity, method, actualLayer)) return false;
        }
        else {
            if (!map.canLeaving(oldBlock, entity)) return false;
            if (!map.canMoveEntering(newBlock, entity, method, actualLayer)) return false;

            const d = this.offsetToDirectionSafety(dx, dy);
            if (this.isDiagonalMoving(d)) {
                // 斜め移動の場合
                const fl = this.rotatePositionByDir(7, d);  // 左前
                const fr = this.rotatePositionByDir(9, d);  // 右前
                const flBlock = map.block(entity.mx + fl.x, entity.my + fl.y);
                const frBlock = map.block(entity.mx + fr.x, entity.my + fr.y);
                if (flBlock.isWallLikeShape()) return false;    // 壁があるので移動できない
                if (frBlock.isWallLikeShape()) return false;    // 壁があるので移動できない
            }
            else {
                // 平行移動の場合
            }
        }

        return true;
    }



}
