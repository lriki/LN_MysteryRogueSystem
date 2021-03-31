import { assert } from "ts/Common";
import { TileKind } from "ts/objects/REGame_Block";
import { REGame_Map } from "ts/objects/REGame_Map";
import { FBlockComponent, FMap, FMapBlock } from "./FMapData";
import { FMonsterHouseStructure } from "./FStructure";


export class FMapBuilder {

    public buildForFixedMap(data: FMap): void {
        const passes = [
            new FMapBuildPass_MakeRoomId(),
            new FMapBuildPass_ResolveRoomShapes(),
            new FMapBuildPass_MarkMonsterHouse(),
        ];
        // Apply passes
        passes.forEach(pass => pass.execute(data));
    }

    
}

export abstract class FMapBuildPass {
    public abstract execute(map: FMap): void;
}

// Room としてマークされているが、RoomId 未割り当ての Block を解決する。
// 主に固定マップ用。
export class FMapBuildPass_MakeRoomId extends FMapBuildPass {
    public execute(map: FMap): void {
        while (true) {
            // RoomId が割り当てられていないが、Room としてマークされている Block を集める
            const roomBlocks = map.blocks().filter(block => block.isRoom() && block.roomId() == 0);
            if (roomBlocks.length == 0) {
                // 全部解決した。終了。
                break;
            }
            
            // 新しく部屋情報を作る
            const room = map.newRoom();

            // まずは新しい部屋割り当ててみるようにする
            let current: FMapBlock[] = [roomBlocks[0]];
            let next: FMapBlock[] = [];

            while (current.length > 0) {
                current.forEach(b => {
                    if (b.roomId() == 0) {   // 上下左右の集計で、current に同じ Block が入ることがある。無駄な処理を省く。
                        // ID を振る
                        b.setRoomId(room.id());
    
                        // 左
                        const b1 = map.blockTry(b.x() - 1, b.y());
                        if (b1 && b1.isRoom() && b1.roomId() == 0) {
                            next.push(b1);
                        }
                        // 上
                        const b2 = map.blockTry(b.x(), b.y() - 1);
                        if (b2 && b2.isRoom() && b2.roomId() == 0) {
                            next.push(b2);
                        }
                        // 右
                        const b3 = map.blockTry(b.x() + 1, b.y());
                        if (b3 && b3.isRoom() && b3.roomId() == 0) {
                            next.push(b3);
                        }
                        // 下
                        const b4 = map.blockTry(b.x(), b.y() + 1);
                        if (b4 && b4.isRoom() && b4.roomId() == 0) {
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
}


// roomId が割り当てられている block を元に、Room の矩形を確定する。
export class FMapBuildPass_ResolveRoomShapes extends FMapBuildPass {
    public execute(map: FMap): void {
        for (const block of map.blocks()) {
            const room = map.rooms()[block.roomId()];
            room.tryInfrateRect(block.x(), block.y());
        }
    }
}

// Room の形状や、固定マップから設定された Block 情報などをもとにモンスターハウスとなる Room をマークする。
export class FMapBuildPass_MarkMonsterHouse extends FMapBuildPass {
    public execute(map: FMap): void {
        // Room 内の Block に固定マップから指定された MonsterHouse フラグが設定されている場合、
        // その Room をもとにして MonsterHouse を作る。
        for (const room of map.rooms()) {
            room.forEachBlocks((block) => {
                const mh = block.monsterHouseTypeId();
                if (mh > 0) {
                    const structure = map.structures().find(s => s instanceof FMonsterHouseStructure && s.monsterHouseTypeId() == mh);
                    if (structure) {
                        // この部屋は MonsterHouse としてマーク済み
                    }
                    else {
                        map.addStructure(new FMonsterHouseStructure(room.id(), mh));
                    }
                }
            });
        }
    }
}

