import { TestEnv } from "../TestEnv";
import { UComponentType, UProperty, UPropertyPath } from "ts/re/usecases/UProperty";
import { MRBasics } from "ts/re/data/MRBasics";
import { REData } from "ts/re/data/REData";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { DEntityCreateInfo } from "ts/re/data/DEntity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("system.Property.basic", () => {
    TestEnv.newGame();
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const hp1 = player1.actualParam(MRBasics.params.hp);
    const max_hp1 = player1.idealParam(MRBasics.params.hp);
    const stateId = REData.getState("kState_UTかなしばり").id;
    player1.addState(stateId);

    const hp2 = UProperty.getValueFromEntity(player1, "hp");
    expect(hp2).toBe(hp1);
    const max_hp2 = UProperty.getValueFromEntity(player1, "max_hp");    // デフォルト Param なので、先頭に "Param:" を付けなくても SFormulaOperand から取れる
    expect(max_hp2).toBe(max_hp1);
    const state = UProperty.getValueFromEntity(player1, "State[kState_UTかなしばり]");
    expect(state).toBe(1);

    // アイテム数を取得してみる
    const inventory = player1.getEntityBehavior(LInventoryBehavior);
    inventory.addEntity(SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEntity_スピードドラッグ_A").id, [], "item1")));
    const count = UProperty.getValueFromEntity(player1, "Entity:Inventory.items.length");
    expect(count).toBe(1);

    // 値を設定してみる
    UProperty.setValue("${Player}", "Entity:Inventory.capacity", 100);
    expect(inventory.capacity).toBe(100);
});

test("system.Property.PathParser", () => {
    const path1 = new UPropertyPath("hp");
    expect(path1.componentType).toBe(UComponentType.Param);
    expect(path1.element).toBe(undefined);
    expect(path1.behaviorName).toBe(undefined);
    expect(path1.propertyName).toBe("hp");

    const path2 = new UPropertyPath("entity:x");
    expect(path2.componentType).toBe(UComponentType.Entity);
    expect(path2.element).toBe(undefined);
    expect(path2.behaviorName).toBe(undefined);
    expect(path2.propertyName).toBe("x");

    const path3 = new UPropertyPath("Entity:unit.manual");
    expect(path3.componentType).toBe(UComponentType.Entity);
    expect(path3.element).toBe(undefined);
    expect(path3.behaviorName).toBe("unit");
    expect(path3.propertyName).toBe("manual");

    const path4 = new UPropertyPath("State[睡眠]");
    expect(path4.componentType).toBe(UComponentType.State);
    expect(path4.element).toBe("睡眠");
    expect(path4.behaviorName).toBe(undefined);
    expect(path4.propertyName).toBe(undefined);

    const path5 = new UPropertyPath("State[睡眠]:turn");
    expect(path5.componentType).toBe(UComponentType.State);
    expect(path5.element).toBe("睡眠");
    expect(path5.behaviorName).toBe(undefined);
    expect(path5.propertyName).toBe("turn");

    const path6 = new UPropertyPath("State[睡眠]:generic.xxx");
    expect(path6.componentType).toBe(UComponentType.State);
    expect(path6.element).toBe("睡眠");
    expect(path6.behaviorName).toBe("generic");
    expect(path6.propertyName).toBe("xxx");
});