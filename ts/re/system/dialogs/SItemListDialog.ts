import { DActionId } from "ts/re/data/DAction";
import { REBasics } from "ts/re/data/REBasics";
import { REData } from "ts/re/data/REData";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { LBehaviorId, LEntityId } from "ts/re/objects/LObject";
import { REGame } from "ts/re/objects/REGame";
import { SDialog } from "../SDialog";

export class SItemListDialog extends SDialog {
    private _actorEntityId: LEntityId;
    private _inventoryBehaviorId: LBehaviorId;
    private _selectedEntity: LEntity | undefined;

    public constructor(actorEntity: LEntity, inventory: LInventoryBehavior) {
        super();
        this._actorEntityId = actorEntity.entityId();
        this._inventoryBehaviorId = inventory.id();
    }

    public entity(): LEntity {
        return REGame.world.entity(this._actorEntityId);
    }

    public inventory(): LInventoryBehavior {
        return REGame.world.behavior(this._inventoryBehaviorId) as LInventoryBehavior;
    }

    public setSelectedEntity(entity: LEntity): void {
        this._selectedEntity = entity;
    }

    public selectedEntity(): LEntity | undefined {
        return this._selectedEntity;
    }

    public makeActionList(item: LEntity): DActionId[] {
        const actor = this.entity();
        
        // itemEntity が受け取れる Action を、actor が実行できる Action でフィルタすると、
        // 実際に実行できる Action のリストができる。
        const actions = actor.queryActions();
        const reactions = item.queryReactions();
        const actualActions = reactions
            .filter(actionId => actions.includes(actionId))
            .distinct();

        // コマンドカスタマイズ。
        // ここで行うのはあくまで見た目に関係するもの。
        // Actor や Item が性質として持っている ActionList と、実際に UI からどれを選択できるようにするかは別物なので、
        // 例えば「Item に非表示 Action を持たせる」みたいな案があったが、それはやっぱりおかしいだろう。
        // 操作性はタイトルとして決める。そしてタイトルごとに大きく変えるべきは View。なのでここで対応してみる。
        {
            // [装備] [はずす] チェック
            {
                const equipments = actor.getEntityBehavior(LEquipmentUserBehavior);
                if (equipments.isEquipped(item))
                    actualActions.mutableRemove(x => x == REBasics.actions.EquipActionId);   // [装備] を除く
                else
                    actualActions.mutableRemove(x => x == REBasics.actions.EquipOffActionId);  // [はずす] を除く
            }

            // 足元に何かあれば [置く] を [交換] にする
            {
                const feetEntity = REGame.map.firstFeetEntity(actor);
                if (feetEntity) {
                    if (actualActions.mutableRemove(x => x == REBasics.actions.PutActionId)) {
                        actualActions.push(REBasics.actions.ExchangeActionId);
                    }
                }
            }

            // [撃つ] があれば [投げる] を除く
            {
                if (actualActions.includes(REBasics.actions.ShootingActionId)) {
                    actualActions.mutableRemove(x => x == REBasics.actions.ThrowActionId);
                }
            }
        }

        return SItemListDialog.normalizeActionList(actualActions);
    }

    public static normalizeActionList(actions: DActionId[]): DActionId[] {
        return actions
            .distinct()
            .immutableSort((a, b) => {
                const ad = REData.actions[a];
                const bd = REData.actions[b];
                if (ad.priority == bd.priority) return ad.id - bd.id;
                return bd.priority - ad.priority;   // 降順
            });
    }
}
