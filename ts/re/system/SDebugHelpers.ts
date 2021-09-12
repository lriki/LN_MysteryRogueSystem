import { LEntity } from "ts/re/objects/LEntity";
import { DBasics } from "ts/re/data/DBasics";

export class SDebugHelpers {
    public static setHP(entity: LEntity, value: number): void {
        const mhp = entity.idealParam(DBasics.params.hp);
        entity.setActualDamgeParam(DBasics.params.hp, mhp - value);
    }
    
    public static setFP(entity: LEntity, value: number): void {
        const max = entity.idealParam(DBasics.params.fp);
        entity.setActualDamgeParam(DBasics.params.fp, max - value);
    }
}