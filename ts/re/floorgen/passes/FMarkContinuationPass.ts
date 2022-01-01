import { assert } from "ts/re/Common";
import { FMapBuildPass } from "./FMapBuildPass";
import { FBlockComponent, FEntryPont, FExitPont, FMap, FMapBlock, FSector } from "../FMapData";
import { DHelpers } from "ts/re/data/DHelper";
import { REData } from "ts/re/data/REData";
import { DAnnotationReader } from "ts/re/data/DAnnotationReader";
import { DEntityKind } from "ts/re/data/DEntityKind";



/**
 * [ランダムマップ・固定マップ用]
 * - 出口の位置を決め、そこからたどることができる Block にマークを付けていく。
 * - AI用の通路目的 Block を決める。 http://shiren2424.blog.fc2.com/blog-entry-119.html
 * 
 * プレイヤーの初期位置などはこのマークのある Block から選択することになる。
 * 
 * 侵入不可能な地形が確定した後に実行するのが望ましい。
 */
export class FMarkContinuationPass extends FMapBuildPass {
    public execute(map: FMap): void {

        // すべての部屋の入口 Block をマークする
        //for (const sector of map.sectors()) {
        //    const room = sector.room();
        for (const room of map.rooms()) {
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

        {
            // 最初に見つかった床 Block を開始点とする
            const baseBlock = this.selectFirstBlock(map);//room.blocks().find(b => b.component() == FBlockComponent.Room);
            assert(baseBlock);
            
            let current: FMapBlock[] = [baseBlock];
            let next: FMapBlock[] = [];
            while (current.length > 0) {
                current.forEach(b => {
                    if (!b.isContinuation()) {   // 上下左右の集計で、current に同じ Block が入ることがある。無駄な処理を省く。
                        // ID を振る
                        b.setContinuation(true);
    
                        // 左
                        const b1 = map.blockTry(b.x() - 1, b.y());
                        if (b1 && b1.isPassagableComponent() && !b1.isContinuation()) {
                            next.push(b1);
                        }
                        // 上
                        const b2 = map.blockTry(b.x(), b.y() - 1);
                        if (b2 && b2.isPassagableComponent() && !b2.isContinuation()) {
                            next.push(b2);
                        }
                        // 右
                        const b3 = map.blockTry(b.x() + 1, b.y());
                        if (b3 && b3.isPassagableComponent() && !b3.isContinuation()) {
                            next.push(b3);
                        }
                        // 下
                        const b4 = map.blockTry(b.x(), b.y() + 1);
                        if (b4 && b4.isPassagableComponent() && !b4.isContinuation()) {
                            next.push(b4);
                        }
                    }
                });

                // swap
                [current, next] = [next, current];
                next = [];
            }

            // roomBlocks[0] から辿れるすべての Block に ID を振り終えた
        }
    }

    private selectFirstBlock(map: FMap): FMapBlock {
        if (map.floorId().isRandomMap()) {
            // ランダムマップの場合は接続情報なども考慮し、
            // 埋蔵金部屋など独立した部屋を優先しないようにする

            const sectors = map.sectors();
            assert(sectors.length > 0);
    
            const connectedSectors = sectors.filter(s => s.edges().find(e => e.hasConnection()));
            let sector;
            if (connectedSectors.length > 0) {
                // 別の Sector を接続された Sector があれば、それらを優先する。
                sector = connectedSectors[map.random().nextIntWithMax(connectedSectors.length)];
            }
            else {
                // 大部屋マップなど、接続が無いもの。
                sector = sectors[map.random().nextIntWithMax(sectors.length)];
            }
            
            const room = sector.room();
            assert(room);
            const block = room.blocks().find(b => b.component() == FBlockComponent.Room);
            assert(block);
            return block;
        }
        else {
            // 固定マップの場合、EntryPoint を基準とする
            const entryPointEvent = map.rmmzFixedMapData().events.find(e => {
                if (!e) return false;
                const metadata = DAnnotationReader.readEntityMetadataFromPage(e.pages[0]);
                if (!metadata) return false;
                const entity = REData.findEntity(metadata.data);
                if (!entity) return false;
                return DEntityKind.isEntryPoint(entity);
            });
            
            if (entryPointEvent) {
                // FIXME: ここでついでにやっちゃうのはあまりよくない気がするが…
                map.setEntryPont(new FEntryPont(entryPointEvent.x, entryPointEvent.y));

                return map.block(entryPointEvent.x, entryPointEvent.y);
            }
            else {
                throw new Error(`"RE-SystemPrefab:EntryPoint" not found. (in ${DHelpers.makeRmmzMapDebugName(map.floorId().rmmzFixedMapId())})`);
            }
        }
    }
}

