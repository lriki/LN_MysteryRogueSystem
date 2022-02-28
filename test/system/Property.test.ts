import { TestEnv } from "../TestEnv";
import { UProperty } from "ts/re/usecases/UProperty";
import { REBasics } from "ts/re/data/REBasics";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("system.Property.basic", () => {
    TestEnv.newGame();
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const hp1 = player1.actualParam(REBasics.params.hp);
    const max_hp1 = player1.idealParam(REBasics.params.hp);

    const hp2 = UProperty.getValueFromEntity(player1, "hp");
    expect(hp2).toBe(hp1);
    const max_hp2 = UProperty.getValueFromEntity(player1, "max_hp");    // デフォルト Param なので、先頭に "Param:" を付けなくても SFormulaOperand から取れる
    expect(max_hp2).toBe(max_hp1);
});
