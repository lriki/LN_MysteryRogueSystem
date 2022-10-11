import { assert, MRSerializable, tr2 } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import { DEquipmentPartId } from "ts/mr/data/DEquipmentPart";
import { MRData } from "ts/mr/data/MRData";
import { SCommandResponse } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { MRSystem } from "ts/mr/system/MRSystem";
import { LEntityId } from "../LObject";
import { MRLively } from "../MRLively";
import { LEntity } from "../LEntity";
import { LBehavior } from "./LBehavior";
import { DAnimationId, DParameterId } from "ts/mr/data/DCommon";
import { SSoundManager } from "ts/mr/system/SSoundManager";
import { SEffectSubject } from "ts/mr/system/SEffectContext";
import { testPickOutItem } from "../internal";
import { UIdentify } from "ts/mr/utility/UIdentify";
import { DIdentifiedTiming } from "ts/mr/data/DIdentifyer";
import { UName } from "ts/mr/utility/UName";
import { SActivityContext } from "ts/mr/system/SActivityContext";
import { DActionId, DSubComponentEffectTargetKey } from "ts/mr/data/DCommon";
import { LEventResult } from "../LEventServer";
import { DEventId, ItemRemovedFromInventoryArgs } from "ts/mr/data/predefineds/DBasicEvents";
import { STask } from "ts/mr/system/tasks/STask";

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
 @MRSerializable
 export class LEquipmentUserBehavior extends LBehavior {

/*
NOTE:
装備Slot は EquipmentUserBehavior 固有ではなく、外部の情報によって変わる。
代表的なところだと、装備の共鳴による腕輪装備数の増加。
なので必要な任意のタイミングで refresh かけて、slot の変動に合わせて自動的につけ外しする仕組みが無いとダメそう。

*/
    private _slots: SlotPart2[];
    private _shortcutItemEntityId: LEntityId;
    private _revisitonNumber: number;

    public constructor() {
        super();
        this._slots = [];
        this._shortcutItemEntityId = LEntityId.makeEmpty();
        this._revisitonNumber = 0;
    }

    onAttached(self: LEntity): void {
        MRLively.eventServer.subscribe(MRBasics.events.itemRemovedFromInventory, this);
    }

    onDetached(self: LEntity): void {
        MRLively.eventServer.unsubscribe(MRBasics.events.itemRemovedFromInventory, this);
    }
    
    onEvent(cctx: SCommandContext, eventId: DEventId, args: any): LEventResult {
        if (eventId == MRBasics.events.itemRemovedFromInventory) {
            this.onRemoveItemFromInventory((args as ItemRemovedFromInventoryArgs).item);
        }
        return LEventResult.Pass;
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LEquipmentUserBehavior);
        throw new Error("Not implemented."); // TODO: コピーされたインベントリから参照しないとダメでは？
        return b;
    }

    public isEquipped(item: LEntity): boolean {
        const entityId = item.entityId();
        return this._slots.findIndex(part => part.itemEntityId.equals(entityId)) >= 0;
    }

    public isShortcutEquipped(item: LEntity): boolean {
        return this._shortcutItemEntityId.equals(item.entityId());
    }

    // public get hasShortcut(): boolean {
    //     return this._shortcutItemEntityId.hasAny();
    // }

    public get shortcutItem(): LEntity | undefined {
        if (this._shortcutItemEntityId.hasAny()) {
            return MRLively.world.entity(this._shortcutItemEntityId);
        }
        return undefined;
    }

    public equippedItemEntities(): LEntity[] {
        const result: LEntity[] = [];
        for (const part of this._slots) {
            if (part.itemEntityId.hasAny()) {
                result.push(MRLively.world.entity(part.itemEntityId));
            }
        }
        return result;
    }

    public revisitonNumber(): number {
        return this._revisitonNumber;
    }
    
    public onQuerySubEntities(key: DSubComponentEffectTargetKey, result: LEntity[]): void {
        if (key.path == "Equipped") {
            for (const item of this.equippedItemEntities()) {

                if (key.kindId) {
                    if (key.kindId == item.kindDataId()) {
                        result.push(item);
                    }
                }
                else {
                    result.push(item);
                }
            }
        }
    }

    // item が持つ paramId の増減量を計算する。
    // ステータスウィンドウの表示でも使うので、ここでは熟練度は考慮しない。
    public static calcEquipmentParam(item: LEntity, paramId: DParameterId): number {
        const data = item.data;
        const equipmentData = data.equipment;
        if (equipmentData) {
            const upgrade = item.actualParam(MRBasics.params.upgradeValue);
            const ep = equipmentData.parameters[paramId];
            if (ep) {
                return (ep.value + (upgrade * ep.upgradeRate));
            }
            else {
                // 最大TPなど、RMMZ 標準では存在しないパラメータに対して要求が来ることもあるので、その場合はなにもしない
                return 0;
            }
        }
        else {
            return 0;
        }
    }
    
    onQueryProperty(propertyId: number): any {
        if (propertyId == MRSystem.properties.equipmentSlots) {
            // TODO: とりあえず全部有効にして返してみる
            return MRData.equipmentParts
                .filter(x => x.id != 0)
                .map((x) => x.id);
        }
        else
            super.onQueryProperty(propertyId);
    }

    // Game_Actor.prototype.paramPlus
    onQueryIdealParameterPlus(paramId: DParameterId): number {
        const self = this.ownerEntity();
        const a = this.equippedItemEntities().reduce((r, e) => {
            const proficiency = self.traitsPi(MRBasics.traits.EquipmentProficiency, e.kindDataId());
            return r + LEquipmentUserBehavior.calcEquipmentParam(e, paramId) * proficiency;
        }, 0);

        return a;
    }
    
    onQueryActions(actions: DActionId[]): DActionId[] {
        actions.push(MRBasics.actions.EquipActionId);
        actions.push(MRBasics.actions.EquipOffActionId);
        return actions;
    }

    override onQueryAttackAnimationId(self: LEntity, index: number): DAnimationId | undefined {
        if (index == 0) {
            for (const item of this.equippedItemEntities()) {
                if (item.data.equipment) {
                    return item.data.equipment.targetRmmzAnimationId;
                }
            }
        }
        return undefined;
    }

    onCollectTraits(self: LEntity, result: IDataTrait[]): void {
        super.onCollectTraits(self, result);

        for (const entity of this.equippedItemEntities()) {
            for (const trait of entity.data.equippedTraits()) {
                result.push(trait);
            }
        }
    }

    
    onActivity(self: LEntity, cctx: SCommandContext, actx: SActivityContext): SCommandResponse {
        const activity = actx.activity();
        if (activity.actionId() == MRBasics.actions.EquipActionId) {
            this.refreshSlots();

            const itemEntity = activity.object();
            assert(itemEntity);
            const equipment = itemEntity.data.equipment;
            if (equipment) {
                // 武器、盾などの通常の装備アイテム
                const itemPart = equipment.equipmentPart;
                assert(itemPart > 0);

                // まず空きが無いか調べてみる
                let slot = this._slots.find(x => x.partId == itemPart && x.itemEntityId.isEmpty());
    
                if (slot) {
                    // 空きがあればそのまま装備
                    this.equipOn(cctx, self, slot, itemEntity);
                }
                else {
                    // 空きが無ければ交換対象を探す
                    slot = this._slots.find(x => x.partId == itemPart);
                    if (slot) {
                        const localSlot = slot;
    
                        // まずは外す
                        this.postEquipOff(cctx, self, MRLively.world.entity(localSlot.itemEntityId))
                            .then(() => {
                                // 外せたら装備する
                                this.equipOn(cctx, self, localSlot, itemEntity);
                                return true;
                            });
                    }
                    else {
                        // ここまでで slot が見つからなければ装備不可能
                        cctx.postMessage(tr2("%1 は装備できない。").format(UName.makeNameAsItem(itemEntity)));
                    }
                }
            }
            else {
                // 装備アイテムではないものを装備しようとしたときはショートカットに登録する
                this.equipOnShortcut(cctx, itemEntity);
            }
            
            return SCommandResponse.Handled;
        }
        else if (activity.actionId() == MRBasics.actions.EquipOffActionId) {
            const itemEntity = activity.object();
            if (this._shortcutItemEntityId.equals(itemEntity.entityId())) {
                this.equipOffShortcut(cctx, itemEntity);
            }
            else {
                this.postEquipOff(cctx, self, itemEntity);
            }
            return SCommandResponse.Handled;
        }
        return SCommandResponse.Pass;
    }

    // テスト用ユーティリティ
    public equipOnUtil(itemEntity: LEntity): void {
        this.refreshSlots();
        const equipment = itemEntity.data.equipment;
        assert(equipment);
        const itemPart = equipment.equipmentPart;
        // let slot = this._slots.find(x => x.partId == itemPart && x.itemEntityId.isEmpty());
        const slot = this._slots.find(x => x.partId == itemPart);
        assert(slot);
        slot.itemEntityId = itemEntity.entityId();
        this.ownerEntity().refreshConditions();
    }

    private equipOn(cctx: SCommandContext, self: LEntity, slot: SlotPart2, itemEntity: LEntity): void {
        slot.itemEntityId = itemEntity.entityId();

        this.ownerEntity().refreshConditions();

        UIdentify.identifyByTiming(cctx, self, itemEntity, DIdentifiedTiming.Equip, false);

        SSoundManager.playEquip();
        cctx.postMessage(tr2("%1 を装備した。").format(UName.makeNameAsItem(itemEntity)));

        if (itemEntity.isCursed()) {
            cctx.postMessage(tr2("呪われていた！"));
        }
    }

    private postEquipOff(cctx: SCommandContext, self: LEntity, itemEntity: LEntity): STask {
        return cctx.post(itemEntity, self, new SEffectSubject(self), undefined, testPickOutItem)
            .then(() => {
                const removed = this.removeEquitment(itemEntity);
                
                if (removed) {
                    SSoundManager.playEquip();
                    cctx.postMessage(tr2("%1 をはずした。").format(UName.makeNameAsItem(itemEntity)));
                }
                else {
                    cctx.postMessage(tr2("何も起こらなかった。"));
                }
                return true;
            });
    }
    
    public removeEquitment(itemEntity: LEntity): boolean {
        for (const slot of this._slots) {
            if (slot.itemEntityId.hasAny() && slot.itemEntityId.equals(itemEntity.entityId())) {
                slot.itemEntityId = LEntityId.makeEmpty();
                this._revisitonNumber++;
                return true;
            }
        }
        return false;
    }

    public removeShortcut(itemEntity: LEntity): boolean {
        if (this._shortcutItemEntityId.hasAny() && this._shortcutItemEntityId.equals(itemEntity.entityId())) {
            this._shortcutItemEntityId = LEntityId.makeEmpty();
            return true;
        }
        return false;
    }

    public equipOnShortcut(cctx: SCommandContext, item: LEntity): void {
        this._shortcutItemEntityId = item.entityId();
        SSoundManager.playEquip();
        cctx.postMessage(tr2("%1 を装備した。").format(UName.makeNameAsItem(item)));
    }

    public equipOffShortcut(cctx: SCommandContext, itemEntity: LEntity): void {
        if (this._shortcutItemEntityId.equals(itemEntity.entityId())) {
            SSoundManager.playEquip();
            cctx.postMessage(tr2("%1 をはずした。").format(UName.makeNameAsItem(itemEntity)));
            this._shortcutItemEntityId = LEntityId.makeEmpty();
        }
    }

    public onRemoveItemFromInventory(item: LEntity): void {
        if (item.entityId().equals(this._shortcutItemEntityId)) {
            this._shortcutItemEntityId = LEntityId.makeEmpty();
        }
        else {
            this.removeEquitment(item);
        }
    }

    private refreshSlots(): void {
        const entity = this.ownerEntity();
        const equipmentSlots = entity.queryProperty(MRSystem.properties.equipmentSlots) as DEquipmentPartId[];

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
