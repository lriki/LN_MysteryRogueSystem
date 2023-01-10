import { assert } from "ts/mr/Common";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { LMap } from "ts/mr/lively/LMap";
import { MRLively } from "ts/mr/lively/MRLively";
import { UMovement } from "ts/mr/utility/UMovement";
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
        this._transferingOldFloorId = MRLively.mapView.currentFloorId.clone();
        this._transferingNewFloorId = floorId.clone();
        this._transferingNewX = x;
        this._transferingNewY = y;
        this._newDirection = d;
        
        if (this.source == STransferMapSource.FromCommand) {
            MRSystem.integration.onReserveTransferMap(floorId.rmmzMapId, x, y, d);
        }
    }

    // 別 Land への遷移？
    public get isLandTransfering(): boolean {
        return this._transferingOldFloorId.landId != this._transferingNewFloorId.landId;
    }

    public get oldMap(): LMap | undefined {
        if (this._transferingOldFloorId.isEmpty) return undefined;
        return MRLively.world.map(this._transferingOldFloorId);
    }

    public get newFloorId(): LFloorId {
        return this._transferingNewFloorId;
    }

    public get newMap(): LMap {
        return MRLively.world.map(this._transferingNewFloorId);
    }

    public performFloorTransfer(): void {
        // MapManager による構築中は currentMap を遷移後のものとして扱っているため、事前に変更しておく
        MRLively.mapView.currentFloorId = this._transferingNewFloorId.clone();

        SGameManager.performFloorTransfer(this);

        // 今のところ、map の needsRebuild() が立ってないと Map 内の Entity の再配置が行われず、 located が発生しない。
        // そのままだと Minimap 等が更新されないため、ここで located を発生させる。
        const player =  MRLively.mapView.focusedEntity();
        assert(player);
        const map = this.newMap;
        const block = map.block(player.mx, player.my);
        UMovement._postLocate(player, undefined, block, map, undefined);
    }
}

export enum STransferMapSource {
    FromCommand,
    FromRmmzNewGame,
    FromRmmzEventCommand,
}
