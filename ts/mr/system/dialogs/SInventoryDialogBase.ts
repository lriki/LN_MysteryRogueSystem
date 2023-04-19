import { LBehaviorId } from "ts/mr/lively/LObject";
import { SDialog } from "../SDialog";
import { LEntity } from "ts/mr/lively/LEntity";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { LBehavior } from "ts/mr/lively/internal";
import { assert } from "ts/mr/Common";

export class SInventoryDialogBase extends SDialog {
    private _focusedEntity: LEntity | undefined;
    private _selectedEntities: LEntity[];
    private _multiSelectMode: boolean;
    private _items: LEntity[];

    public readonly inventoryOwner: LEntity;
    public readonly inventory: LInventoryBehavior;

    public multipleSelectionEnabled: boolean;

    public constructor(inventory: LInventoryBehavior) {
        super();
        this.inventoryOwner = inventory.ownerEntity();
        this.inventory = inventory;
        //this.canMultiSelect = canMultiSelect;
        this._focusedEntity = undefined;
        this._selectedEntities = [];
        this._multiSelectMode = false;
        this._items = this.inventory.items;
        this.multipleSelectionEnabled = false;
    }
    
    public get items(): readonly LEntity[] {
        return this._items;
    }

    public get isMultiSelectMode(): boolean {
        return this._multiSelectMode;
    }

    public canMultiSelect(): boolean {
        return false;
    }

    /** カーソル位置の Item */
    public focusedEntity(): LEntity | undefined {
        assert(this._focusedEntity);
        return this._focusedEntity;
    }

    public selectedSingleEntity(): LEntity {
        assert(!this._multiSelectMode);
        assert(this._selectedEntities.length == 1);
        assert(this._selectedEntities[0]);
        return this._selectedEntities[0];
    }

    public selectedEntities(): readonly LEntity[] {
        return this._selectedEntities;
    }

    /** View でカーソル位置が変わった時に呼び出す。 */
    public focusEntity(entity: LEntity): void {
        this._focusedEntity = entity;
        if (!this.isMultiSelectMode) {
            this._selectedEntities[0] = entity;
        }
    }

    public getItemSelectedIndex(entity: LEntity): number {
        return this._selectedEntities.indexOf(entity);
    }

    public toggleMultipeSelection(): void {
        if (this._focusedEntity) {

            if (!this._multiSelectMode) {
                // 最初に複数選択されて、複数選択モードに入る場合は [0] を維持する
                this._multiSelectMode = true;
            }
            else {
                // if (this._selectedEntities.length == 0)
                // 
                
                if (this._selectedEntities.includes(this._focusedEntity)) {
                    this._selectedEntities.mutableRemove(x => x ==this._focusedEntity);
                }
                else {
                    this._selectedEntities.push(this._focusedEntity);
                }
    
                this._multiSelectMode = this._selectedEntities.length > 0;
            }

        }
    }
}
