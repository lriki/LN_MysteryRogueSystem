import { LEntity } from "ts/mr/lively/LEntity";
import { MRBasics } from "ts/mr/data/MRBasics";

export class SDebugHelpers {
    public static setHP(entity: LEntity, value: number): void {
        const mhp = entity.getParamActualMax(MRBasics.params.hp);
        entity.setActualDamgeParam(MRBasics.params.hp, mhp - value);
    }
    
    public static setFP(entity: LEntity, value: number): void {
        const max = entity.getParamActualMax(MRBasics.params.fp);
        entity.setActualDamgeParam(MRBasics.params.fp, max - value);
    }
}
