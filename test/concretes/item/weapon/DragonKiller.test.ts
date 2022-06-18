import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/objects/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { LEquipmentUserBehavior } from "ts/mr/objects/behaviors/LEquipmentUserBehavior";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { LFloorId } from "ts/mr/objects/LFloorId";
import { MRBasics } from "ts/mr/data/MRBasics";
import { UName } from "ts/mr/usecases/UName";
import { TestEnv } from "test/TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.weapon.DragonKiller", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    const equipmentUser = player1.getEntityBehavior(LEquipmentUserBehavior);
    player1.addState(TestEnv.StateId_CertainDirectAttack);

    const weapon1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ダミードラゴンキラー_A").id, [], "weapon1"));
    const weapon2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ドラゴンキラー_A").id, [], "weapon1"));
    inventory.addEntity(weapon1);
    inventory.addEntity(weapon2);

    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEnemy_Test_サンドバッグドラゴン").id, [], "enemy1"));
    enemy1.addState(MRData.getState("kState_UTからぶり").id);
    REGame.world.transferEntity(enemy1, floorId, 11, 10);
    const enemy1HP1 = enemy1.actualParam(MRBasics.params.hp);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    // 特攻無しダメージを出してみる

    equipmentUser.equipOnUtil(weapon1);

    // [攻撃]
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, RESystem.skills.normalAttack, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const enemy1HP2 = enemy1.actualParam(MRBasics.params.hp);
    
    //----------------------------------------------------------------------------------------------------
    // 特攻有りダメージと比較する

    equipmentUser.equipOnUtil(weapon2);

    // [攻撃]
    RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, RESystem.skills.normalAttack, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const enemy1HP3 = enemy1.actualParam(MRBasics.params.hp);

    const damage1 = enemy1HP1 - enemy1HP2;
    const damage2 = enemy1HP2 - enemy1HP3;
    expect(damage1).toBeLessThan(damage2);  // ダメージが必ず増えている
});
