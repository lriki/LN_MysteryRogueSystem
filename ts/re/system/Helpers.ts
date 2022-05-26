import { DFactionId, REData } from "ts/re/data/REData";
import { Vector2 } from "ts/re/math/Vector2";
import { LEntity } from "ts/re/objects/LEntity";

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
        return new Vector2(entity.mx + offset.x * length, entity.my + offset.y * length);
    }

    // 2 つの Entity 間の直線距離を取得
    static getDistance(entity1: LEntity, entity2: LEntity): number {
        const x = entity1.mx - entity2.mx;
        const y = entity1.my - entity2.my;
        return Math.sqrt((x * x) + (y * y));
    }
    

    // 敵対勢力であるかを確認
    public static isHostile(subject: LEntity, target: LEntity): boolean {
        return this.isHostileFactionId(subject.getOutwardFactionId(), target.getOutwardFactionId());
    }

    // 味方であるかを確認
    // (target が subject に対して中立である場合は false を返すので注意)
    public static isFriend(subject: LEntity, target: LEntity): boolean {
        return this.isFriendFactionId(subject.getOutwardFactionId(), target.getOutwardFactionId());
    }

    public static isHostileFactionId(subject: DFactionId, target: DFactionId): boolean {
        return (REData.factions[subject].hostileBits & (1 << target)) != 0;
    }

    public static isFriendFactionId(subject: DFactionId, target: DFactionId): boolean {
        if (subject == target) return true;
        return (REData.factions[subject].friendBits & (1 << target)) != 0;
    }

    // public static isAdjacent(entity1: LEntity, entity2: LEntity): boolean {
    //     return (Math.abs(entity1.x - entity2.x) <= 1 && Math.abs(entity1.y - entity2.y) <= 1);
    // }


    public static lerp(v1: number, v2: number, t: number): number {
        return v1 + ((v2 - v1) * t);
    }
}
