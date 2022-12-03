import { VDialog } from "./VDialog";
import { STransferMapDialog } from "ts/mr/system/dialogs/STransferMapDialog";
import { MRDataManager } from "ts/mr/data/MRDataManager";
import { MRLively } from "ts/mr/lively/MRLively";
import { RMMZHelper } from "ts/mr/rmmz/RMMZHelper";
import { MRSystem } from "ts/mr/system/MRSystem";
import { Log } from "ts/mr/Common";

export class VTransferMapDialog extends VDialog {
    _model: STransferMapDialog;

    constructor(model: STransferMapDialog) {
        super(model);
        this._model = model;
    }

    public onRmmzSetupMapCompleted(): void {
        const mapId = $gameMap.mapId();

        const transfaringInfo = this._model;//STransferMapDialog.current;
        //if (MRLively.camera.isFloorTransfering()) {
            if (transfaringInfo.newFloorId.isTacticsMap()) {
                // Land 定義マップなど、初期配置されているイベントを非表示にしておく。
                // ランダム Entity 生成ではこれが動的イベントの原本になることもあるので、削除はしない。
                if (MRDataManager.isLandMap(mapId)) {
                    $gameMap.events().forEach(e => e.setTransparent(true));
                }

                $gamePlayer.hideFollowers();
            }
        //}

        transfaringInfo.performFloorTransfer();   // TODO: transferEntity でフラグ立った後すぐに performFloorTransfer() してるので、まとめていいかも

        // レコーディング開始
        MRLively.recorder.startRecording();

        RMMZHelper.triggerOnStartEvent();
        
        // 新しいマップへの移動時は、遅くてもここで RMMZ 側の Map への更新をかけておく。
        // Game_Map.setup は抜けるとこの後する Game_Player の locate が行われるが、それまでにマップのサイズを確定させておく必要がある。
        // そうしないと、focusedEntity と Game_Player の位置同期がずれる。
        MRSystem.mapManager.attemptRefreshVisual();

        Log.d("RMMZ map setup finished.");

        this._model.submit();
    }
}
