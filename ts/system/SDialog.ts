import { RESystem } from "./RESystem";
import { SDialogContext } from "./SDialogContext";


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
    _resultCallback: LDialogResultCallback | undefined;
    _dialogResult: boolean = false;
    
    onUpdate(context: SDialogContext): void { }

    public isVisualIntegration(): boolean {
        return true;
    }

    public submit(): void {
        this._dialogResult = true;


        RESystem.dialogContext.closeDialog();
        
        if (this._resultCallback) {
            this._resultCallback(this);
        }
    }

    public cancel(): void {
        this._dialogResult = false;
        RESystem.dialogContext.closeDialog();
        
        if (this._resultCallback) {
            this._resultCallback(this);
        }
    }

    public isSubmitted(): boolean {
        return this._dialogResult;
    }

    public isCanceled(): boolean {
        return !this._dialogResult;
    }
}
