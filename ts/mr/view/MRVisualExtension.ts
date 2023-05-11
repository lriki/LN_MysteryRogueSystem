import { assert } from "../Common";
import { SDialog } from "../system/SDialog";
import { VDialog } from "./dialogs/VDialog";

export type OnMapVisualSetupFunc = () => void;
export type OnOpenDialogFunc = (dialog: SDialog) => VDialog | undefined;
export type OnCreateWindowFunc = (name: string, rect: Rectangle) => Window_Base | undefined;

/**
 * NOTE: なぜわざわざプロパティと setter にしている？
 * ----------
 * アップデートで当該の関数が削除された時、 set 時にそれに気づけるようにするため。
 * 特に、 JavaScript(TypeScriptではなく) で拡張機能を作るとき用。
 */
export class MRVisualExtension {
    private _onMapVisualSetup: OnMapVisualSetupFunc = () => {};
    private _onOpenDialog: OnOpenDialogFunc = (model: SDialog) => { return undefined; };
    private _onCreateWindow: OnCreateWindowFunc = (name: string, rect: Rectangle) => { return undefined; };

    public setOnMapVisualSetup(value: OnMapVisualSetupFunc) { assert(this._onMapVisualSetup); this._onMapVisualSetup = value; }
    public get onMapVisualSetup(): OnMapVisualSetupFunc { return this._onMapVisualSetup; }

    /**
     * 指定された SDialog に対して開く VDialog をオーバーライドします。
     * 必要に応じて instanceof で型チェックして、それぞれの VDialog を返すように実装してください。
     */
    public setOnOpenDialog(value: OnOpenDialogFunc) { assert(this._onOpenDialog); this._onOpenDialog = value; }
    public get onOpenDialog(): OnOpenDialogFunc { return this._onOpenDialog; }

    /**
     * プラグイン内で作成されるウィンドウをオーバーライドします。
     */
    public setOnCreateWindow(value: OnCreateWindowFunc) { assert(this._onCreateWindow); this._onCreateWindow = value; }
    public get onCreateWindow(): OnCreateWindowFunc { return this._onCreateWindow; }
}
