import { assert, tr2 } from "../Common";
import { DBlockLayerKind } from "../data/DCommon";
import { DEffectFieldScope } from "../data/DEffect";
import { DStateRestriction } from "../data/DState";
import { MRBasics } from "../data/MRBasics";
import { FBlockComponent } from "../floorgen/FMapData";
import { LEntryPointBehavior } from "../lively/behaviors/LEntryPointBehavior";
import { LExitPointBehavior } from "../lively/behaviors/LExitPointBehavior";
import { LItemBehavior } from "../lively/behaviors/LItemBehavior";
import { LTrapBehavior } from "../lively/behaviors/LTrapBehavior";
import { LUnitBehavior } from "../lively/behaviors/LUnitBehavior";
import { LBlock } from "../lively/LBlock";
import { LEntity } from "../lively/LEntity";
import { LRandom } from "../lively/LRandom";
import { LRoom } from "../lively/LRoom";
import { REGame } from "../lively/REGame";
import { paramDefaultVisibiltyLength, paramEnemySpawnInvalidArea } from "../PluginParameters";
import { Helpers } from "../system/Helpers";
import { UMovement } from "./UMovement";


/**
 * 攻撃対象範囲などの検索ヘルパー
 */
export class USearch {

    /**
     * 失明状態であるか (self は他を視認できないか)
     */
    public static hasBlindness(self: LEntity): boolean {
        return self.states().find(s => s.stateEffect().restriction == DStateRestriction.Blind) !== undefined;
    }

    /**
     * 可視であるか
     */
    public static isVisible(target: LEntity): boolean {
         return !target.hasTrait(MRBasics.traits.Invisible);
    }

    /**
     * subject から見て target は可視であるか
     * ※視界内か、ではない点に注意
     */
    public static isVisibleFromSubject(subject: LEntity, target: LEntity): boolean {
        // あかりの巻物など、フロア自体に可視効果がある
        if (REGame.map.unitClarity) return true;
        
        // よく見え状態なら、相手が透明状態でも見える
        if (subject.hasTrait(MRBasics.traits.ForceVisible)) return true;

        // 相手が透明状態なので、見えない
        if (target.hasTrait(MRBasics.traits.Invisible)) return false;

        return true;
    }

    /**
     * subject から見て、 target は視界内であるか。
     * ※可視であるか、ではない点に注意。この関数は地形や位置関係による視界チェックとなる。
     */
    public static checkInSightEntity(subject: LEntity, target: LEntity): boolean {
        if (subject.isOnRoom()) {
            const map = REGame.map;
            const subjectRoom = map.room(subject.roomId());

            // 部屋の外周にも含まれず、部屋の外にいる target を見ることはできない。
            if (!subjectRoom.containsWithEdge(target.mx, target.my)) return false;

            // 視界不明瞭部屋の場合、遠いところにいる target は見えない。
            if (subjectRoom.poorVisibility) {
                if (UMovement.blockDistance(subject.mx, subject.my, target.mx, target.my) > paramDefaultVisibiltyLength) {
                    return false;
                }
            }
            return true;
        }
        else {
            // 通路内では隣接している場合のみ見える。
            return UMovement.checkAdjacentEntities(subject, target);
        }
    }

    /**
     * subject から見て、 block は可視であるか
     * @param subject 
     * @param block 
     */
    public static checkInSightBlockFromSubject(subject: LEntity, block: LBlock): boolean {
        // 失明状態？
        if (this.hasBlindness(subject)) return false;

        if (subject.isOnRoom()) {
            // 部屋の中からは、部屋の外周上の Block も可視となる
            const room = REGame.map.room(subject.roomId());
            return room.checkVisibilityBlock(block);
        }
        else {
            // 部屋の外にいる場合、たとえ部屋の外周 Block 上にいても、部屋内は見えない。
            // 隣接のみ見える。
            return UMovement.checkAdjacentPositions(subject.mx, subject.my, block.mx, block.my);
        }
    }

    /**
     * 指定された entity が中立的なアイテムか(=普通に誰でも拾うことができるか)
     */
    public static isNeutralItem(entity: LEntity): boolean {
        // Unit は何らかの勢力に属し、Unitレイヤー上で活動するもの。一般的にはアイテムとして拾うことはできない。
        if (entity.findEntityBehavior(LUnitBehavior)) return false;

        // Trap は対象勢力を持ち、その勢力は拾うことはできない。
        if (entity.findEntityBehavior(LTrapBehavior)) return false;

        // 階段
        if (entity.findEntityBehavior(LExitPointBehavior)) return false;
        if (entity.findEntityBehavior(LEntryPointBehavior)) return false;

        return !!entity.findEntityBehavior(LItemBehavior);
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

        /*
            以下4つの for では次のように列挙を担当する。
            112
            4 2
            433
        */
        
        for (let x = x1; x < x2; x++) {
            func(x, y1);
        }
        for (let y = y1; y < y2; y++) {
            func(x2, y);
        }
        for (let x = x2; x > x1; x--) {
            func(x, y2);
        }
        for (let y = y2; y > y1; y--) {
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
    
    public static getFirstUnderFootEntity(entity: LEntity): LEntity | undefined {
        const block = REGame.map.tryGetBlock(entity.mx, entity.my);
        if (block) {
            const target = block.getFirstEntity(DBlockLayerKind.Ground);
            return target;
        }
        return undefined;
    }

    /**
     * Unit が出現可能な Block を選択する。
     */
    public static selectUnitSpawnableBlock(rand: LRandom): LBlock | null {
        // 空いている Block をランダムに選択して配置する
        const spawnableBlocks = REGame.map.getSpawnableBlocks(DBlockLayerKind.Unit);
        if (spawnableBlocks.length == 0) return null;

        const player = REGame.camera.focusedEntity();
        assert(player);
        const px = player.mx;
        const py = player.my;

        // まず操作キャラのすぐ近くは避けて検索してみる
        let candidateBlocks = spawnableBlocks.filter(b => {
            const dx = Math.abs(b.mx - px);
            const dy = Math.abs(b.my - py);
            return dx > paramEnemySpawnInvalidArea || dy > paramEnemySpawnInvalidArea;
        });

        // 部屋が複数ある場合、Player 以外の部屋を選ぶ
        if (!REGame.map.isSingleRoomMap) {
            candidateBlocks = candidateBlocks.filter(b =>(b._roomId != player.roomId()));
        }

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
            if (!this.isNeutralItem(e)) return false;
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
    
    public static getUniqueActorByKey(key: string): LEntity {
        const entity = REGame.system.uniqueActorUnits
            .map(x => REGame.world.entity(x))
            .find(x => x.data.entity.key == key);
        if (!entity) throw new Error(tr2("%1はアクターの中から見つかりませんでした。").format(key));
        return entity;
    }

    public static getEntityByKeyPattern(keyPattern: string): LEntity {
        if (keyPattern == "${Player}") {
            return REGame.camera.getFocusedEntity();
        }
        else {
            const entity = REGame.system.uniqueActorUnits
                .map(x => REGame.world.entity(x))
                .find(x => x.data.entity.key == keyPattern);
            if (!entity) throw new Error(tr2("%1は見つかりませんでした。").format(keyPattern));
            return entity;
        }
    }
}
