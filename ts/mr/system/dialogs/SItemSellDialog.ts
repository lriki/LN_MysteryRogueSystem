import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LEntity } from "ts/mr/lively/LEntity";
import { LBehaviorId, LEntityId } from "ts/mr/lively/LObject";
import { REGame } from "ts/mr/lively/REGame";
import { UInventory } from "ts/mr/usecases/UInventory";
import { RESystem } from "../RESystem";
import { SDialog } from "../SDialog";

export class SItemSellDialog extends SDialog {
    private _serviceProviderId: LEntityId;
    private _serviceUserId: LEntityId;
    private _inventoryId: LBehaviorId;
    private _resultItems: LEntityId[];

    public constructor(serviceProvider: LEntity, serviceUser: LEntity, inventoryHolder: LEntity) {
        super();
        this._serviceProviderId = serviceProvider.entityId();
        this._serviceUserId = serviceUser.entityId();
        this._inventoryId = inventoryHolder.getEntityBehavior(LInventoryBehavior).id();
        this._resultItems = [];
    }

    public get serviceProvider(): LEntity {
        return REGame.world.entity(this._serviceProviderId);
    }

    public get serviceUser(): LEntity {
        return REGame.world.entity(this._serviceUserId);
    }

    public get inventory(): LInventoryBehavior {
        return REGame.world.behavior(this._inventoryId) as LInventoryBehavior;
    }

    public get resultItems(): LEntity[] {
        return this._resultItems.map(e => REGame.world.entity(e));
    }

    public setResultItems(items: LEntity[]) {
        this._resultItems = items.map(e => e.entityId());
    }

    
    public submitSell(): void {
        UInventory.postSellItemsAndDestroy(RESystem.commandContext, this.serviceUser, this.resultItems);
        this.submit();
    }
}
