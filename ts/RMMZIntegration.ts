import { REIntegration } from "./RE/REIntegration";
import { REMapBuilder } from "./RE/REMapBuilder";

export class RMMZIntegration extends REIntegration {
    onLoadFixedMap(builder: REMapBuilder): void {
        throw new Error("Method not implemented.");
    }
}