import { REData } from "ts/re/data/REData";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LItemBehavior } from "ts/re/objects/behaviors/LItemBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { UName } from "ts/re/usecases/UName";



/**
 */
export class VItemListWindow extends Window_Selectable {
    private _inventory: LInventoryBehavior | undefined;;
    private _equipmentUser: LEquipmentUserBehavior | undefined;
    private _entities: LEntity[];
    private _pagenationEnabled: boolean;
    private _currentPageIndex: number;
    private _leftArrowSprite: Sprite | undefined;
    private _rightArrowSprite: Sprite | undefined;

    constructor(rect: Rectangle) {
        super(rect);
        this._entities = [];
        this._pagenationEnabled = true;
        this._currentPageIndex = 0;
        this.createPagenationArrowSprites();
    }

    public get itemsParPage(): number {
        return Math.floor((this.contentsHeight() - this.padding * 2) / this.itemHeight());
    }

    public get maxPageCount(): number {
        return Math.max(Math.floor((this._entities.length - 1) / this.itemsParPage) + 1, 0);
    }

    public setInventory(inventory: LInventoryBehavior): void {
        this._inventory = inventory;
        this._entities = inventory.entities();
        this.refresh();
    }

    public setEquipmentUser(equipmentUser: LEquipmentUserBehavior): void {
        this._equipmentUser = equipmentUser;
    }
    
    selectedItem(): LEntity {
        return this.itemAt(this.index());
    }

    selectedItems(): [LEntity] {
        return [this.itemAt(this.index())];
    }

    // override
    maxCols(): number {
        return 1;
    }

    // override
    maxItems(): number {
        if (this._pagenationEnabled) {
            const left = this.itemsParPage * this._currentPageIndex;
            return Math.max(Math.min(this._entities.length - left, this.itemsParPage), 0);
        }
        else {
            return this._entities.length;
        }
    }
    
    // override
    isCurrentItemEnabled(): boolean {
        return true;
    }

    // override
    refresh(): void {
        // this.makeItemList();
        super.refresh();
        this.refreshPagenationArrows();
        this.updatePagenationArrows();
    }
    
    // override
    drawAllItems(): void {
        if (this.maxItems() <= 0) {
            this.drawText("なにも持っていない", 0, 0, 300, "left");
        }
        else {
            super.drawAllItems();
        }
    }

    // override
    drawItem(index: number): void {
        const item = this.itemAt(index);
        if (item) {
            const numberWidth = this.numberWidth();
            const rect = this.itemLineRect(index);
            this.changePaintOpacity(this.isEnabled(item));
            this.drawEntityItemName(item, rect.x, rect.y, rect.width - numberWidth);
            //this.drawItemNumber(item, rect.x, rect.y, rect.width);
            this.changePaintOpacity(true);
        }
    }

    // override
    cursorRight(wrap: boolean): void {
        if (this._pagenationEnabled) {
            const pageCount = this.maxPageCount;
            if (pageCount <= 1) return;

            this._currentPageIndex++;
            if (this._currentPageIndex >= pageCount) {
                this._currentPageIndex = 0;
            }
            this.correctSelectedIndex();
            this.refresh();
            this.playCursorSound();
        }
        else {
            super.cursorRight(wrap);
        }
    }

    // override
    cursorLeft(wrap: boolean): void {
        if (this._pagenationEnabled) {
            const pageCount = this.maxPageCount;
            if (pageCount <= 1) return;
            
            console.log("pageCount", pageCount);

            this._currentPageIndex--;
            if (this._currentPageIndex < 0) {
                this._currentPageIndex = pageCount - 1;
            }
            console.log("this._currentPageIndex", this._currentPageIndex);
            this.correctSelectedIndex();
            this.refresh();
            this.playCursorSound();
        }
        else {
            super.cursorRight(wrap);
        }
    }

    private correctSelectedIndex(): void {
        const max = this.maxItems();
        if (this.index() > max - 1) {
            this.select(max - 1);
        }
    }

    private isEnabled(item: LEntity): boolean {
        return true;
    }
    
    private numberWidth(): number {
        return this.textWidth("000");
    }

    private itemAt(index: number): LEntity {
        if (this._pagenationEnabled) {
            return this._entities[this._currentPageIndex * this.itemsParPage + index];
        }
        else {
            return this._entities[index];
        }
    }

    // private makeItemList(): void {
    // }
    
    private drawEntityItemName(item: LEntity, x: number, y: number, width: number): void {
        if (item) {
            const iconY = y + (this.lineHeight() - ImageManager.iconHeight) / 2;
            const nameX = x + ImageManager.iconWidth;
            const desc = UName.makeNameAsItem(item);

            // State Icon
            {
            }

            // Item Icon
            // Name
            {
                const textMargin = ImageManager.iconWidth * 2 + 4;

                const itemWidth = Math.max(0, width - textMargin);
                this.resetTextColor();

                this.drawTextEx(desc, nameX, y, itemWidth);

                // 装備していればアイコンを表示する
                if (this._equipmentUser && this._equipmentUser.isEquipped(item)) {
                    this.drawIcon(12, nameX, iconY);
                }

                // メッキ状態アイコンを表示する
                if (item.isStateAffected(REData.system.states.plating)) {
                    this.drawIcon(13, nameX, iconY);
                }
            }

            // 値札
            const itemBehavior = item.findEntityBehavior(LItemBehavior);
            if (itemBehavior && itemBehavior.shopStructureId() > 0) {
                const price = item.queryPrice();
                const text = price.cellingPrice.toString();
                const tw = this.textWidth(text) + 8;
                const size = this.textSizeEx(text);
                const th = size.height - 4;
                const ty = y + (this.lineHeight() - th) / 2;
                const tx = width - tw + 4;
                this.changeTextColor(ColorManager.textColor(29));
                this.drawRect(tx, ty, tw, th);
                this.drawTextEx(text, width - tw, ty, tw);
            }
        }
    }

    private createPagenationArrowSprites(): void {
        this._leftArrowSprite = new Sprite(undefined);
        this.addChild(this._leftArrowSprite);
        this._rightArrowSprite = new Sprite(undefined);
        this.addChild(this._rightArrowSprite);
    }

    private refreshPagenationArrows(): void {
        const w = this.width;
        const h = this.height;
        const p = 24;
        const q = p / 2;
        const sx = 96 + p;
        const sy = 24 + q;
        if (this._leftArrowSprite) {
            this._leftArrowSprite.bitmap = this.windowskin;
            this._leftArrowSprite.anchor.x = 0.5;
            this._leftArrowSprite.anchor.y = 0.5;
            this._leftArrowSprite.setFrame(sx, sy, q, p);
            this._leftArrowSprite.move(q, h / 2);
        }
        if (this._rightArrowSprite) {
            this._rightArrowSprite.bitmap = this.windowskin;
            this._rightArrowSprite.anchor.x = 0.5;
            this._rightArrowSprite.anchor.y = 0.5;
            this._rightArrowSprite.setFrame(sx + p + q, sy, q, p);
            this._rightArrowSprite.move(w - q, h / 2);
        }
    }

    private updatePagenationArrows(): void {
        if (!this._leftArrowSprite) return;
        if (!this._rightArrowSprite) return;

        this._leftArrowSprite.visible = false;
        this._rightArrowSprite.visible = false;

        if (this._pagenationEnabled) {
            if (this._currentPageIndex > 0) {
                this._leftArrowSprite.visible = true;
            }
            if (this._currentPageIndex < this.maxPageCount - 1) {
                this._rightArrowSprite.visible = true;
            }
        }
    }
}

