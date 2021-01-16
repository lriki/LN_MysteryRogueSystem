import { assert, tr2 } from "ts/Common";
import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { DEquipmentPartId } from "ts/data/DEquipmentPart";
import { DParameterId, REData } from "ts/data/REData";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { RESystem } from "ts/system/RESystem";
import { eqaulsEntityId, LEntityId } from "../LObject";
import { REGame } from "../REGame";
import { REGame_Entity } from "../REGame_Entity";
import { LBehavior } from "./LBehavior";
import { LEquipmentBehavior } from "./LEquipmentBehavior";
import { LInventoryBehavior } from "./LInventoryBehavior";
import { LItemBehavior } from "./LItemBehavior";

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
    

    public isEquipped(item: REGame_Entity): boolean {
        const entityId = item.id();
        return this._parts.findIndex(part => part && part.itemEntityIds.findIndex(id => eqaulsEntityId(id, entityId)) >= 0) >= 0;
    }

    public equippedItemEntities(): REGame_Entity[] {
        const result: REGame_Entity[] = [];
        for (const part of this._parts) {
            if (part) {
                for (const itemId of part.itemEntityIds) {
                    if (itemId.index > 0) {
                        result.push(REGame.world.entity(itemId));
                    }
                }
            }
        }
        return result;
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

        console.log("onQueryIdealParameterPlus", parameterId, a);
        return a;
    }
    
    onQueryActions(actions: DActionId[]): DActionId[] {
        actions.push(DBasics.actions.EquipActionId);
        return actions;
    }

    
    onAction(actor: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {
        
        if (cmd.action().id == DBasics.actions.EquipActionId) {
            this.refreshSlots();

            const itemEntity = cmd.reactor();
            assert(itemEntity);
            const itemBehavior = itemEntity.getBehavior(LItemBehavior);
            const equipmentBehavior = itemEntity.getBehavior(LEquipmentBehavior);
            const itemParts = itemBehavior.itemData().equipmentParts;

            const inventory = actor.getBehavior(LInventoryBehavior);
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
            const freeIndex = slotList.findIndex(x => x.index == 0);
            if (freeIndex >= 0) {
                slotList[freeIndex] = itemEntity.id();
            }
            else {
                // 空きが無ければ 0 番と交換
                slotList[0] = itemEntity.id();
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
                newParts[partId].itemEntityIds.push({index: 0, key: 0});
            }
            else {
                newParts[partId] = { itemEntityIds: [{index: 0, key: 0}] };
            } 
        });
        
        console.log("equipmentSlots", equipmentSlots);
        console.log("newParts",newParts);
        

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
