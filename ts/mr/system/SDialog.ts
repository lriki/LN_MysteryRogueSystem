import { LFloorId } from "ts/mr/lively/LFloorId";
import { assert } from "../Common";
import { LEntity } from "../lively/LEntity";
import { MRSystem } from "./MRSystem";
import { SDialogContext } from "./SDialogContext";


export enum SDialogAction {
    None,
    Submit,
    Cancel,
    CloseAllSubDialogs,
}

export interface SDialogResult {
    action: SDialogAction,
    selectedItems: LEntity[],
}

export type SDialogResultCallback = (dialog: SDialog) => void;

export type LDialogResultCallback = (result: any) => void;



/**
 * GameDialog
 *
 * Dialog と名前がついているが、必ずしも UI を持つものではない。
 * 名前通り、エンドユーザーとの「対話」のためのインターフェイスを実装する。
 * 
 * MVVM ライクな実装にしているが、これはユニットテスト可能にするため。
 * 
 * また基本的にすべての LDialog の派生と VDialog の派生はペアとなっている。
 * これはいずれの Dialog も Main/Sub 両方で使用できるようにするため。
 * これによって再利用がしやすくなる。例えば壺や倉庫にアイテムを入れるときのアイテム選択や、イベントリストからのアイテム選択。
 * 
 * [2021/5/11] Dialog は System モジュールに持っていくべき？
 * ----------
 * セーブデータに保存しない、ということになる。
 * Dialog の状態を保存できなくなるので、Dialog を開いている時のセーブは基本的に禁止になる。
 * 例えば Dialog からのイベント実行でセーブ画面を呼び出すようなことは禁止。
 * 
 * Object に持っていく場合はこれと併せて CommandContext の保存も必要になってくる。
 * ただそうすると想定外の領域にもどんどん保存の必要性が出てくるので、ここは制限付きにしておくのがベターかも。
 */
export class SDialog {
    _resultCallback: SDialogResultCallback | undefined;
    _resultCallbackVisual: LDialogResultCallback | undefined;
    _dialogResult: SDialogResult;

    // この Dialog を開いたフロア。
    // 複数のフロアにまたがって実行されるとき、Close を Recorder に記録しないように制御するために使う。
    _openedFloorId: LFloorId = LFloorId.makeEmpty();
    
    public constructor() {
        this._dialogResult = {
            action: SDialogAction.None,
            selectedItems: [],
        };
    }

    onUpdate(context: SDialogContext): void { }

    public isVisualIntegration(): boolean {
        return true;
    }

    public then<T extends SDialog>(func: (dialog: T) => void): void {
        this._resultCallback = (d) => {
            func(d as T);
        };
    }

    public submit(): void {
        assert(this._dialogResult.action == SDialogAction.None);
        this._dialogResult.action = SDialogAction.Submit;
        this._closeSelfAndSubDialogs();
    }

    public cancel(): void {
        assert(this._dialogResult.action == SDialogAction.None);
        this._dialogResult.action = SDialogAction.Cancel;
        this._closeSelfAndSubDialogs();
    }
    
    public closeAllSubDialogs(): void {
        assert(MRSystem.dialogContext.dialogs().length >= 2);
        assert(this._dialogResult.action == SDialogAction.None);
        this._dialogResult.action = SDialogAction.CloseAllSubDialogs;
        this._closeSelfAndSubDialogs();
    }

    private _closeSelfAndSubDialogs(): void {
        MRSystem.dialogContext._closeDialog(this);
        
        if (this._resultCallbackVisual) {
            this._resultCallbackVisual(this);
        }
        if (this._resultCallback) {
            this._resultCallback(this);
        }
    }

    public get dialogResult(): SDialogResult {
        return this._dialogResult;
    }

    public get resultAction(): SDialogAction {
        return this._dialogResult.action;
    }

    public get isSubmitted(): boolean {
        return this._dialogResult.action == SDialogAction.Submit;
    }

    // public isCanceled(): boolean {
    //     return this._dialogResult.action == SDialogAction.Cancel;
    // }

    /**
     * SubDialog を開く。
     * 
     * onResult が呼ばれる時点で、dialog はスタックから取り除かれている。
     */
    public openSubDialog<T extends SDialog>(dialog: T, onResult?: ((model: T) => boolean | void) | undefined) {
        dialog._resultCallbackVisual = (model: T) => {
            const handled = (onResult) ? onResult(model) : false;
            if (!handled) {
                switch (model.resultAction) {
                    case SDialogAction.Submit:
                        this.submit();
                        break;
                    case SDialogAction.Cancel:
                        // ほとんどの場合ひとつ前の Dialog に戻ることを想定しているため、
                        // 親 Dialog まで cancel を伝播するようなことはしない。
                        break;
                    case SDialogAction.CloseAllSubDialogs:
                        if (MRSystem.dialogContext.dialogs().length >= 2) {
                            this.closeAllSubDialogs();
                        }
                        break;
                }
            }
        }
        MRSystem.dialogContext.open(dialog);
    }


    //------------------------------------------------------------------------------
    
}
