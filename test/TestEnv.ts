import { REData, REFloorMapKind } from "ts/data/REData";
import { REDataManager } from "ts/data/REDataManager";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { RESequelSet } from "ts/objects/REGame_Sequel";
import { REDialogContext } from "ts/system/REDialog";
import { REIntegration } from "ts/system/REIntegration";
import { REMapBuilder } from "ts/system/REMapBuilder";
import { RESystem } from "ts/system/RESystem";

export class TestEnv {
    static activeSequelSet: RESequelSet;

    static setupDatabase() {
        REData.reset();
        REDataManager.setupCommonData();

        // Lands
        REData.addLand(1);
        REData.addLand(2);
        REData.addLand(3);

        // Floors
        REData.addFloor(4, 1, REFloorMapKind.FixedMap);
        REData.addFloor(5, 1, REFloorMapKind.FixedMap);
        REData.addFloor(6, 1, REFloorMapKind.FixedMap);

        // Unique Entitise
        REData.addActor("Unique1");

        // Enemies
        REData.addMonster("Enemy1");
        REData.addMonster("Enemy2");
        REData.addMonster("Enemy3");
        
        RESystem.integration = new TestEnvIntegration();
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
    onFlushSequelSet(sequelSet: RESequelSet): void {
        TestEnv.activeSequelSet = sequelSet;
    }
    onCheckVisualSequelRunning(): boolean {
        return false;
    }
    onDialogOpend(context: REDialogContext): void {
    }
    onDialogClosed(context: REDialogContext): void {
    }
    onUpdateDialog(context: REDialogContext): void {
    }
    onEntityEnteredMap(entity: REGame_Entity): void {
    }
    onEntityLeavedMap(entity: REGame_Entity): void {
    }
}