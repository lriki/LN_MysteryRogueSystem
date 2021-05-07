import { RESystem } from "./RESystem";
import { SDialogContext } from "./SDialogContext";


export type LDialogResultCallback = (result: any) => void;

export enum DialogSubmitMode {
    Close,
    ConsumeAction,
}



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
 */
export class REDialog {
    _resultCallback: LDialogResultCallback | undefined;
    _dialogResult: boolean = false;
    
    onUpdate(context: SDialogContext): void { }

    public isVisualIntegration(): boolean {
        return true;
    }
    
    consumeAction(): void {
        return RESystem.dialogContext.consumeAction();
    }

    public submit(mode?: DialogSubmitMode): void {
        this._dialogResult = true;

        if (mode == DialogSubmitMode.ConsumeAction) {
            this.consumeAction();
        } 

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
