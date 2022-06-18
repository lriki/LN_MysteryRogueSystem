import { FMap } from "../FMapData";
import { FItemShopStructure } from "../FStructure";
import { FMapBuildPass } from "./FMapBuildPass";

// Room の形状や、固定マップから設定された Block 情報などをもとに店となる Room をマークする。
export class FMakeItemShopPass extends FMapBuildPass {
    public execute(map: FMap): void {
        // Room 内の Block に固定マップから指定された MonsterHouse フラグが設定されている場合、
        // その Room をもとにして MonsterHouse を作る。
        for (const room of map.rooms()) {
            room.forEachBlocks((block) => {
                const shopId = block.fixedMapItemShopTypeId();
                if (shopId > 0) {
                    const structure = map.structures().find(s => s instanceof FItemShopStructure && s.itemShopTypeId() == shopId);
                    if (structure) {
                        // この部屋はマーク済み
                    }
                    else {
                        const s = new FItemShopStructure(room.id(), shopId);
                        map.addStructure(s);
                        room.addStructureRef(s);
                    }
                }
            });
        }

        // TODO: ランダム生成
    }
}


