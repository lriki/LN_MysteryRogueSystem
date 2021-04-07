import { FMap } from "../FMapData";


export abstract class FMapBuildPass {
    public abstract execute(map: FMap): void;
}
