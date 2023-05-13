import { LEntity } from "../entity/LEntity";

export class HDimension {
    /**
     * 2点間の距離 (到達に必要な移動ブロック数) を求める。
     * 斜め移動を許可している Block 単位の距離なので、マンハッタン距離やユークリッド距離とは違う点に注意。
     */
    public static getMoveDistance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        return Math.max(dx, dy);
    }
    public static getMoveDistanceEntites(entity1: LEntity, entity2: LEntity): number {
        return this.getMoveDistance(entity1.mx, entity1.my, entity2.mx, entity2.my);
    }
}