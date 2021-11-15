import { assert, RESerializable, tr2 } from "ts/re/Common";
import { DActionId } from "ts/re/data/DAction";
import { REBasics } from "ts/re/data/REBasics";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LEntity } from "../LEntity";
import { LObject } from "../LObject";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, testPickOutItem } from "./LBehavior";
import { LEquipmentUserBehavior } from "./LEquipmentUserBehavior";
import { LInventoryBehavior } from "./LInventoryBehavior";
import { LItemBehavior } from "./LItemBehavior";


@RESerializable
export class LEquipmentBehavior extends LBehavior {

    /*
    [2021/10/7] 錆スキルなど、ある Entity が内包(装備やインベントリなど)している Entity に対して効果を発揮するスキルはどう実装する？
    ----------
    これもスキルと効果は別に定義したほうがいいかも。
    ```
    錆スキル    ← Unit を対象としたスキル
    ┗武器さび   ← Item を対象とした効果
    ┗盾さび     ← Item を対象とした効果
    ```
    懸念しているのは、対象を選択する条件の複雑さ。
    - 装備のみ対象とするか、イベントり全体か
    - 部位指定
    - 種類指定
    - 同一部位 (腕輪2つ装備できる場合) 全部か1つか
    - 特定印を持つアイテムを優先するか
    パッと思いつくだけでこのくらいある。
    これに加えて、
    - どのパラメータを対象とするか
    - 増減量
    - 振れ幅
    - ダメージ種類
    等、[ダメージ]欄で指定できるようなもの。
    場合によっては[特殊効果]も必要になる。装備しているものを呪う(呪いステート付加)など。

    対象選択条件は、und のkindフィルタのように文字列を並べる方式にせざるを得ないかも。
    フィールドを細かく指定しても、Note 欄が長くなってしまう。

    ```
    <RE-SubTarget: "Equipment Weapon"=kSkill_武器さび>
    <RE-SubTarget: "Equipment Shield"=kSkill_盾さび>
    ```

    ### どこまで Node で頑張るのか？

    - パラメータを変更するもの
    - ステートを操作するもの
        - 特定ステートにかかっていないものに対して、ステートを追加したい
        - 特定ステートがかかっているものに対して、パラメータを操作したい (重篤化みたいな)

    これだけを想定することにしてみる。
    盗んでワープなど、具体的な行動を伴うものは Behavior で実装する。

    ### フィルタキー

    以下は最低限必要かも。
    - 対象の存在している場所 (Equipment, Inventory など。基本的には Behavior の名前)   …ネストは考えなくていいだろう。ありえなくはないが、現状思いつかないし、そこまで凝ったことにこのシステムを使うか？というのもある。やるとしたら Inventory-XXXXとか
    - 対象の種類
    - 対象のステート (追加されている・されていない)
    種類については、大項目とタグで求めるのがいいかもしれない。

    種類…というか分類？については現時点では仕様が固まっていない。
    ので、「タグ」という任意の分類方法を指定できるようにしてみたい。

    その他
    - 個数制限

    効果のある奴だけ自動選択したい。
    たとえば錆スキルでは対象は当然 UpgradeValue を持つものだけ。
    そういったものをあえてフィルタキーで指定させるのは多重管理的な感じにもなり良くない気がする。






    */

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LEquipmentBehavior);
        return b
    }
    
    onAttached(self: LEntity): void {
        assert(this.ownerEntity().findEntityBehavior(LItemBehavior));
        self.params().acquireParam(REBasics.params.upgradeValue);
    }
    
    onQueryReactions(actions: DActionId[]): void {
        actions.push(REBasics.actions.EquipActionId);
        actions.push(REBasics.actions.EquipOffActionId);
    }
    
    onOwnerRemoveFromParent(owner: LObject): void {
        if (!(owner instanceof LEntity)) return;

        const inventory = owner.parentObject();
        if (inventory instanceof LInventoryBehavior) {
            const unit = inventory.ownerEntity();

            const behavior = unit.getEntityBehavior(LEquipmentUserBehavior);
            if (behavior.isEquipped(owner)) {
                const removed = behavior.removeEquitment(this.ownerEntity());
                assert(removed);
            }
        }
        else {
            throw new Error("Not Implemented.");
        }
    }

    [testPickOutItem](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
        const self = args.self;
        if (self.isCursed()) {
            cctx.postMessage(tr2("呪われている！"));
            return SCommandResponse.Canceled;
        }
        else {
            return SCommandResponse.Handled;
        }
    }
    
}
