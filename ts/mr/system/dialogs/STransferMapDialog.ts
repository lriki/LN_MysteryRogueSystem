import { assert } from "ts/mr/Common";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "../MRSystem";
import { SDialog } from "../SDialog";
import { SGameManager } from "../SGameManager";

/**
 * マップ遷移のダイアログ
 * 
 * コアスクリプトの Game_Player.reserveTransfer > Game_Player.performTransfer の一連の流れに対応する。
 * View 側のフェードエフェクトなどのために、実際の対象の移動を非同期実行するため、Dialog としている。
 * ※元々は LCamera にあった機能だが、その性質は Dialog と非常に似ているため、こちらに移動した。
 */
export class STransferMapDialog extends SDialog {
    public readonly source: STransferMapSource;
    private _transferingOldFloorId: LFloorId;
    private _transferingNewFloorId: LFloorId;
    private _transferingNewX: number = 0;
    private _transferingNewY: number = 0;
    private _newDirection: number;

    public static get isFloorTransfering(): boolean {
        if (!MRSystem.dialogContext._hasDialogModel()) return false;
        const dialog = MRSystem.dialogContext.activeDialog();
        return dialog instanceof STransferMapDialog;
    }

    public static get current(): STransferMapDialog {
        const dialog = MRSystem.dialogContext.activeDialog();
        assert(dialog instanceof STransferMapDialog);
        return dialog;
    }

    public constructor(source: STransferMapSource, floorId: LFloorId, x: number, y: number, d: number) {
        super();
        this.source = source;
        this._transferingOldFloorId = MRLively.camera.currentFloorId.clone();
        this._transferingNewFloorId = floorId.clone();
        this._transferingNewX = x;
        this._transferingNewY = y;
        this._newDirection = d;

        if (this.source == STransferMapSource.FromCommand) {
            MRSystem.integration.onReserveTransferMap(floorId.rmmzMapId(), x, y, d);
        }
    }

    // 別 Land への遷移？
    public get isLandTransfering(): boolean {
        return this._transferingOldFloorId.landId() != this._transferingNewFloorId.landId();
    }

    public get newFloorId(): LFloorId {
        return this._transferingNewFloorId;
    }

    public performFloorTransfer(): void {
        SGameManager.performFloorTransfer(this);
    }
}

export enum STransferMapSource {
    FromCommand,
    FromRmmzNewGame,
    FromRmmzEventCommand,
}
