// NOTE:
//   https://qiita.com/t-toyota/items/93cce73004b9f765cfcf

import { LUnitBehavior } from "ts/mr/lively/behaviors/LUnitBehavior";
import { SManualActionDialog } from "ts/mr/system/dialogs/SManualDecisionDialog";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "./TestEnv";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";

//import "js/rmmz_objects.js"

//var aaa = require("./../js/rmmz_objects.js");
//(global as any).Game_Temp = aaa.Game_Temp;


/*
const fs = require("fs");
var ttttt = fs.readFileSync("./js/rmmz_objects.js").toString();
//eval(ttttt);

(window as any)["Game_Temp"] = function() {
    // New class name constructor code
};

const gt = Game_Temp;
const proto = Game_Temp.prototype;
(window as any)["Game_Temp"].prototype = Game_Temp.prototype;

(window as any)["Game_Temp"] = gt;
*/



//function Game_Temp() {
    //this.initialize(...arguments);
//}

//eval("function Game_Temp() { }");


//var ss = Game_Temp;

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

/*
class BattlerAttr extends REGame_Attribute {

}
class ActorAttr extends BattlerAttr {
    
}
*/

test("Basic1", () => {
    //const taa = aaa;
    //const t = Game_Temp;
    //const ac = new Game_Temp();
   // const tc = ac._destinationY;
   // ac._destinationX = 1000;

    // NewGame.
    TestEnv.newGame();

    // Player
    const actor1 = MRLively.world.entity(MRLively.system.mainPlayerEntityId);

    // フロア移動。最初はどこでもないフロアにいるので、マップ遷移が要求される。
    MRLively.world.transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);

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
        expect((dialog1 instanceof SManualActionDialog)).toBe(true);
    
        // 向き変更。行動を消費せず Dialog を閉じる
        dialogContext.postActivity(LActivity.makeDirectionChange(actor1, 9));
        dialogContext.activeDialog().submit();
    
        // この時点では向きは変更されていない
        expect(actor1.dir != 9).toBe(true);
        
        // シミュレーション実行
        MRSystem.scheduler.stepSimulation();
        
        // 行動の消費が無いので、再び ManualActionDialog が開かれる。
        // しかし一度閉じているので、違うインスタンスで開かれている。
        expect((dialogContext.activeDialog() instanceof SManualActionDialog)).toBe(true);
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
