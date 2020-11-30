import { REData } from "ts/data/REData";
import { LUnitAttribute } from "ts/objects/attributes/LUnitAttribute";
import { REGame } from "ts/objects/REGame";
import { REEntityFactory } from "ts/system/REEntityFactory";
import { REGameManager } from "ts/system/REGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "./TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test('DamageAndGameover', () => {
    //--------------------
    // 準備
    REGameManager.createGameObjects();

    // actor1
    const actor1 = REGame.world.entity(REGame.system._mainPlayerEntityId);
    actor1._name = "actor1";
    REGame.world._transferEntity(actor1, 1, 5, 1);  // (5, 1) へ配置

    // enemy1
    const enemy1 = REEntityFactory.newMonster(1);
    enemy1._name = "enemy1";
    //enemy1.addState(RESystem.states.debug_MoveRight);
    REGame.world._transferEntity(enemy1, 1, 3, 1);  // (3, 1) へ配置

    REGameManager.performFloorTransfer();
    REGameManager.update();
    
    // player を左へ移動
    const dialogContext = REGame.scheduler._getDialogContext();
    dialogContext.postAction(REData.MoveToAdjacentActionId, actor1, undefined, { direction: 4 });
    dialogContext.closeDialog(true);
    
    // Enemy の目の前に移動してしまったので、攻撃される。→ 倒される
    // onTurnEnd 時までに戦闘不能が回復されなければゲームオーバーとなり、
    // Land.exitRMMZMapId に設定されているマップへの遷移が発生する。
    REGameManager.update();

    // 遷移中。ツクール側で遷移処理が必要
    expect(REGame.camera.isFloorTransfering()).toBe(true);
});
