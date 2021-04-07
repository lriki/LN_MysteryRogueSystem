import { REGame_Map } from "./REGame_Map";
import { REEntityFactory } from "../system/REEntityFactory";
import { LUnitAttribute } from "./attributes/LUnitAttribute";
import { LEntity } from "./LEntity";
import { LWorld } from "./LWorld";
import { REGame } from "./REGame";
import { RESystem } from "ts/system/RESystem";
import { Log } from "ts/Common";
import { LEntityId } from "./LObject";
import { LFloorId } from "./LFloorId";

/**
 * 始点位置。ツクールの Game_Player と連携する。
 * 
 * ツクールのマップ移動=Game_Player の移動であるように、RE でもマップ移動=Camera の移動、となる。
 */
export class LCamera
{
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
    
    reserveFloorTransferToFocusedEntity() {
        const entity = this.focusedEntity();
        if (entity) {
            this.reserveFloorTransfer(entity.floorId, entity.x, entity.y, 2);
        }
    }

    reserveFloorTransfer(floorId: LFloorId, x: number, y: number, d: number) {
        this._transferingNewFloorId = floorId;
        this._transferingNewX = x;
        this._transferingNewY = y;
        //RESystem.integration.onReserveTransferFloor(floorId, x, y, d);
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

