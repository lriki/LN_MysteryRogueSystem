import { assert } from "../Common";
import { DBlockLayerKind } from "../data/DCommon";
import { DEffectFieldScope } from "../data/DEffect";
import { DStateRestriction } from "../data/DState";
import { REBasics } from "../data/REBasics";
import { FBlockComponent } from "../floorgen/FMapData";
import { LItemBehavior } from "../objects/behaviors/LItemBehavior";
import { LBlock } from "../objects/LBlock";
import { LEntity } from "../objects/LEntity";
import { LRandom } from "../objects/LRandom";
import { LRoom } from "../objects/LRoom";
import { REGame } from "../objects/REGame";
import { paramEnemySpawnInvalidArea } from "../PluginParameters";
import { Helpers } from "../system/Helpers";


/**
 * 攻撃対象範囲などの検索ヘルパー
 */
export class USearch {

    /**
     * 失明状態であるか (self は他を視認できないか)
     */
    public static hasBlindness(self: LEntity, ): boolean {
        return self.states().find(s => s.stateEffect().restriction == DStateRestriction.Blind) !== undefined;
    }

    /**
     * 可視であるか
     */
     public static checkVisible(target: LEntity): boolean {
         return !target.hasTrait(REBasics.traits.Invisible);
    }

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
    public static iterateAroundBlocks(mx: number, my: number, length: number, withCenter: boolean, func: (block: LBlock) => void): void {
        assert(length >= 1);

        if (withCenter) {
            const block = REGame.map.tryGetBlock(mx, my);
            if (block) func(block);
        }

        this.iterateAroundPositions(mx, my, length, (mx, my) => {
            const block = REGame.map.tryGetBlock(mx, my);
            if (block) func(block);
        })
    }

    /**
     * iterateAroundPositions() を使用して、範囲に含まれている全ての Entity を列挙する。
     */
    public static iterateAroundEntities(mx: number, my: number, length: number, withCenter: boolean,func: (entity: LEntity) => void): void {
        this.iterateAroundBlocks(mx, my, length, withCenter, (block) => {
            for (const entity of block.getEntities()) {
                func(entity);
            }
        })
    }

    /**
     * ランダムワープ先の Block を選択する。
    public static selectRandomWarpBlock(rand: LRandom): void {
        const room = this.getRondomWarpRoom(rand);
        


    }
     */

    /**
     * Unit が出現可能な Block を選択する。
     */
    public static selectUnitSpawnableBlock(rand: LRandom): LBlock | null {
        // 空いている Block をランダムに選択して配置する
        const spawnableBlocks = REGame.map.getSpawnableBlocks(DBlockLayerKind.Unit);
        if (spawnableBlocks.length == 0) return null;

        const player = REGame.camera.focusedEntity();
        assert(player);
        const px = player.x;
        const py = player.y;

        // まず操作キャラのすぐ近くは避けて検索してみる
        const candidateBlocks = spawnableBlocks.filter(b => {
            if (b._roomId == player.roomId()) return false;
            const dx = Math.abs(b.x() - px);
            const dy = Math.abs(b.y() - py);
            return dx > paramEnemySpawnInvalidArea || dy > paramEnemySpawnInvalidArea;
        });
        if (candidateBlocks.length > 0) {
            return candidateBlocks[rand.nextIntWithMax(candidateBlocks.length)];
        }

        // 操作キャラの近くしかなかった場合はやむなし
        return rand.select(spawnableBlocks);
    }



    /*
    private static getRondomWarpRoom(rand: LRandom): LRoom {
        const rooms = REGame.map.rooms();
        assert(rooms.length > 0);
        if (rooms.length == 1) return rooms[0];

        const player = REGame.camera.focusedEntity();
        if (player) {
            return rand.select(rooms.filter(r => r.contains(player.x, player.y)));
        }
        else {
            return rand.select(rooms);
        }
    }
    */


    /**
     * 指定した Entity が、scope 範囲内に含まれているかを確認する
     */
    // public static checkEntityInEffectorScope(entity: LEntity, scope: DEffectFieldScope): boolean {

    // }

    /**
     * entity の視界内にある最も後に出現したアイテムを探す
     */
    public static findLatestItemInVisibilityBlocks(entity: LEntity): LEntity | undefined {

        const roomId = entity.roomId();

        const items = REGame.map.entities().filter(e => {
            if (e.roomId() != roomId) return false;
            if (!e.findEntityBehavior(LItemBehavior)) return false;
            return true;
        });

        if (items.length > 0) {
            return items[items.length - 1];
        }

        return undefined;
    }

    /**
     * 指定した向きへまっすぐ向かったとき、最初にぶつかる壁を取得する。
     * (mx,my) は含まない。
     */
    public static findFirstWallInDirection(mx: number, my: number, dir: number): LBlock {
        const map = REGame.map;
        let i = 1;
        while (true) {
            const offset = Helpers._dirToTileOffsetTable[dir];
            const x = mx + offset.x * i;
            const y = my + offset.y * i;
            if (!map.isValidPosition(x, y)) break;

            const block = map.tryGetBlock(x, y);
            if (block && block.isWallLikeShape()) {
                return block;
            }
            i++;
        }

        throw new Error("Unreachable.");
    }
}
