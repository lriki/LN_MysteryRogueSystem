import { LEntity } from "./LEntity";
import { REGame } from "./REGame";
import { RESystem } from "ts/system/RESystem";
import { Log } from "ts/Common";
import { LEntityId } from "./LObject";
import { LFloorId } from "./LFloorId";

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
export class LCamera {
    private _focusedEntityId: LEntityId = LEntityId.makeEmpty();
    private _transferingNewFloorId: LFloorId = LFloorId.makeEmpty();
    private _transferingNewX: number = 0;
    private _transferingNewY: number = 0;
    

    focusedEntityId(): LEntityId {
        return this._focusedEntityId;
    }

    focusedEntity(): LEntity | undefined {
        return REGame.world.entity(this._focusedEntityId);
    }

    focus(entity: LEntity) {
        this._focusedEntityId = entity.entityId();
    }

    clearFocus() {
        this._focusedEntityId = LEntityId.makeEmpty();
    }

    isFloorTransfering(): boolean {
        return this._transferingNewFloorId.hasAny();
    }

    transferingNewFloorId(): LFloorId {
        return this._transferingNewFloorId;
    }
    
    _reserveFloorTransferToFocusedEntity(): void {
        const entity = this.focusedEntity();
        if (entity) {
            this.reserveFloorTransfer(entity.floorId, entity.x, entity.y, 2);
        }
    }

    private reserveFloorTransfer(floorId: LFloorId, x: number, y: number, d: number): void {
        this._transferingNewFloorId = floorId;
        this._transferingNewX = x;
        this._transferingNewY = y;
        RESystem.integration.onReserveTransferMap(floorId.rmmzMapId(), x, y, d);
        Log.d("ReserveFloorTransfer");
    }

    clearFloorTransfering() {
        this._transferingNewFloorId = LFloorId.makeEmpty();
        this._transferingNewX = 0;
        this._transferingNewY = 0;
    }

    /*
    _update() {
        // 注視している Entity が別の Floor にいる場合、Camera を移動する
        const entity = this.focusedEntity();
        if (entity) {
            if (REGame.map.floorId() != entity.floorId) {

            }
        }
    }
    */
}

