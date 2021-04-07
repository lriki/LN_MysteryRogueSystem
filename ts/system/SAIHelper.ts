import { REGame } from "ts/objects/REGame";
import { LEntity } from "ts/objects/LEntity";
import { LMap } from "ts/objects/LMap";
import { Helpers } from "./Helpers";
import { RESystem } from "./RESystem";

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

    public static axisToDir(dx: number, dy: number): number {
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
    }

    public static distanceToDir(startX: number, startY: number, goalX: number, goalY: number): number {
        const dx = goalX - startX;
        const dy = goalY - startY;
        return this.axisToDir(dx, dy);
    }

    public static entityDistanceToDir(start: LEntity, target: LEntity): number {
        const dx = target.x - start.x;
        const dy = target.y - start.y;
        return this.axisToDir(dx, dy);
    }

    public static findDirectionTo(entity: LEntity, startX: number, startY: number, goalX: number, goalY: number): number {
        const dx = goalX - startX;
        const dy = goalY - startY;
        const dir = this.axisToDir(dx, dy);
        if (dir == 0) return 0;

        const layer = entity.queryProperty(RESystem.properties.homeLayer);

        // 移動優先方向に従って、移動可能先方向を求める
        const priorities = this._movingPriority[dir];
        const dstDir = priorities.find(d => {
            const offset = Helpers.dirToTileOffset(d);
            const block = REGame.map.block(startX + offset.x, startY + offset.y);
            return REGame.map.checkPassage(entity, d, layer);
        });
        if (!dstDir) return 0;
        // NOTE: http://twist.jpn.org/sfcsiren/index.php?%E3%83%A2%E3%83%B3%E3%82%B9%E3%82%BF%E3%83%BC%E3%81%AE%E8%A1%8C%E5%8B%95%E3%82%A2%E3%83%AB%E3%82%B4%E3%83%AA%E3%82%BA%E3%83%A0
        // ここの「目的地に向かう移動」の上下優先としては正しくない。というか未実装。

        return dstDir;
    }
}

