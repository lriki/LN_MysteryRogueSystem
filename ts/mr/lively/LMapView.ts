import { LEntity } from "./entity/LEntity";
import { MRLively } from "./MRLively";
import { MRSystem } from "ts/mr/system/MRSystem";
import { assert, Log, MRSerializable } from "ts/mr/Common";
import { LEntityId } from "./LObject";
import { LFloorId } from "./LFloorId";
import { LUnitBehavior } from "./behaviors/LUnitBehavior";
import { STransferMapDialog, STransferMapSource } from "../system/dialogs/STransferMapDialog";
import { SCommandContext } from "../system/SCommandContext";
import { LMap } from "./LMap";
import { SDialogContext } from "../system/SDialogContext";

/**
 * 始点位置。ツクールの Game_Player と連携する。
 * 
 * ツクールのマップ移動=Game_Player の移動であるように、RE でもマップ移動=Camera の移動、となる。
 * 
 * 
 * 移動処理の整理
 * ----------
 * まず前提として、すべての Entity は必ず何らかのフロアに属する。
 * これは REシステム管理外のマップへ遷移するときも同様で、例えばプレイヤーキャラクターが REシステム管理外の ワールドマップのようなマップへ移動するとき、
 * ワールドマップを MapId:5 とすると、プレイヤーキャラクターの Entity は FloorId{land:0, floorNumber:5} に存在することとなる。
 * 
 * > こうしておかないと、ゲームオーバーなどで強制フロア移動するときに REシステムとしての遷移先が見つからない事態になってしまう。
 * 
 * ### 考えられる移動手段の例
 * - [場所移動] イベントコマンドによる、ランダムマップフロアへの移動 (REシステム内外関係なし)
 * - [場所移動] イベントコマンドによる、固定マップフロアへの移動 (REシステム内外関係なし)
 * - [場所移動] イベントコマンドによる、固定マップへの直接移動 (REシステム内外関係なし)
 * - 階段を "降りる" 等のアクションによる、フロア間の移動
 * - "ゲームオーバー" や "脱出の巻物"、"イベント" 等による、別 Land への移動
 * - "ゲームオーバー" や "脱出の巻物"、"イベント" 等による、REシステム管理外のマップへの移動
 * 
 * 
 * ### フロア移動を伴う場合は、必ず RMMZ 側の [場所移動] を行うようにする
 * 
 * つまり $gamePlayer.reserveTransfar() を実行する、ということ。
 * 
 * 階段を進むことによるランダムフロア間の移動では RMMZ としてのマップが変わることは無いためマップデータをロードする必要はないのだが、
 * これ以外のケースでは全て RMMZ マップのロードが必要になる。
 * ランダムフロア間の移動は最もメジャーであるが内部処理的にはこれ用に特別な処理が必要になる。でもそれはやめてシンプルにしたい。
 * そのため「フロアを移動するときは RMMZ 側の [場所移動] を行う」とする。
 * 
 * ### 処理の流れ
 * 
 * 1. $gamePlayer.reserveTransfar() を呼び出す
 *    - REシステム外からは、イベントコマンドの [場所移動] により呼び出される。
 *    - REシステム (特にコマンドチェーン) 内からは、REIntegration.onReserveTransferMap() を経由して呼び出される。
 * 2. RMMZ コアスクリプトの既定の流れでマップ遷移が行われる
 * 3. 既定の Game_Map.setup() 後、performFloorTransfer() で現在の $gameMap や $dataMap を元にフロアを構築する。
 * 
 */
@MRSerializable
export class LMapView {  // TODO: MapView とかの方がいいかもしれない
    private _focusedEntityId: LEntityId = LEntityId.makeEmpty();

    currentFloorId: LFloorId = LFloorId.makeEmpty();

    initializing: boolean = true;

    // private _transferingNewFloorId: LFloorId = LFloorId.makeEmpty();
    // private _transferingNewX: number = 0;
    // private _transferingNewY: number = 0;

    public get currentMap(): LMap {
        return MRLively.world.map(this.currentFloorId);
    }
    

    focusedEntityId(): LEntityId {
        return this._focusedEntityId;
    }

    /**
     * 現在フォーカスのある Entity を取得します。
     * 取得した Entity は、必ずしも Player ではない点に注意してください。
     * 操作中の Player を取得したい場合は LSystem.mainPlayerEntity を使用してください。
     */
    focusedEntity(): LEntity | undefined {
        if (!this._focusedEntityId.hasAny()) return undefined;
        return MRLively.world.entity(this._focusedEntityId);
    }

    getFocusedEntity(): LEntity {
        const entity = this.focusedEntity();
        assert(entity);
        return entity;
    }

    focus(entity: LEntity) {
        const oldEntity = this.focusedEntity();
        if (oldEntity) {
            const unit = oldEntity.findEntityBehavior(LUnitBehavior);
            if (unit) {
                unit.setManualMovement(false);
            }
        }

        this._focusedEntityId = entity.entityId();
        this.currentFloorId = entity.floorId.clone();

        const unit = entity.findEntityBehavior(LUnitBehavior);
        if (unit) {
            unit.setManualMovement(true);
        }
    }

    clearFocus() {
        this._focusedEntityId = LEntityId.makeEmpty();
    }
    

    public get isFastForward(): boolean {
        const entty = this.focusedEntity();
        if (!entty) return false;
        const behavior = entty.findEntityBehavior(LUnitBehavior);
        if (!behavior) return false;
        return behavior.dashInfo != undefined || behavior._fastforwarding;
    }

    // isFloorTransfering(): boolean {
    //     return this._transferingNewFloorId.hasAny();
    // }

    // transferingNewFloorId(): LFloorId {
    //     return this._transferingNewFloorId;
    // }
    
    // _reserveFloorTransferToFocusedEntity(cctx: SCommandContext): void {
    //     const entity = this.focusedEntity();
    //     if (entity) {
    //         //cctx.openDialog(entity, new STransferMapDialog(STransferMapSource.FromCommand, entity.floorId, entity.mx, entity.my, 2), false);
    //         MRSystem.dialogContext.open(new STransferMapDialog(STransferMapSource.FromCommand, entity.floorId, entity.mx, entity.my, entity.dir));
    //         this.currentFloorId = entity.floorId.clone();

    //         //this.reserveFloorTransfer(entity.floorId, entity.mx, entity.my, 2);
    //     }
    // }

    public onEntityTransferred(entity: LEntity): void {
        if (this.initializing) return;  // NewGame 中は GameManager 側に任せる

        if (entity.entityId().equals(this._focusedEntityId)) {
            if (!this.currentFloorId.equals(entity.floorId)) {
                MRSystem.dialogContext.open(new STransferMapDialog(STransferMapSource.FromCommand, entity.floorId, entity.mx, entity.my, entity.dir));
            
                // この時点ではまだ CurrentFloorId は変更しない。STransferMapDialog でしかるべきタイミングで行う。
                // こうしておかないと performFloorTransfer() する前に、別マップへの遷移したことになってしまう。
            }
        }

        // // Camera が注視している Entity が別マップへ移動したら、マップ遷移
        // if (MRLively.camera.focusedEntityId().equals(entity.entityId()) &&
        //     !mapFloorId.equals(entity.floorId) &&
        //     cctx) {
        //     MRLively.camera._reserveFloorTransferToFocusedEntity(cctx);
        // }
    }

    public onEntityEnteredFromMap(entity: LEntity): void {
        MRSystem.integration.entityEnteredMap(entity);
    }

    public onEntityRemovedFromMap(entity: LEntity): void {
        MRSystem.integration.entityLeavedMap(entity);
    }


    /** @deprecated */
    // private reserveFloorTransfer(floorId: LFloorId, x: number, y: number, d: number): void {
    //     this._transferingNewFloorId = floorId;
    //     this._transferingNewX = x;
    //     this._transferingNewY = y;
    //     MRSystem.integration.onReserveTransferMap(floorId.rmmzMapId(), x, y, d);
    // }

    // clearFloorTransfering() {
    //     this._transferingNewFloorId = LFloorId.makeEmpty();
    //     this._transferingNewX = 0;
    //     this._transferingNewY = 0;
    // }
}

