import { LMap } from "ts/mr/lively/LMap";

export abstract class SFovSystem {
    public abstract markBlockPlayerPassed(map: LMap, mx: number, my: number): void;
}
