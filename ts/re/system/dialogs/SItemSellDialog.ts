import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { LBehaviorId, LEntityId } from "ts/re/objects/LObject";
import { REGame } from "ts/re/objects/REGame";
import { UInventory } from "ts/re/usecases/UInventory";
import { RESystem } from "../RESystem";
import { SDialog } from "../SDialog";

export class SItemSellDialog extends SDialog {
    private _userEntityId: LEntityId;
    private _inventoryBehaviorId: LBehaviorId;
    private _resultItems: LEntityId[];

    public constructor(user: LEntity) {
        super();
        this._userEntityId = user.entityId();
        this._inventoryBehaviorId = user.getEntityBehavior(LInventoryBehavior).id();
        this._resultItems = [];
    }

    public get user(): LEntity {
        return REGame.world.entity(this._userEntityId);
    }

    public get inventory(): LInventoryBehavior {
        return REGame.world.behavior(this._inventoryBehaviorId) as LInventoryBehavior;
    }

    public setResultItems(items: LEntity[]) {
        this._resultItems = items.map(e => e.entityId());
    }

    public resultItems(): LEntity[] {
        return this._resultItems.map(e => REGame.world.entity(e));
    }
    
    public submitSell(): void {
        UInventory.postSellItemsAndDestroy(RESystem.commandContext, this.user, this.resultItems());
        this.submit();
    }
}
