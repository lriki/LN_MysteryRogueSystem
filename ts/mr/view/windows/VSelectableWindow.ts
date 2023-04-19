
/**
 * Window_Selectable に対して、MVP の仕組みで使う共通機能を追加したクラス。
 */
export class VISelectableWindow extends Window_Selectable {

    public selectionChanged: () => void = () => { };

    public constructor(rect: Rectangle) {
        super(rect);
    }

    override select(index: number): void {
        super.select(index);
        if (this.selectionChanged) {
            this.selectionChanged();
        }
    };
    
}
