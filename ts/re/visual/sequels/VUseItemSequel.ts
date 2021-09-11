import { assert } from "ts/re/Common";
import { LEntity } from "ts/re/objects/LEntity";
import { REVisual } from "../REVisual";
import { REVisualSequel } from "../REVisualSequel";
import { REVisualSequelContext } from "../REVisualSequelContext";
import { REVisual_Entity } from "../REVisual_Entity";
import { VHelper } from "../VHelper";

const DROP_TIME = 30;
const DROP_RADIUS = 1.6;
const DROP_OFFSET_Y = -0.7;


const PLAYER_ROTATION_TIME = 16;
const PLAYER_JUMP_TIME = 12;
const PLAYER_JUMP_HEIGHT = 0.6;

const EPILOGUE_TIME = 8;

const DIRS4: number[] = [
    6, 8, 4, 2, 
];

export class VUseItemSequel extends REVisualSequel {
    private _itemSprite: Sprite | undefined;
    private _baseX: number = 0;
    private _baseY: number = 0;

    onUpdate(visual: REVisual_Entity, context: REVisualSequelContext): void {

        const frameCount = context.frameCount();
        const self = visual.entity();
        const event = visual.rmmzEvent();
        const item = context.sequel().args();
        assert(item instanceof LEntity);
        assert(REVisual.spriteset);

        if (frameCount == 0) {
            const bitmap = ImageManager.loadSystem("IconSet");
            this._itemSprite = new Sprite(bitmap);
            this._itemSprite.anchor.set(0.5, 0.5);
            REVisual.spriteset._tilemap.addChild(this._itemSprite);

            this._baseX = event._realX;
            this._baseY = event._realY;

            const itemData = item.data();
            
            
            VHelper.setIconFrame(this._itemSprite, itemData.display.iconIndex);
        }

        const ratio = frameCount / DROP_TIME;
        const jy = Math.sin(Math.PI * ratio) * DROP_RADIUS;

        if (this._itemSprite) {
            this._itemSprite.x = VHelper.toScreenX(this._baseX);
            this._itemSprite.y = VHelper.toScreenY(this._baseY + DROP_OFFSET_Y - jy);
        }


        /*
        if (frameCount == 0) {
            context.startAnimation(117);
        }

        if (frameCount == 60) {
            event.setTransparent(true);
        }
        */
       
        // アイコン投げ
        const rotationBeginTime = DROP_TIME - PLAYER_JUMP_TIME - PLAYER_ROTATION_TIME;
        if (frameCount >= rotationBeginTime) {
            const speed = 0.05;
            const r = Math.floor(((frameCount - rotationBeginTime) * speed) * 4) % 4;
            event.setDirection(DIRS4[r]);
        }

        // ジャンプ
        const jumpBeginTime = DROP_TIME - PLAYER_JUMP_TIME;
        if (frameCount >= jumpBeginTime) {
            const ratio = (frameCount - jumpBeginTime) / PLAYER_JUMP_TIME;
            const jy = Math.sin(Math.PI * ratio) * PLAYER_JUMP_HEIGHT;
            visual.setY(context.startPosition().y - jy);
            event.setDirection(2);
        }

        // 最後のちょい待ち
        if (frameCount > DROP_TIME) {
            visual.setY(context.startPosition().y);
            event.setDirection(2);
            if (this._itemSprite) {
                this._itemSprite.visible = false;
            }
        }
        
        if (frameCount >= DROP_TIME + EPILOGUE_TIME) {
            if (this._itemSprite) {
                REVisual.spriteset._tilemap.removeChild(this._itemSprite);
            }

            visual.resetPosition();
            context.end();
        }
    }
}


