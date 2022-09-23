import { LEntity } from "ts/mr/lively/LEntity";

export class SAIHelper {
    // 左折の法則
    private static _movingPriority: number[][] = [
        /* 0 */ [],
        /* 1 */ [1, 2, 4, 3, 7],
        /* 2 */ [2, 3, 1, 6, 4],
        /* 3 */ [3, 6, 2, 9, 1],
        /* 4 */ [4, 1, 7, 2, 8],
        /* 5 */ [],
        /* 6 */ [6, 9, 3, 8, 2],
        /* 7 */ [7, 4, 8, 1, 9],
        /* 8 */ [8, 7, 9, 4, 6],
        /* 9 */ [9, 8, 6, 7, 3],
    ];

    private static axisToDirIndices = [8, 7, 4, 1, 2, 3, 6, 9];

    public static axisToDir(dx: number, dy: number): number {
        // Y-Down なので、イメージ的には ↓方向が 0(=1=Math.PI*2). 反時計回りが+
        let r = Math.atan2(dx, dy);
        r = (r + Math.PI) / (Math.PI*2.0);  // 1週を 0~1 にする。+PIしているので、↑が 0 になる。
        r += 1.0 / 16.0;
        let index = 0;
        if (0.0 < r && r < 1.0) index = Math.floor(r * 8);
        return this.axisToDirIndices[index];
        /*
        if (dx < 0) {   // Left
            if (dy < 0) { // Up
                return 7;
            }
            else if (dy > 0) { // Down
                return 1;
            }
            else {  // N
                return 4;
            }
        }
        else if (dx > 0) { // Right
            if (dy < 0) { // Up
                return 9;
            }
            else if (dy > 0) { // Down
                return 3;
            }
            else {  // N
                return 6;
            }
        }
        else {  // N
            if (dy < 0) { // Up
                return 8;
            }
            else if (dy > 0) { // Down
                return 2;
            }
            else {  // N
                return 0;
            }
        }
        */
    }

    public static distanceToDir(startX: number, startY: number, goalX: number, goalY: number): number {
        const dx = goalX - startX;
        const dy = goalY - startY;
        return this.axisToDir(dx, dy);
    }

    public static entityDistanceToDir(start: LEntity, target: LEntity): number {
        const dx = target.mx - start.mx;
        const dy = target.my - start.my;
        return this.axisToDir(dx, dy);
    }
}

