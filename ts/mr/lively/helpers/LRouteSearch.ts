import { LEntity } from "../LEntity";
import { LMap, MovingMethod } from "../LMap";
import { HMap } from "./HMap";
import { HMovement } from "./HMovement";

interface Node {
    parent: Node | null;
    x: number;
    y: number;
    g: number;  // 実コスト (=移動数。斜め移動の場合も1)
    f: number;  // 実コスト+隣接への移動コスト+nからゴールノードまでの移動コスト。なお、下記アルゴリズムでは隣接移動コストは常に 0 となっている
}

// https://ja.wikipedia.org/wiki/A*
// https://qiita.com/2dgames_jp/items/f29e915357c1decbc4b7
export class LRouteSearch {
    
    
    /** RMMZ の自動移動の検索処理 */
    public static findDirectionTo(map: LMap, entity: LEntity, startX: number, startY: number, goalX: number, goalY: number): number | undefined {
        const searchLimit = 12; // FIXME:
        const mapWidth = map.width();
        const nodeList: Node[] = [];
        const openList: number[] = [];
        const closedList: number[] = [];

        if (startX === goalX && startY === goalY) {
            return undefined;
        }

        const start: Node = {
            parent: null,
            x: startX,
            y: startY,
            g: 0,
            f: this.h(startX, startY, goalX, goalY),    // 距離というか、タイル数。 RMMZ だと、斜め移動が考慮されない。
        };
        let best = start;

        nodeList.push(start);
        openList.push(start.y * mapWidth + start.x);

        while (nodeList.length > 0) {
            // f(スコア?)が最も小さいものを探す
            let bestIndex = 0;
            for (let i = 0; i < nodeList.length; i++) {
                if (nodeList[i].f < nodeList[bestIndex].f) {
                    bestIndex = i;
                }
            }

            const current = nodeList[bestIndex];
            const x1 = current.x;
            const y1 = current.y;
            const pos1 = y1 * mapWidth + x1;
            const g1 = current.g;

            // Close 処理?
            // current を nodeList, openList から除外し、closedList に追加
            nodeList.splice(bestIndex, 1);
            openList.splice(openList.indexOf(pos1), 1);
            closedList.push(pos1);

            if (current.x === goalX && current.y === goalY) {
                best = current;
                break;
            }

            if (g1 >= searchLimit) {
                continue;
            }

            for (const direction of HMovement.directions8) {
                const x2 = this.xWithDirection(x1, direction);
                const y2 = this.yWithDirection(y1, direction);
                const pos2 = y2 * mapWidth + x2;

                if (closedList.includes(pos2)) {
                    continue;   // 既に通ったところだった
                }
                if (!this.canPass(map, entity, x1, y1, direction)) {
                    continue;   // current から direction 方向に移動できない
                }

                const g2 = g1 + 1;
                const index2 = openList.indexOf(pos2);

                if (index2 < 0 || g2 < nodeList[index2].g) {
                    let neighbor: Node;
                    if (index2 >= 0) {
                        neighbor = nodeList[index2];    // 既に OpenList にある場合は、そのノードの情報を更新する
                    } else {
                        neighbor = {parent: null, x: 0, y: 0, g: 0, f: 0};
                        nodeList.push(neighbor);
                        openList.push(pos2);
                    }
                    neighbor.parent = current;
                    neighbor.x = x2;
                    neighbor.y = y2;
                    neighbor.g = g2;
                    neighbor.f = g2 + this.h(x2, y2, goalX, goalY);
                    if (!best || neighbor.f - neighbor.g < best.f - best.g) {
                        best = neighbor;
                    }
                }
            }
        }

        // StartNode のひとつ前に戻るまで逆に辿る
        let node = best;
        while (node.parent && node.parent !== start) {
            node = node.parent;
        }

        return HMovement.offsetToDirection(node.x - start.x, node.y - start.y);

        // const deltaX1 = $gameMap.deltaX(node.x, start.x);
        // const deltaY1 = $gameMap.deltaY(node.y, start.y);
        // if (deltaY1 > 0) {
        //     return 2;
        // } else if (deltaX1 < 0) {
        //     return 4;
        // } else if (deltaX1 > 0) {
        //     return 6;
        // } else if (deltaY1 < 0) {
        //     return 8;
        // }

        // const deltaX2 = this.deltaXFrom(goalX);
        // const deltaY2 = this.deltaYFrom(goalY);
        // if (Math.abs(deltaX2) > Math.abs(deltaY2)) {
        //     return deltaX2 > 0 ? 4 : 6;
        // } else if (deltaY2 !== 0) {
        //     return deltaY2 > 0 ? 8 : 2;
        // }

        //return 0;
    }

    private static xWithDirection(x: number, d: number) {
        return x + HMovement.directionToOffset(d).x;
        //const x2 = $gameMap.roundXWithDirection(x1, direction);
    };
    
    private static yWithDirection(y: number, d: number) {
        return y + HMovement.directionToOffset(d).y;
        //const y2 = $gameMap.roundYWithDirection(y1, direction);
    };

    private static canPass(map: LMap, entity: LEntity, x: number, y: number, d: number): boolean {
        const block1 = map.block(x, y);
        const block2 = HMap.getFrontBlock(map, x, y, d);
        return HMovement.checkPassageBlockToBlock(entity, block1, block2, MovingMethod.Walk);
    }

    // チェビシェフ距離
    private static h(nodeX: number, nodeY: number, goalX: number, goalY: number): number {
        return Math.max(Math.abs(nodeX - goalX), Math.abs(nodeY - goalY));
    }
}
