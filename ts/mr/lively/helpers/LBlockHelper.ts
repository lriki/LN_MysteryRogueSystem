import { DFactionId, MRData } from "ts/mr/data/MRData";
import { Helpers } from "ts/mr/system/Helpers";
import { LBlock } from "../LBlock";
import { LEntity } from "../LEntity";

export class LBlockHelper {
    /**
     * 指定した factionId に敵対的な footpoint を持つかどうかを返す。
     * @param factionId 
     */
    public static hasHostileFootpoint(block: LBlock, factionId: DFactionId): boolean {
        for (const faction of MRData.factions) {
            if (factionId === faction.id) {
                continue;
            }
            if (!Helpers.isHostileFactionId(factionId, faction.id)) {
                continue;
            }

            const footprints = block.footprints;
            const factionDensities = footprints.factionDensities;
            const density = factionDensities[faction.id];
            if (density !== undefined && density > 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * 指定した blocks のうち、self から最も近い block を返す。
     */
    public static selectNearestBlock(blocks: LBlock[], entity: LEntity): LBlock | undefined {
        if (blocks.length <= 0) {
            return undefined;
        }
        let nearestBlock = blocks[0];
        let nearestDistance = this.blockDistance(nearestBlock.mx, nearestBlock.my, entity.mx, entity.my);
        for (let i = 1; i < blocks.length; i++) {
            const block = blocks[i];
            const distance = this.blockDistance(block.mx, block.my, entity.mx, entity.my);
            if (distance < nearestDistance) {
                nearestBlock = block;
                nearestDistance = distance;
            }
        }
        return nearestBlock;
    }

    /**
     * 2点間の距離 (到達に必要な移動ブロック数) を求める。
     * 斜め移動を許可している Block 単位の距離なので、マンハッタン距離やユークリッド距離とは違う点に注意。
     */
    public static blockDistance(x1: number, y1: number, x2: number, y2: number): number {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        return Math.max(dx, dy);
    }
}
