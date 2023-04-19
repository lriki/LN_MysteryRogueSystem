import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { TestEnv } from "../../../TestEnv";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { MRData } from "ts/mr/data/MRData";
import { MRSystem } from "ts/mr/system/MRSystem";
import { SMainMenuDialog } from "ts/mr/system/dialogs/SMainMenuDialog";
import { SItemListDialog, SItemListDialogSourceAction } from "ts/mr/system/dialogs/SItemListDialog";
import { assert } from "ts/mr/Common";
import { SItemSelectionDialog } from "ts/mr/system/dialogs/SItemSelectionDialog";
import { SPlayerDialog } from "ts/mr/system/dialogs/SPlayerDialog";
import { SDialogSystemCommand } from "ts/mr/system/dialogs/SDialogCommand";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LEntity } from "ts/mr/lively/LEntity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.item.pots.PreservationPot.Basic", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_保存の壺A").id, [], "item1"));
    const item2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item2"));
    inventory1.addEntity(item1);
    inventory1.addEntity(item2);
    const item1Inventory = item1.getEntityBehavior(LInventoryBehavior);

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    const playerDialog1 = MRSystem.dialogContext.activeDialog();

    // メインメニューを開く
    const mainMenuDialog1 = new SMainMenuDialog(player1);
    playerDialog1.openSubDialog(mainMenuDialog1, (result: SMainMenuDialog) => {
        // this._itemListWindow.refresh();
        // this.activateCommandWindow();
        return true;
    });

    // インベントリを開く
    const inventoryDialog1 = new SItemListDialog(player1, inventory1, SItemListDialogSourceAction.Default);
    mainMenuDialog1.openSubDialog(inventoryDialog1);

    // item1 をフォーカス
    inventoryDialog1.focusEntity(item1);

    // システムコマンド [入れる] を実行
    const putInCommand1 = inventoryDialog1.makeActionList().find(x => x.systemCommandId == SDialogSystemCommand.PutIn);
    assert(putInCommand1);
    putInCommand1.execute();

    // execute() で SItemSelectionDialog が開かれる
    const itemSelectionDialog1 = MRSystem.dialogContext.activeDialog() as SItemSelectionDialog;

    // item2 を選択して決定
    itemSelectionDialog1.focusEntity(item2);
    itemSelectionDialog1.submit();  // この submit で PlayerDialog まで閉じる
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // item1 は pot に入っている。
    expect(item1Inventory.contains(item2)).toBeTruthy();

    const playerDialog2 = MRSystem.dialogContext.activeDialog();
    assert(playerDialog2 instanceof SPlayerDialog);

    // メインメニューを開く
    const mainMenuDialog2 = new SMainMenuDialog(player1);
    playerDialog2.openSubDialog(mainMenuDialog2, (result: SMainMenuDialog) => {
        return true;
    });

    // インベントリを開く
    const inventoryDialog2 = new SItemListDialog(player1, inventory1, SItemListDialogSourceAction.Default);
    mainMenuDialog2.openSubDialog(inventoryDialog2);

    // item1 をフォーカス
    inventoryDialog2.focusEntity(item1);

    // システムコマンド [見る] を実行
    const peekCommand1 = inventoryDialog2.makeActionList().find(x => x.systemCommandId == SDialogSystemCommand.Peek);
    assert(peekCommand1);
    peekCommand1.execute();

    // execute() で SItemSelectionDialog が開かれる
    const itemListDialog2 = MRSystem.dialogContext.activeDialog();
    assert(itemListDialog2 instanceof SItemListDialog);
    expect(itemListDialog2.inventory.items[0]).toBe(item2);  // 中に item2 が入っている

    // Pot 内の item2 をフォーカス
    itemListDialog2.focusEntity(item2);

    // システムコマンド [出す] を実行
    const pickOutCommand1 = itemListDialog2.makeActionList().find(x => x.systemCommandId == SDialogSystemCommand.PickOut);
    assert(pickOutCommand1);
    pickOutCommand1.execute();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // item1 は Player の持ち物に入っている。
    expect(inventory1.contains(item2)).toBeTruthy();
    expect(item1Inventory.contains(item2)).toBeFalsy();
});

test("concretes.item.pots.PreservationPot.Limit", () => {
    TestEnv.newGame();

    // Player
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_UnitTestFlatMap50x50, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_保存の壺A").id, [], "item1"));
    inventory1.addEntity(item1);
    const item1Inventory = item1.getEntityBehavior(LInventoryBehavior);

    const items: LEntity[] = [];
    for (let i = 0; i < item1Inventory.capacity + 1; i++) {
        const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item" + i));
        inventory1.addEntity(item);
        items.push(item);
    }

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    const playerDialog1 = MRSystem.dialogContext.activeDialog();

    // メインメニューを開く
    const mainMenuDialog1 = new SMainMenuDialog(player1);
    playerDialog1.openSubDialog(mainMenuDialog1, (result: SMainMenuDialog) => {
        return true;
    });

    // インベントリを開く
    const inventoryDialog1 = new SItemListDialog(player1, inventory1, SItemListDialogSourceAction.Default);
    mainMenuDialog1.openSubDialog(inventoryDialog1);

    // item1 を選択
    inventoryDialog1.focusEntity(item1);

    // システムコマンド [入れる] を実行
    const putInCommand1 = inventoryDialog1.makeActionList().find(x => x.systemCommandId == SDialogSystemCommand.PutIn);
    assert(putInCommand1);
    putInCommand1.execute();

    // execute() で SItemSelectionDialog が開かれる
    const itemSelectionDialog1 = MRSystem.dialogContext.activeDialog() as SItemSelectionDialog;
    expect(itemSelectionDialog1.multipleSelectionEnabled).toBeTruthy();

    // item をぜんぶ選択して決定
    for (const item of items) {
        itemSelectionDialog1.focusEntity(item);
        itemSelectionDialog1.toggleMultipeSelection();
    }
    itemSelectionDialog1.submit();  // この submit で PlayerDialog まで閉じる
    
    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 最大容量までのアイテムは入っているが、最後のアイテムは入っていない
    for (let i = 0; i < items.length - 1; i++) {
        expect(item1Inventory.contains(items[i])).toBeTruthy();
    }
    expect(item1Inventory.contains(items[items.length - 1])).toBeFalsy();


    // --------------------------------------------------

    // インベントリの残りを、容量-1 になるまで埋める
    const count = (inventory1.capacity - inventory1.items.length) - 1;
    for (let i = 0; i < count; i++) {
        const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item" + i));
        inventory1.addEntity(item);
    }

    const playerDialog2 = MRSystem.dialogContext.activeDialog();
    assert(playerDialog2 instanceof SPlayerDialog);

    // メインメニューを開く
    const mainMenuDialog2 = new SMainMenuDialog(player1);
    playerDialog2.openSubDialog(mainMenuDialog2, (result: SMainMenuDialog) => {
        return true;
    });

    // インベントリを開く
    const inventoryDialog2 = new SItemListDialog(player1, inventory1, SItemListDialogSourceAction.Default);
    mainMenuDialog2.openSubDialog(inventoryDialog2);

    // item1 をフォーカス
    inventoryDialog2.focusEntity(item1);

    // システムコマンド [見る] を実行
    const peekCommand1 = inventoryDialog2.makeActionList().find(x => x.systemCommandId == SDialogSystemCommand.Peek);
    assert(peekCommand1);
    peekCommand1.execute();

    // execute() で SItemSelectionDialog が開かれる
    const itemListDialog2 = MRSystem.dialogContext.activeDialog();
    assert(itemListDialog2 instanceof SItemListDialog);
    expect(itemListDialog2.multipleSelectionEnabled).toBeTruthy();

    // Pot 内の Item を2つ選択
    const pickItem1 = itemListDialog2.inventory.items[0];
    const pickItem2 = itemListDialog2.inventory.items[1];
    itemListDialog2.focusEntity(pickItem1);
    itemListDialog2.toggleMultipeSelection();
    itemListDialog2.focusEntity(pickItem2);
    itemListDialog2.toggleMultipeSelection();

    // システムコマンド [出す] を実行
    const pickOutCommand1 = itemListDialog2.makeActionList().find(x => x.systemCommandId == SDialogSystemCommand.PickOut);
    assert(pickOutCommand1);
    pickOutCommand1.execute();

    MRSystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 1つは取り出せているが、もう一つは持ち物一杯で取り出せない
    expect(inventory1.contains(pickItem1)).toBeTruthy();
    expect(inventory1.contains(pickItem2)).toBeFalsy();
    expect(item1Inventory.contains(pickItem1)).toBeFalsy();
    expect(item1Inventory.contains(pickItem2)).toBeTruthy();
});

/*
[2023/4/7] Entity の Initializer を作る？
----------
背中の壺やトドの壺の初期値を設定するにはどうしようか？
※上記は入っているアイテムが一律同じだが、ビックリの壺はランダムで入っている。

杖の初期値、スタック数、壺のサイズの初期値設定も、ある意味 Initializer の仕事に該当する。
でもスタック数は Behavior として設定するのはちょっと違う気もする。
使用回数、というか、パラメータも同様。

その他、アイテムやモンスター固有で初期値を変えたいものはあるだろうか？
- きたえた木刀
- 行商人(ユニークエンティティではないもの)
- お金？(Behaviorにするなら)

初期化のためだけに Behavior を用意するのは少し抵抗があるけど…。
代案は Trait だけど、ビックリの壺とかは結局は併せて "処理" が必要なので、Behavior の方がいいかもしれない。


*/
