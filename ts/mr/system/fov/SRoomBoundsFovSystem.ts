import { HMovement } from "ts/mr/lively/helpers/HMovement";
import { LMap } from "ts/mr/lively/LMap";
import { paramDefaultVisibiltyLength } from "ts/mr/PluginParameters";
import { UMovement } from "ts/mr/utility/UMovement";
import { MRSystem } from "../MRSystem";
import { SFovSystem } from "./SFovSystem";

export class SRoomBoundsFovSystem extends SFovSystem {
    public markBlockPlayerPassed(map: LMap, mx: number, my: number): void {
        const block = map.block(mx, my);
        block._passed = true;
        if (block._roomId > 0) {
            const room = map.room(block._roomId);
            if (room.poorVisibility) {
                room.forEachSightableBlocks(b => {
                    if (HMovement.blockDistance(block.mx, block.my, b.mx, b.my) <= paramDefaultVisibiltyLength) {
                        b._passed = true;
                    }
                });
            }
            else {
                room.forEachSightableBlocks(b => b._passed = true);
            }
        }
        else {
            // 通路なら外周1タイルを通過済みにする
            UMovement.adjacent8Offsets.forEach(offset => {
                const x = block.mx + offset[0];
                const y = block.my + offset[1];
                if (map.isValidPosition(x, y)) {
                    map.block(x, y)._passed = true;
                }
            });
        }
        MRSystem.minimapData.setRefreshNeeded();
    }
}


