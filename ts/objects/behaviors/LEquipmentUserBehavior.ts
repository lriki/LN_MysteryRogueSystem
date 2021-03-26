import { assert, tr2 } from "ts/Common";
import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { DEquipmentPartId } from "ts/data/DEquipmentPart";
import { DItem } from "ts/data/DItem";
import { DParameterId, REData } from "ts/data/REData";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { RESystem } from "ts/system/RESystem";
import { LEntityId } from "../LObject";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { LBehavior } from "./LBehavior";
import { LEquipmentBehavior } from "./LEquipmentBehavior";
import { LInventoryBehavior } from "./LInventoryBehavior";
import { LItemBehavior } from "./LItemBehavior";
import { LEquipActivity } from "../activities/LEquipActivity";
import { LActivity } from "../activities/LActivity";

interface SlotPart {
    itemEntityIds: LEntityId[];
}

/**
 * 装備アイテムを装備できる人。
 * 
 * LInventoryBehavior が必須。
 * 装備アイテムは LInventoryBehavior が持っているものを参照する。
 * この Behavior が装備アイテムEntity の親になることは無い。
 */
export class LEquipmentUserBehavior extends LBehavior {

/*
NOTE:
装備Slot は EquipmentUserBehavior 固有ではなく、外部の情報によって変わる。
代表的なところだと、装備の共鳴による腕輪装備数の増加。
なので必要な任意のタイミングで refresh かけて、slot の変動に合わせて自動的につけ外しする仕組みが無いとダメそう。

*/
    // index is DEquipmentPartId
    private _parts: SlotPart[] = [];
    

    public isEquipped(item: LEntity): boolean {
        const entityId = item.entityId();
        return this._parts.findIndex(part => part && part.itemEntityIds.findIndex(id => id.equals(entityId)) >= 0) >= 0;
    }

    public equippedItemEntities(): LEntity[] {
        const result: LEntity[] = [];
        for (const part of this._parts) {
            if (part) {
                for (const itemId of part.itemEntityIds) {
                    if (itemId.hasAny()) {
                        result.push(REGame.world.entity(itemId));
                    }
                }
            }
        }
        return result;
    }
    
    public equippedItems(): DItem[] {
        return this.equippedItemEntities().map(x => x.getBehavior(LItemBehavior).itemData());
    }
    
    onQueryProperty(propertyId: number): any {
        if (propertyId == RESystem.properties.equipmentSlots) {
            // TODO: とりあえず全部有効にして返してみる
            return REData.equipmentParts
                .filter(x => x.id != 0)
                .map((x) => x.id);
        }
        else
            super.onQueryProperty(propertyId);
    }

    // Game_Actor.prototype.paramPlus
    onQueryIdealParameterPlus(parameterId: DParameterId): number {
        const a = this.equippedItemEntities().reduce((r, e) => {
            const itemBehavior = e.getBehavior(LItemBehavior);
            return r + (itemBehavior.itemData().parameters[parameterId] ?? 0);
        }, 0);

        return a;
    }
    
    onQueryActions(actions: DActionId[]): DActionId[] {
        actions.push(DBasics.actions.EquipActionId);
        return actions;
    }

    onCollectTraits(result: IDataTrait[]): void {
        super.onCollectTraits(result);

        for (const item of this.equippedItems()){
            for (const trait of item.traits){
                result.push(trait);
            }
        }
    }

    
    onActivity(self: LEntity, context: RECommandContext, activity: LActivity): REResponse {
        if (activity instanceof LEquipActivity) {
            this.refreshSlots();

            const itemEntity = activity.object();
            assert(itemEntity);
            const itemBehavior = itemEntity.getBehavior(LItemBehavior);
            const equipmentBehavior = itemEntity.getBehavior(LEquipmentBehavior);
            const itemParts = itemBehavior.itemData().equipmentParts;

            const inventory = self.getBehavior(LInventoryBehavior);
            //const equipmentUser = actor.getBehavior(LEquipmentUserBehavior);

            console.log("itemParts", itemParts);
            console.log("this._parts", this._parts);

            // 候補Part抽出
            // 腕輪2個装備できるときは 腕輪Part が2つとれる。
            const candidateParts = itemParts.filter(partId => this._parts[partId] != undefined);
            assert(candidateParts.length > 0);


            const partId = candidateParts[0];
            const slotList = this._parts[partId].itemEntityIds;

            // 空き Slot を探して格納する
            const freeIndex = slotList.findIndex(x => x.isEmpty());
            if (freeIndex >= 0) {
                slotList[freeIndex] = itemEntity.entityId();
            }
            else {
                // 空きが無ければ 0 番と交換
                slotList[0] = itemEntity.entityId();
            }


            console.log("refresssss");
            this.ownerEntity().refreshStatus();

            context.postMessage(tr2("%1 を装備した。").format(REGame.identifyer.makeDisplayText(itemEntity)));
            return REResponse.Succeeded;
        }
        return REResponse.Pass;
    }

    private refreshSlots(): void {
        const entity = this.ownerEntity();
        const equipmentSlots = entity.queryProperty(RESystem.properties.equipmentSlots) as DEquipmentPartId[];

        let newParts: SlotPart[] = [];

        equipmentSlots.forEach(partId => {
            if (newParts[partId]) {
                newParts[partId].itemEntityIds.push(LEntityId.makeEmpty());
            }
            else {
                newParts[partId] = { itemEntityIds: [LEntityId.makeEmpty()] };
            } 
        });

        // 移し替える
        this._parts.forEach((x, i) => {
            const partId = i;

            x.itemEntityIds.forEach((entityId, j) => {
                const part = newParts[partId];
                if (part.itemEntityIds[j]) {
                    part.itemEntityIds[j] = entityId;
                }
            });
        });

        this._parts = newParts;

    }
}
