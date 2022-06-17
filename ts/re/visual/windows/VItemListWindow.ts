import { assert } from "ts/re/Common";
import { MRData } from "ts/re/data/MRData";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { LItemBehavior } from "ts/re/objects/behaviors/LItemBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { UName } from "ts/re/usecases/UName";

export class VItemListWindowItem {
    public entity: LEntity;
    public selectedIndex: number | undefined;
    
    constructor(item: LEntity) {
        this.entity = item;
        this.selectedIndex = undefined;
    }
}

export enum VItemListPriceTag {
    None,
    SellingPrice,
    PurchasePrice,
}

/**
 */
export class VItemListWindow extends Window_Selectable {
    private _inventory: LInventoryBehavior | undefined;;
    private _equipmentUser: LEquipmentUserBehavior | undefined;
    private _items: VItemListWindowItem[];
    private _pagenationEnabled: boolean;
    private _currentPageIndex: number;
    private _leftArrowSprite: Sprite | undefined;
    private _rightArrowSprite: Sprite | undefined;

    public multipleSelectionEnabled: boolean;
    public priceTag: VItemListPriceTag;

    constructor(rect: Rectangle) {
        super(rect);
        this._items = [];
        this._pagenationEnabled = true;
        this._currentPageIndex = 0;
        this.multipleSelectionEnabled = false;
        this.priceTag = VItemListPriceTag.None;
        this.createPagenationArrowSprites();
    }

    public get itemsParPage(): number {
        return Math.floor((this.contentsHeight() - this.padding * 2) / this.itemHeight());
    }

    public get maxPageCount(): number {
        return Math.max(Math.floor((this._items.length - 1) / this.itemsParPage) + 1, 0);
    }

    public getActualPriceTag(item: LEntity): VItemListPriceTag {
        if (this.priceTag != VItemListPriceTag.None) {
            return this.priceTag;
        }
        else {
            const itemBehavior = item.findEntityBehavior(LItemBehavior);
            if (itemBehavior && itemBehavior.shopStructureId() > 0) {
                return VItemListPriceTag.SellingPrice;
            }
            else {
                return VItemListPriceTag.None;
            }
        }
    }
    
    public setInventory(inventory: LInventoryBehavior): void {
        this._inventory = inventory;
        this.refreshItems();
    }

    public refreshItems(): void {
        if (this._inventory) {
            this._items = this._inventory.items.map(x => new VItemListWindowItem(x));
            this.refresh();
        }
    }

    public setEquipmentUser(equipmentUser: LEquipmentUserBehavior): void {
        this._equipmentUser = equipmentUser;
    }
    
    public selectedItem(): LEntity {
        return this.itemAt(this.index()).entity;
    }

    public isMultipleSelecting(): boolean {
        return this._items.find(x => x.selectedIndex !== undefined) !== undefined;
    }

    public getSelectedItems(): LEntity[] {
        const result: VItemListWindowItem[] = [];
        
        // まずは複数選択状態の Item を探してみる
        for (const item of this._items) {
            if (item.selectedIndex !== undefined) {
                result.push(item);
            }
        }

        if (result.length == 0) {
            // もしひとつも選択状態ないなら、カーソル位置の Item を返す
            return [this.itemAt(this.index()).entity];
        }
        else {
            // 選択された順で返す
            const items = result.sort((a, b) => {
                assert(a.selectedIndex !== undefined);
                assert(b.selectedIndex !== undefined);
                return a.selectedIndex - b.selectedIndex;
            });
            return items.map(x => x.entity);
        }
    }

    // override
    maxCols(): number {
        return 1;
    }

    // override
    maxItems(): number {
        if (this._pagenationEnabled) {
            const left = this.itemsParPage * this._currentPageIndex;
            return Math.max(Math.min(this._items.length - left, this.itemsParPage), 0);
        }
        else {
            return this._items.length;
        }
    }
    
    // override
    isCurrentItemEnabled(): boolean {
        return true;
    }

    // override
    // 表示を更新したいときに呼ぶ。選択状態までリセットされてほしくないので、この中でアイテムリストの再構築は行わない。
    // アイテムリストの再構築をしたいときは refreshItems() を使うこと。
    refresh(): void {
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
            const numberWidth = 0;//this.numberWidth();
            const rect = this.itemLineRect(index);
            this.changePaintOpacity(true);
            this.drawEntityItemName(item, rect.x, rect.y, rect.width - numberWidth);
            //this.drawItemNumber(item, rect.x, rect.y, rect.width);
            this.changePaintOpacity(true);
        }
    }

    // override
    update(): void {
        super.update();
        if (Input.isTriggered("pageup")) {
            if (this.multipleSelectionEnabled) {
                this.toggleItemSelection(this.itemAt(this.index()));
            }
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

            this._currentPageIndex--;
            if (this._currentPageIndex < 0) {
                this._currentPageIndex = pageCount - 1;
            }
            this.correctSelectedIndex();
            this.refresh();
            this.playCursorSound();
        }
        else {
            super.cursorRight(wrap);
        }
    }

    private toggleItemSelection(item: VItemListWindowItem): void {
        if (item.selectedIndex === undefined) {
            // 新しく選択する
            let maxIndex = -1;
            for (const item of this._items) {
                if (item.selectedIndex !== undefined) {
                    maxIndex = Math.max(maxIndex, item.selectedIndex);
                }
            }
            item.selectedIndex = maxIndex + 1;
        }
        else {
            // 選択解除
            const removeIndex = item.selectedIndex;
            for (const item of this._items) {
                if (item.selectedIndex !== undefined && item.selectedIndex > removeIndex) {
                    item.selectedIndex -= 1;
                }
            }
            item.selectedIndex = undefined;
        }
        this.playCursorSound();
        this.paint();
    }

    private correctSelectedIndex(): void {
        const max = this.maxItems();
        if (this.index() > max - 1) {
            this.select(max - 1);
        }
    }
    
    private numberWidth(): number {
        return this.textWidth("000");
    }

    private itemAt(index: number): VItemListWindowItem {
        if (this._pagenationEnabled) {
            return this._items[this._currentPageIndex * this.itemsParPage + index];
        }
        else {
            return this._items[index];
        }
    }

    // private makeItemList(): void {
    // }
    
    private drawEntityItemName(item: VItemListWindowItem, x: number, y: number, width: number): void {
        if (item) {
            const entity = item.entity;
            const iconY = y + (this.lineHeight() - ImageManager.iconHeight) / 2;
            const nameX = x + ImageManager.iconWidth;
            const desc = UName.makeNameAsItem(entity);


            if (item.selectedIndex !== undefined) {
                const size =  this.contents.fontSize;
                this.contents.fontSize = 16;
                this.drawText((item.selectedIndex + 1), x - 4, y - 6, 100, "left");
                this.contents.fontSize = size;
            }

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
                if (this._equipmentUser && (this._equipmentUser.isEquipped(entity) || this._equipmentUser.isShortcutEquipped(entity))) {
                    this.drawIcon(12, nameX, iconY);
                }

                // メッキ状態アイコンを表示する
                if (entity.isStateAffected(MRData.system.states.plating)) {
                    this.drawIcon(13, nameX, iconY);
                }
            }

            // 値札
            const priceTag = this.getActualPriceTag(entity);
            if (priceTag != VItemListPriceTag.None) {
                const price = entity.queryPrice();
                const value = (priceTag == VItemListPriceTag.SellingPrice) ? price.sellingPrice : price.purchasePrice;
                const text = value.toString();
                const tw = this.textWidth(text);
                const size = this.textSizeEx(text);
                const th = size.height - 4;

                // Label rect
                const labelPaddingV = 2; // Top & Bottom
                const labelPaddingH = 8; // Left & Right
                const labelH = this.lineHeight() - labelPaddingV * 2;
                const labelW = tw + labelPaddingH * 2;
                const labelX = x + width - labelW;
                const labelY = y + labelPaddingV;

                // Label backgroud
                this.changeTextColor(ColorManager.textColor(29));
                this.drawRect(labelX, labelY, labelW, labelH);

                const textPaddingV = 0; // Top & Bottom
                const textPaddingH = 8;
                const textY = y + textPaddingV;
                const textX = labelX + textPaddingH;
                this.drawTextEx(text, textX, textY, tw);
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

