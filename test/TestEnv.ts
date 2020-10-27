import { REData, REFloorMapKind } from "ts/RE/REData";
import { REDataManager } from "ts/RE/REDataManager";
import { REGame } from "ts/RE/REGame";
import { REIntegration } from "ts/RE/REIntegration";
import { REMapBuilder } from "ts/RE/REMapBuilder";

export class TestEnv {
    static setupDatabase() {
        REData.reset();
        REDataManager.setupCommonData();

        // Lands
        REData.addLand(1);
        REData.addLand(2);
        REData.addLand(3);

        // Floors
        REData.addFloor(4, REFloorMapKind.FixedMap);
        REData.addFloor(5, REFloorMapKind.FixedMap);
        REData.addFloor(6, REFloorMapKind.FixedMap);

        // Unique Entitise
        REData.addActor("Unique1");
        
        REGame.integration = new TestEnvIntegration();
    }
}

export class TestEnvIntegration extends REIntegration {
    onLoadFixedMap(builder: REMapBuilder): void {
        throw new Error("Method not implemented.");
    }
}