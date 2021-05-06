import { assert, tr } from "ts/Common";
import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { REData } from "ts/data/REData";
import { REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { SEffectContext } from "ts/system/SEffectContext";
import { RESystem } from "ts/system/RESystem";
import { CommandArgs, LBehavior, onWalkedOnTopReaction } from "./LBehavior";
import { LItemBehavior } from "./LItemBehavior";


/**
 */
export class LTrapBehavior extends LBehavior {
    private _exposed: boolean = false;

    constructor() {
        super();
    }

    /**
     * 露出しているかどうか。
     * 罠が踏まれたり、空振りや魔法弾の通過で発見された状態で、勢力に関わらず可視である。
     */
    public exposed(): boolean {
        return this._exposed;
    }

    //public setExposed(value: boolean): void {
    //    this._exposed = value;
    //}

    public trapName(): string {
        const itemId = this.ownerEntity().queryProperty(RESystem.properties.itemId) as number;
        const item = REData.items[itemId];
        return item.name;
    }
    
    onQueryActions(actions: DActionId[]): DActionId[] {
        const result = actions.filter(x => x != DBasics.actions.PickActionId);
        return result;
    }

    onAttached(): void {
        assert(this.ownerEntity().findBehavior(LItemBehavior));
    }
    
    [onWalkedOnTopReaction](e: CommandArgs, context: SCommandContext): REResponse {


        this._exposed = true;


        context.postMessage(tr("{0} を踏んだ！", this.trapName()));


        const trapItem = this.ownerEntity().getBehavior(LItemBehavior);
        const itemData = trapItem.itemData();

        const target = e.sender;
        const effectContext = new SEffectContext(e.self, itemData.scope, itemData.effect);




        //console.log(result);


        context.postAnimation(e.sender, 35, true);

        // TODO: ここでラムダ式も post して apply したい。

        context.postCall(() => {
            effectContext.applyWithWorth(context, [target]);
        });



        //context.postMessage(tr("しかし ワナには かからなかった。"));
        
        return REResponse.Pass;
    }
}

