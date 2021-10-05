import { LEntity } from "ts/re/objects/LEntity";
import { REBasics } from "ts/re/data/REBasics";

export class SDebugHelpers {
    public static setHP(entity: LEntity, value: number): void {
        const mhp = entity.idealParam(REBasics.params.hp);
        entity.setActualDamgeParam(REBasics.params.hp, mhp - value);
    }
    
    public static setFP(entity: LEntity, value: number): void {
        const max = entity.idealParam(REBasics.params.fp);
        entity.setActualDamgeParam(REBasics.params.fp, max - value);
    }
}
