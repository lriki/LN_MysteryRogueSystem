import { assert, tr2 } from "ts/re/Common";
import { DActionId } from "ts/re/data/DAction";
import { DBasics } from "ts/re/data/DBasics";
import { DEquipmentPartId } from "ts/re/data/DEquipmentPart";
import { DItem } from "ts/re/data/DItem";
import { REData } from "ts/re/data/REData";
import { REResponse } from "ts/re/system/RECommand";
import { RECCMessageCommand, SCommandContext } from "ts/re/system/SCommandContext";
import { RESystem } from "ts/re/system/RESystem";
import { LEntityId } from "../LObject";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { LBehavior } from "./LBehavior";
import { LInventoryBehavior } from "./LInventoryBehavior";
import { LItemBehavior } from "./LItemBehavior";
import { LActivity } from "../activities/LActivity";
import { DParameterId } from "ts/re/data/DParameter";
import { SSoundManager } from "ts/re/system/SSoundManager";
import { SEffectSubject } from "ts/re/system/SEffectContext";
import { testPickOutItem } from "../internal";
import { UIdentify } from "ts/re/usecases/UIdentify";
import { DIdentifiedTiming } from "ts/re/data/DIdentifyer";
import { DTraits } from "ts/re/data/DTraits";
import { UName } from "ts/re/usecases/UName";

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
        return this.equippedItemEntities().map(x => x.getEntityBehavior(LItemBehavior).itemData());
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
        const self = this.ownerEntity();
        const a = this.equippedItemEntities().reduce((r, e) => {
            const data = e.data();
            const rate = self.traitsPi(DTraits.EquipmentProficiency, e.kindDataId());
            const equipment = data.equipment;
            return equipment ? r + ((equipment.parameters[parameterId] ?? 0) * rate) : 0;
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

        for (const entity of this.equippedItemEntities()) {
            const equipment = entity.data().equipment;
            if (equipment) {
                for (const trait of equipment.traits) {
                    result.push(trait);
                }
            }
        }
    }

    
    onActivity(self: LEntity, context: SCommandContext, activity: LActivity): REResponse {
        if (activity.actionId() == DBasics.actions.EquipActionId) {
            this.refreshSlots();

            const itemEntity = activity.object();
            assert(itemEntity);
            //const itemBehavior = itemEntity.getBehavior(LItemBehavior);
            //const equipmentBehavior = itemEntity.getBehavior(LEquipmentBehavior);
            //const itemPart = itemBehavior.itemData().equipmentParts[0];
            const equipment = itemEntity.data().equipment;
            assert(equipment);
            const itemPart = equipment.equipmentParts[0];

            const inventory = self.getEntityBehavior(LInventoryBehavior);
            //const equipmentUser = actor.getBehavior(LEquipmentUserBehavior);


            // まず空きが無いか調べてみる
            let slot = this._slots.find(x => x.partId == itemPart && x.itemEntityId.isEmpty());

            if (slot) {
                // 空きがあればそのまま装備
                this.equipOn(context, self, slot, itemEntity);
            }
            else {
                // 空きが無ければ交換対象を探す
                slot = this._slots.find(x => x.partId == itemPart);
                if (slot) {
                    const localSlot = slot;

                    // まずは外す
                    this.equipOff(context, self, REGame.world.entity(localSlot.itemEntityId))
                        .then(() => {
                            // 外せたら装備する
                            this.equipOn(context, self, localSlot, itemEntity);
                            return true;
                        });
                }
                else {
                    // ここまでで slot が見つからなければ装備不可能
                    context.postMessage(tr2("%1 は装備できない。").format(UName.makeNameAsItem(itemEntity)));
                }
            }
            
            return REResponse.Succeeded;
        }
        else if (activity.actionId() == DBasics.actions.EquipOffActionId) {
            const itemEntity = activity.object();
            this.equipOff(context, self, itemEntity);

            return REResponse.Succeeded;
        }
        return REResponse.Pass;
    }

    private equipOn(context: SCommandContext, self: LEntity, slot: SlotPart2, itemEntity: LEntity): void {
        slot.itemEntityId = itemEntity.entityId();

        this.ownerEntity().refreshConditions();

        UIdentify.identifyByTiming(context, self, itemEntity, DIdentifiedTiming.Equip, false);

        SSoundManager.playEquip();
        context.postMessage(tr2("%1 を装備した。").format(UName.makeNameAsItem(itemEntity)));

        if (itemEntity.isCursed()) {
            context.postMessage(tr2("呪われていた！"));
        }
    }

    private equipOff(context: SCommandContext, self: LEntity, itemEntity: LEntity): RECCMessageCommand {
        return context.post(itemEntity, self, new SEffectSubject(self), undefined, testPickOutItem)
            .then(() => {
                const removed = this.removeEquitment(itemEntity);
                this._revisitonNumber++;
                
                if (removed) {
                    SSoundManager.playEquip();
                    context.postMessage(tr2("%1 をはずした。").format(UName.makeNameAsItem(itemEntity)));
                }
                else {
                    context.postMessage(tr2("何も起こらなかった。"));
                }
                return true;
            });
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
