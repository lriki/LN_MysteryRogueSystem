import { RESystem } from "./RESystem";
import { SDialogContext } from "./SDialogContext";


/**
 * GameDialog
 *
 * Dialog と名前がついているが、必ずしも UI を持つものではない。
 * 名前通り、エンドユーザーとの「対話」のためのインターフェイスを実装する。
 * 
 * MVVM ライクな実装にしているが、これはユニットテスト可能にするため。
 */
export class REDialog
{
    onUpdate(context: SDialogContext): void { }

    public isVisualIntegration(): boolean {
        return true;
    }

    public close(consumeAction: boolean): void {
        return RESystem.dialogContext.closeDialog(consumeAction);
    }
}
