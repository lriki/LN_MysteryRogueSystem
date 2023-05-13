
export class VLayoutDef {
    // 上部のパーティ情報及びログウィンドウ領域
    public static readonly PartyInfoWindowHeight = 100;

    // フロア番号表示領域の幅
    public static readonly FloorFieldWidth = 120;
    public static readonly FloorFieldHeight = 40;
    public static readonly FloorFieldX = 8;
    public static readonly FloorFieldY = 10;

    // ゴールド表示領域
    public static readonly GoldFieldWidth = 120;
    public static readonly GoldFieldY = 42;
    public static get GoldFieldX() { return Graphics.boxWidth - 140; }

    // メニューボタンの幅
    public static readonly MenuButtonWidth = 60;

    public static get MessageAreaX() {
        return VLayoutDef.FloorFieldWidth;
    }

    public static get MessageAreaWidth() {
        return Graphics.boxWidth - VLayoutDef.MenuButtonWidth - VLayoutDef.FloorFieldWidth;
    }
}

