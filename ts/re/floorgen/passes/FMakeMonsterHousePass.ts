import { DFloorMonsterHousePattern } from "ts/re/data/DLand";
import { REData } from "ts/re/data/REData";
import { LRandom } from "ts/re/objects/LRandom";
import { FMap } from "../FMapData";
import { FMonsterHouseStructure } from "../FStructure";
import { FMapBuildPass } from "./FMapBuildPass";

// Room の形状や、固定マップから設定された Block 情報などをもとにモンスターハウスとなる Room をマークする。
/**
 * @deprecated
 */
export class FMakeMonsterHouseForFixedMapPass extends FMapBuildPass {
    public execute(map: FMap): void {
        // Room 内の Block に固定マップから指定された MonsterHouse フラグが設定されている場合、
        // その Room をもとにして MonsterHouse を作る。
        for (const room of map.rooms()) {
            room.forEachBlocks((block) => {
                const mh = block.fixedMapMonsterHouseTypeId();
                if (mh > 0) {
                    const structure = map.structures().find(s => s instanceof FMonsterHouseStructure && s.monsterHouseTypeId() == mh);
                    if (structure) {
                        // この部屋は MonsterHouse としてマーク済み
                    }
                    else {
                        const s = new FMonsterHouseStructure(room.id(), mh);
                        map.addStructure(s);
                        room.addStructureRef(s);
                    }
                }
            });
        }

        // モンスターハウスが1つもなければランダム生成を試す。
        if (!map.structures().find(x => x instanceof FMonsterHouseStructure)) {
            const monsterHouse = map.floorId().floorInfo().monsterHouse;

            // そもそも出現させるかを判定する
            if (map.random().nextIntWithMax(100) < monsterHouse.rating) {
                const pattern = this.selectPattern(monsterHouse.patterns, map.random());
                if (pattern) {
                    const candidates = map.rooms().filter(x => x.structures().length == 0);
                    const room = map.random().selectOrUndefined(candidates);
                    if (room) {
                        const data = REData.monsterHouses.find(x => x.name == pattern.name);
                        if (!data) throw new Error(`MonsterHouses "${pattern.name}" は存在しません。`);

                        const s = new FMonsterHouseStructure(room.id(), data.id);
                        map.addStructure(s);
                        room.addStructureRef(s);
                    }
                }
            }
        }
    }

    private selectPattern(patterns: DFloorMonsterHousePattern[], rand: LRandom): DFloorMonsterHousePattern | undefined {
        const sum = patterns.reduce((r, a) => r + a.rating, 0);
        if (sum > 0) {
            let value = rand.nextIntWithMax(sum);
            for (const p of patterns) {
                value -= p.rating;
                if (value < 0) {
                    return p;
                }
            }
        } else {
            return undefined;
        }
    }
}


