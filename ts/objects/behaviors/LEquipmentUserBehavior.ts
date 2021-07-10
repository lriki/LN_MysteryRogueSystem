import { assert, tr2 } from "ts/Common";
import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { DEquipmentPartId } from "ts/data/DEquipmentPart";
import { DItem } from "ts/data/DItem";
import { REData } from "ts/data/REData";
import { RECommand, REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { RESystem } from "ts/system/RESystem";
import { LEntityId } from "../LObject";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { LBehavior } from "./LBehavior";
import { LEquipmentBehavior } from "./LEquipmentBehavior";
import { LInventoryBehavior } from "./LInventoryBehavior";
import { LItemBehavior } from "./LItemBehavior";
import { LActivity } from "../activities/LActivity";
import { DParameterId } from "ts/data/DParameter";
import { SSoundManager } from "ts/system/SSoundManager";
import { SEffectSubject } from "ts/system/SEffectContext";
import { testPickOutItem } from "../internal";

interface SlotPart {
    itemEntityIds: LEntityId[];
}

interface SlotPart2 {
    partId: DEquipmentPartId;
    itemEntityId: LEntityId;
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
    private _slots: SlotPart2[] = [];
    private _revisitonNumber: number = 0;

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LEquipmentUserBehavior);
        throw new Error("Not implemented."); // TODO: コピーされたインベントリから参照しないとダメでは？
        return b
    }

    public isEquipped(item: LEntity): boolean {
        const entityId = item.entityId();
        return this._slots.findIndex(part => part.itemEntityId.equals(entityId)) >= 0;
    }

    public equippedItemEntities(): LEntity[] {
        const result: LEntity[] = [];
        for (const part of this._slots) {
            if (part.itemEntityId.hasAny()) {
                result.push(REGame.world.entity(part.itemEntityId));
            }
        }
        return result;
    }
    
    public equippedItems(): DItem[] {
        return this.equippedItemEntities().map(x => x.getBehavior(LItemBehavior).itemData());
    }

    public revisitonNumber(): number {
        return this._revisitonNumber;
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
        actions.push(DBasics.actions.EquipOffActionId);
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

    
    onActivity(self: LEntity, context: SCommandContext, activity: LActivity): REResponse {
        if (activity.actionId() == DBasics.actions.EquipActionId) {
            this.refreshSlots();

            const itemEntity = activity.object();
            assert(itemEntity);
            const itemBehavior = itemEntity.getBehavior(LItemBehavior);
            const equipmentBehavior = itemEntity.getBehavior(LEquipmentBehavior);
            const itemPart = itemBehavior.itemData().equipmentParts[0];

            const inventory = self.getBehavior(LInventoryBehavior);
            //const equipmentUser = actor.getBehavior(LEquipmentUserBehavior);


            // まず空きが無いか調べてみる
            let slot = this._slots.find(x => x.partId == itemPart && x.itemEntityId.isEmpty());

            // 空きが無ければ交換対象を探す
            if (!slot) {
                slot = this._slots.find(x => x.partId == itemPart);
            }

            if (!slot) {
                // ここまでで slot が見つからなければ装備不可能
                context.postMessage(tr2("%1 は装備できない。").format(REGame.identifyer.makeDisplayText(itemEntity)));
            }
            else {
                slot.itemEntityId = itemEntity.entityId();

                this.ownerEntity().refreshStatus();
    
                SSoundManager.playEquip();
                context.postMessage(tr2("%1 を装備した。").format(REGame.identifyer.makeDisplayText(itemEntity)));

                if (itemEntity.isCursed()) {
                    context.postMessage(tr2("呪われていた！"));
                }
            }

            return REResponse.Succeeded;
        }
        else if (activity.actionId() == DBasics.actions.EquipOffActionId) {
            const itemEntity = activity.object();
            
            context.post(itemEntity, self, new SEffectSubject(self), undefined, testPickOutItem)
            .then(() => {
                const removed = this.removeEquitment(itemEntity);
                this._revisitonNumber++;
                
                if (removed) {
                    SSoundManager.playEquip();
                    context.postMessage(tr2("%1 をはずした。").format(REGame.identifyer.makeDisplayText(itemEntity)));
                }
                else {
                    context.postMessage(tr2("何も起こらなかった。"));
                }
                return true;
            });

            return REResponse.Succeeded;
        }
        return REResponse.Pass;
    }
    
    public removeEquitment(itemEntity: LEntity): boolean {
        for (const slot of this._slots) {
            if (slot.itemEntityId.hasAny() && slot.itemEntityId.equals(itemEntity.entityId())) {
                slot.itemEntityId = LEntityId.makeEmpty();
                return true;
            }
        }
        return false;
    }

    private refreshSlots(): void {
        const entity = this.ownerEntity();
        const equipmentSlots = entity.queryProperty(RESystem.properties.equipmentSlots) as DEquipmentPartId[];

        // 現在の状態で、Slot のリストを作る
        const newSlots: SlotPart2[] = equipmentSlots.map(x => { return {partId: x, itemEntityId: LEntityId.makeEmpty()}; });

        // 古い Slot リストから新しい Slot リストへ、同一種類の Slot の Entity を上から順に詰め直す
        for (const newSlot of newSlots) {
            const oldSlot = this._slots.find(x => x.partId == newSlot.partId && x.itemEntityId.hasAny());
            if (oldSlot) {
                [newSlot.itemEntityId, oldSlot.itemEntityId] = [oldSlot.itemEntityId, newSlot.itemEntityId];
            }
        }

        this._slots = newSlots;
        this._revisitonNumber++;
    }
}
