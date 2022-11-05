import { SDialog } from "../system/SDialog";
import { VDialog } from "./dialogs/VDialog";

export class MRVisualExtension {
    public onMapVisualSetup(): void {}

    /**
     * 指定された SDialog に対して開く VDialog をオーバーライドします。
     * 必要に応じて instanceof で型チェックして、それぞれの VDialog を返すように実装してください。
     */
    public onOpenDialog(model: SDialog): VDialog | undefined {
        return undefined;
    }
}
