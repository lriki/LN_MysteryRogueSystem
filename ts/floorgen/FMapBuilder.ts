import { assert } from "ts/Common";
import { RETileAttribute } from "ts/objects/attributes/RETileAttribute";
import { TileKind } from "ts/objects/REGame_Block";
import { REGame_Map } from "ts/objects/REGame_Map";
import { FBlockComponent, FMap, FMapBlock } from "./FMapData";


export class FMapBuilder {
    private _passes: FMapBuildPass[];

    public constructor() {
        this._passes = [
            new FMapBuildPass_MakeRoomId(),
        ];
    }

    public build(data: FMap, map: REGame_Map): void {
        // Apply passes
        this._passes.forEach(pass => pass.execute(data));


        const width = data.width();
        const height = data.height();

        map.setupEmptyMap(width, height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dataBlock = data.block(x, y);
                const mapBlock = map.block(x, y);

                const kind = dataBlock.tileKind();
                
                const tile = mapBlock.tile();
                const attr = tile.findAttribute(RETileAttribute);
                assert(attr);
                attr.setTileKind(kind);

                mapBlock._roomId = dataBlock.roomId();
            }
        }
    }
}

export abstract class FMapBuildPass {
    public abstract execute(map: FMap): void;
}


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

