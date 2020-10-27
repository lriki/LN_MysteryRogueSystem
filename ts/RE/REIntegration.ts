import { REMapBuilder } from "./REMapBuilder";

export abstract class REIntegration {
    abstract onLoadFixedMap(builder: REMapBuilder): void;
}
