import { assert } from "ts/Common";
import { FMapBuildPass } from "./FMapBuildPass";
import { FBlockComponent, FMap, FSector } from "./FMapData";



/**
 * [ランダムマップ用]
 * - 出口の位置を決め、そこからたどることができる Block にマークを付けていく。
 * - AI用の通路目的 Block を決める。 http://shiren2424.blog.fc2.com/blog-entry-119.html
 * 
 * プレイヤーの初期位置などはこのマークのある Block から選択することになる。
 * 
 * 侵入不可能な地形が確定した後に実行するのが望ましい。
 */
export class FMarkExitPointAndContinuationPass extends FMapBuildPass {
    public execute(map: FMap): void {
        const hasExitPoint = (map.exitPont() != undefined);

        const sector = this.selectExitPoint(map);

        // 部屋の入口 Block をマークする
        for (const sector of map.sectors()) {
            const room = sector.room();
            if (room) {
                for (let mx = room.x1(); mx <= room.x2(); mx++) {
                    // 上端
                    if (map.isValid(mx, room.y1() - 1) && map.block(mx, room.y1() - 1).component() == FBlockComponent.Passageway) {
                        map.block(mx, room.y1()).setDoorway(true);
                    }
                    // 下端
                    if (map.isValid(mx, room.y2() + 1) && map.block(mx, room.y2() + 1).component() == FBlockComponent.Passageway) {
                        map.block(mx, room.y2()).setDoorway(true);
                    }
                }
                for (let my = room.y1(); my <= room.y2(); my++) {
                    // 左端
                    if (map.isValid(room.x1() - 1, my) && map.block(room.x1() - 1, my).component() == FBlockComponent.Passageway) {
                        map.block(room.x1(), my).setDoorway(true);
                    }
                    // 右端
                    if (map.isValid(room.x2() + 1, my) && map.block(room.x2() + 1, my).component() == FBlockComponent.Passageway) {
                        map.block(room.x2(), my).setDoorway(true);
                    }
                }
            }
        }

        
        if (!hasExitPoint) {

        }
    }

    private selectExitPoint(map: FMap): FSector {
        const exitPoint = map.exitPont();
        if (exitPoint) {
            // 固定マップ。階段配置済み。
            const sector = map.sectors().find(s => s.contains(exitPoint.mx(), exitPoint.my()));
            assert(sector);
            return sector;
        }
        else {
            const sectors = map.sectors();
            assert(sectors.length > 0);
    
            const connectedSectors = sectors.filter(s => s.edges().find(e => e.hasConnection()));
            if (connectedSectors.length > 0) {
                // 別の Sector を接続された Sector があれば、それらを優先する。
                return connectedSectors[map.random().nextIntWithMax(connectedSectors.length)];
            }
            else {
                // 大部屋マップなど、接続が無いもの。
                return sectors[map.random().nextIntWithMax(sectors.length)];
            }
        }
    }
}

