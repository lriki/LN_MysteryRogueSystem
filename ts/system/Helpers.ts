import { DFactionId, REData } from "ts/data/REData";
import { Vector2 } from "ts/math/Vector2";
import { LUnitAttribute } from "ts/objects/attributes/LUnitAttribute";
import { REGame } from "ts/objects/REGame";
import { LEntity } from "ts/objects/LEntity";
import { REUnitBehavior } from "ts/objects/behaviors/REUnitBehavior";

export class Helpers {
    public static _dirToTileOffsetTable: Vector2[] =  [
        { x: 0, y: 0 },
        { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 },
        { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 },
        { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
    ]

    public static dirToTileOffset(dir: number): Vector2 {
        return this._dirToTileOffsetTable[dir];
    }

    public static offsetToDir(offsetX: number, offsetY: number): number {
        if (offsetX == 0) {
            if (offsetY == 0) {
                return 2;   // FailSafe.
            }
            else if (offsetY > 0) {
                return 2;
            }
            else {  // if (offsetY < 0)
                return 8;
            }
        }
        else if (offsetX > 0) {
            if (offsetY == 0) {
                return 6;
            }
            else if (offsetY > 0) {
                return 3;
            }
            else {  // if (offsetY < 0)
                return 9;
            }
        }
        else {  // if (offsetX < 0)
            if (offsetY == 0) {
                return 4;
            }
            else if (offsetY > 0) {
                return 1;
            }
            else {  // if (offsetY < 0)
                return 7;
            }
        }
    }

    static makeFrontPosition(x: number, y: number, dir: number, length: number): Vector2 {
        const offset = this._dirToTileOffsetTable[dir];
        return new Vector2(x + offset.x * length, y + offset.y * length);
    }

    static makeEntityFrontPosition(entity: LEntity, length: number): Vector2 {
        const offset = this._dirToTileOffsetTable[entity.dir];
        return new Vector2(entity.x + offset.x * length, entity.y + offset.y * length);
    }

    // 2 つの Entity 間の直線距離を取得
    static getDistance(entity1: LEntity, entity2: LEntity): number {
        const x = entity1.x - entity2.x;
        const y = entity1.y - entity2.y;
        return Math.sqrt((x * x) + (y * y));
    }

    // 2 つの Entity が隣接しているか確認する
    public static checkAdjacent(entity1: LEntity, entity2: LEntity): boolean {
        const dx = entity1.x - entity2.x;
        const dy = entity1.y - entity2.y;
        return (-1 <= dx && dx <= 1 && -1 <= dy && dy <= 1);
    }
    

    // 敵対勢力であるかを確認
    public static isHostile(subject: LEntity, target: LEntity): boolean {
        const attr1 = subject.findBehavior(REUnitBehavior);
        const attr2 = target.findBehavior(REUnitBehavior);
        if (attr1 && attr2) {
            return this.isHostileFactionId(attr1.factionId(), attr2.factionId());
        }
        else {
            // 判定不可能。中立扱い。
            return false;
        }
    }

    // 味方であるかを確認
    // (target が subject に対して中立である場合は false を返すので注意)
    public static isFriend(subject: LEntity, target: LEntity): boolean {
        const behavior1 = subject.findBehavior(REUnitBehavior);
        const behavior2 = target.findBehavior(REUnitBehavior);
        if (behavior1 && behavior2) {
            return this.isFriendFactionId(behavior1.factionId(), behavior2.factionId());
        }
        else {
            // 判定不可能。中立扱い。
            return false;
        }
    }

    public static isHostileFactionId(subject: DFactionId, target: DFactionId): boolean {
        return (REData.factions[subject].hostileBits & (1 << target)) != 0;
    }

    public static isFriendFactionId(subject: DFactionId, target: DFactionId): boolean {
        if (subject == target) return true;
        return (REData.factions[subject].friendBits & (1 << target)) != 0;
    }

    public static testVisibility(subject: LEntity, target: LEntity): boolean {
        const targetBlock = REGame.map.block(target.x, target.y);

        // 見方は常に視認可能
        if (Helpers.isFriend(subject, target)) {
            return true;
        }

        // 隣接していれば Faction を問わず見える
        if (Math.abs(subject.x - target.x) <= 1 && Math.abs(subject.y - target.y) <= 1) {
            return true;
        }

        // 同じ部屋にいれば Faction を問わず見える
        if (subject.roomId() == target.roomId()) {
            return true;
        }

        if (Helpers.isHostile(subject, target)) {
        }
        else {
            // 中立 target は、踏破済みの Block 上なら見える
            if (targetBlock._passed) {
                return true;
            }
        }

        return false;
    }

    public static lerp(v1: number, v2: number, t: number): number {
        return v1 + ((v2 - v1) * t);
    }

    public static randomInt(max: number): number {
        return Math.floor(max * Math.random());
    }
}
