import { LEntity } from "ts/re/objects/LEntity";
import { MRBasics } from "ts/re/data/MRBasics";

export class SDebugHelpers {
    public static setHP(entity: LEntity, value: number): void {
        const mhp = entity.idealParam(MRBasics.params.hp);
        entity.setActualDamgeParam(MRBasics.params.hp, mhp - value);
    }
    
    public static setFP(entity: LEntity, value: number): void {
        const max = entity.idealParam(MRBasics.params.fp);
        entity.setActualDamgeParam(MRBasics.params.fp, max - value);
    }
}
