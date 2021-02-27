import { DFactionId, REData } from "ts/data/REData";
import { Vector2 } from "ts/math/Vector2";
import { LUnitAttribute } from "ts/objects/attributes/LUnitAttribute";
import { REGame_Entity } from "ts/objects/REGame_Entity";

export class Helpers {
    private static _dirToTileOffsetTable: Vector2[] =  [
        { x: 0, y: 0 },
        { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 },
        { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 },
        { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
    ]

    static dirToTileOffset(dir: number): Vector2 {
        return this._dirToTileOffsetTable[dir];
    }

    static makeFrontPosition(x: number, y: number, dir: number, length: number): Vector2 {
        const offset = this._dirToTileOffsetTable[dir];
        return new Vector2(x + offset.x * length, y + offset.y * length);
    }

    static makeEntityFrontPosition(entity: REGame_Entity, length: number): Vector2 {
        const offset = this._dirToTileOffsetTable[entity.dir];
        return new Vector2(entity.x + offset.x * length, entity.y + offset.y * length);
    }

    // 2 つの Entity 間の直線距離を取得
    static getDistance(entity1: REGame_Entity, entity2: REGame_Entity): number {
        const x = entity1.x - entity2.x;
        const y = entity1.y - entity2.y;
        return Math.sqrt((x * x) + (y * y));
    }

    // 2 つの Entity が隣接しているか確認する
    public static checkAdjacent(entity1: REGame_Entity, entity2: REGame_Entity): boolean {
        const dx = entity1.x - entity2.x;
        const dy = entity1.y - entity2.y;
        return (-1 <= dx && dx <= 1 && -1 <= dy && dy <= 1);
    }
    

    // 敵対勢力化を確認
    public static isHostile(subject: REGame_Entity, target: REGame_Entity): boolean {
        const attr1 = subject.findAttribute(LUnitAttribute);
        const attr2 = target.findAttribute(LUnitAttribute);
        if (attr1 && attr2) {
            return this.isHostileFactionId(attr1.factionId(), attr2.factionId());
        }
        else {
            // 判定不可能。中立扱い。
            return false;
        }
    }

    public static isHostileFactionId(subject: DFactionId, target: DFactionId): boolean {
        return (REData.factions[subject].hostileBits & (1 << target)) != 0;
    }
}
