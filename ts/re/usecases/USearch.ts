import { LBlock } from "../objects/LBlock";
import { LEntity } from "../objects/LEntity";
import { REGame } from "../objects/REGame";


/**
 * 攻撃対象範囲などの検索ヘルパー
 */
export class USearch {

    /**
     * mx, my を中心として、length タイル分離れた位置を列挙する。
     * length=1 の場合は周囲 8 マス。
     * 外周のみ列挙するため、2マス範囲内を全て列挙したい場合は lengthに 1,2を与えて複数回この関数を呼び出すこと。
     * 列挙順は左上から時計回り。
     */
    public static iterateAroundPositions(mx: number, my: number, length: number, func: (mx: number, my: number) => void): void {
        if (length == 0) return;

        const x1 = mx - length;
        const y1 = my - length;
        const x2 = mx + length;
        const y2 = my + length;
        
        for (let x = x1; x <= x2; x++) {
            func(x, y1);
        }
        for (let y = y1; y <= y2; y++) {
            func(x2, y);
        }
        for (let x = x2; x >= x1; x--) {
            func(x, y2);
        }
        for (let y = y2; y >= y1; y--) {
            func(x1, y);
        }
    }

    /**
     * iterateAroundPositions() を使用して、有効 Block を列挙する。
     */
    public static iterateAroundBlocks(mx: number, my: number, length: number, func: (block: LBlock) => void): void{
        this.iterateAroundPositions(mx, my, length, (mx, my) => {
            const block = REGame.map.tryGetBlock(mx, my);
            if (block) func(block);
        })
    }

    /**
     * iterateAroundPositions() を使用して、範囲に含まれている全ての Entity を列挙する。
     */
    public static iterateAroundEntities(mx: number, my: number, length: number, func: (entity: LEntity) => void): void{
        this.iterateAroundBlocks(mx, my, length, (block) => {
            for (const entity of block.getEntities()) {
                func(entity);
            }
        })
    }
}
