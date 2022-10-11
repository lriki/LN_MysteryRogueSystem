import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { LEntity } from "ts/mr/lively/LEntity";
import { LBehaviorId, LEntityId } from "ts/mr/lively/LObject";
import { MRLively } from "ts/mr/lively/MRLively";
import { UInventory } from "ts/mr/utility/UInventory";
import { MRSystem } from "../MRSystem";
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
        return MRLively.world.entity(this._serviceProviderId);
    }

    public get serviceUser(): LEntity {
        return MRLively.world.entity(this._serviceUserId);
    }

    public get inventory(): LInventoryBehavior {
        return MRLively.world.behavior(this._inventoryId) as LInventoryBehavior;
    }

    public get resultItems(): LEntity[] {
        return this._resultItems.map(e => MRLively.world.entity(e));
    }

    public setResultItems(items: LEntity[]) {
        this._resultItems = items.map(e => e.entityId());
    }

    
    public submitSell(): void {
        UInventory.postSellItemsAndDestroy(MRSystem.commandContext, this.serviceUser, this.resultItems);
        this.submit();
    }
}
