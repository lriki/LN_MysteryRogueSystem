import { REData, REFloorMapKind } from "ts/data/REData";
import { REDataManager } from "ts/data/REDataManager";
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
    onReserveTransferFloor(floorId: number): void {
        // TestEnv では全部動的生成するのでファイルロードは不要
    }
    onLoadFixedMap(builder: REMapBuilder): void {
        if (builder.floorId() == 1) {
            // 50x50 の空マップ
            builder.reset(50, 50);
        }
        else {
            throw new Error("Method not implemented.");
        }
    }
}