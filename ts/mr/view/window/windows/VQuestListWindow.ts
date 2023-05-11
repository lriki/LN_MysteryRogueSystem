
export class VQuestListWindow extends Window_Selectable {
    public constructor(rect: Rectangle) {
        super(rect);
        this.refresh();
    }

    override maxItems(): number {
        return 4;
    }
    
    override drawItem(index: number): void {
        const rect = this.itemLineRect(index);
        this.drawIcon(100 + index, rect.x, rect.y);
    }
}