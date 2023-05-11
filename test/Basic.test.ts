//import fs from "fs";
import { SPlayerDialog } from "ts/mr/system/dialogs/SPlayerDialog";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "./TestEnv";
import { LActivity } from "ts/mr/lively/activities/LActivity";
//import { Browser, Page } from 'puppeteer';
// declare global {
//     const browser: Browser;
//     const page: Page;
//   }
beforeAll(async () => {
    TestEnv.setupDatabase();
    //await (page as any).goto('https://google.com');
});

afterAll(() => {
});

// eval 前に定義しておかないと、"$dataActors = null;" の時に Reference Error になる。
// let $dataActors = null;
// let $dataClasses = null;
// let $dataSkills = null;
// let $dataItems = null;
// let $dataWeapons = null;
// let $dataArmors = null;
// let $dataEnemies = null;
// let $dataTroops = null;
// let $dataStates = null;
// let $dataAnimations = null;
// let $dataTilesets = null;
// let $dataCommonEvents = null;
// let $dataSystem = null;
// let $dataMapInfos = null;
// let $dataMap = null;
// let $gameTemp = null;
// let $gameSystem = null;
// let $gameScreen = null;
// let $gameTimer = null;
// let $gameMessage = null;
// let $gameSwitches = null;
// let $gameVariables = null;
// let $gameSelfSwitches = null;
// let $gameActors = null;
// let $gameParty = null;
// let $gameTroop = null;
// let $gameMap = null;
// let $gamePlayer = null;
// let $testEvent = null;

// eval(fs.readFileSync("C:/Proj/LN_MysteryRogueSystem/js/libs/pixi.js").toString());
// eval(fs.readFileSync("C:/Proj/LN_MysteryRogueSystem/js/rmmz_core.js").toString());
// eval(fs.readFileSync("C:/Proj/LN_MysteryRogueSystem/js/rmmz_managers.js").toString());
//eval(fs.readFileSync("C:/Proj/LN_MysteryRogueSystem/js/rmmz_objects.js").toString());


test("Basic1", () => {
    // console.log("DataManager", DataManager);
    // console.log("DataManager.isDatabaseLoaded", DataManager.isDatabaseLoaded());


    // NewGame.
    TestEnv.newGame();

    // Player
    const actor1 = MRLively.world.entity(MRLively.system.mainPlayerEntityId);

    // フロア移動。最初はどこでもないフロアにいるので、マップ遷移が要求される。
    TestEnv.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);

    // 【RMMZ で使うときはこのあたりで $dataMap をロードしたりする】

    // マップ遷移確定。実際にランダムマップ等が生成され、Entity が配置される。
    TestEnv.performFloorTransfer();

    // シミュレーション 1 回実行
    MRSystem.scheduler.stepSimulation();
    
    const dialogContext = MRSystem.dialogContext;
    
    // 方向転換してみる (ターン消費無し)
    {
        // マニュアル操作の Dialog が開かれている
        const dialog1 = dialogContext.activeDialog();
        expect((dialog1 instanceof SPlayerDialog)).toBe(true);
    
        // 向き変更。行動を消費せず Dialog を閉じる
        dialogContext.postActivity(LActivity.makeDirectionChange(actor1, 9));
        dialogContext.activeDialog().submit();
    
        // この時点では向きは変更されていない
        expect(actor1.dir != 9).toBe(true);
        
        // シミュレーション実行
        MRSystem.scheduler.stepSimulation();
        
        // 行動の消費が無いので、再び ManualActionDialog が開かれる。
        // しかし一度閉じているので、違うインスタンスで開かれている。
        expect((dialogContext.activeDialog() instanceof SPlayerDialog)).toBe(true);
        expect((dialog1 != dialogContext.activeDialog())).toBe(true);
    
        // この時点では向きは変更されている
        expect(actor1.dir).toBe(9);
    
    }

    // 一歩下に移動してみる (ターン消費あり)
    {
        dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 2).withConsumeAction());
        dialogContext.activeDialog().submit();
    
        // シミュレーション実行。実際に移動が行われる
        MRSystem.scheduler.stepSimulation();
    
        // 移動後座標チェック
        expect(actor1.mx).toBe(5);
        expect(actor1.my).toBe(6);
    
        // 移動に伴い実行されるべきアニメーション情報も作られている
        expect(TestEnv.activeSequelSet.runs().length).toBe(1);
        expect(TestEnv.activeSequelSet.runs()[0].clips().length).toBe(1);
    }
});
