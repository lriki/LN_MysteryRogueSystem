import { assert } from "ts/re/Common";
import { DTextManager } from "ts/re/data/DTextManager";
import { REBasics } from "ts/re/data/REBasics";
import { LActorBehavior } from "ts/re/objects/behaviors/LActorBehavior";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { UName } from "ts/re/usecases/UName";
import { VAnimation, VEasingAnimationCurve } from "../animation/VAnimation";
import { easing } from "../animation/VEasing";
import { VUITextElement } from "../ui/VUIElement";
import { VUIGridLayout } from "../ui/VUIGridLayout";

export class VMainStatusWindow extends Window_Base {
    private _entity: LEntity | undefined;
    onClose: (() => void) | undefined;

    private _layout: VUIGridLayout;

    private _curve2 = new VEasingAnimationCurve(50, 0, 0.2, easing.outQuad);
    private _curve1 = new VEasingAnimationCurve(0, 20, 0.5, easing.outExpo);
    private _opacityCurve = new VEasingAnimationCurve(0, 1.0, 0.2, easing.linear);

    private _initialY = 0;
    
    private _weaponText: VUITextElement;
    private _weaponValue: VUITextElement;
    private _shieldText: VUITextElement;
    private _shieldValue: VUITextElement;
    private _fpText: VUITextElement;
    private _fpValue: VUITextElement;
    private _powText: VUITextElement;
    private _powValue: VUITextElement;
    private _expText: VUITextElement;
    private _expValue: VUITextElement;
    private _nextexpText: VUITextElement;
    private _nextexpValue: VUITextElement;

    private _invalidateLayout: boolean = true;
    private _invalidateDraw: boolean = true;

    constructor(rect: Rectangle) {
        super(rect);
        this._initialY = rect.y;
        //this.openness = 0;  // 初期状態では非表示
        this._layout = new VUIGridLayout().margin(10);

        this._weaponText = new VUITextElement(DTextManager.weaponStrength())
            .setGrid(0, 0)
            .setColor(this.systemColor())
            .addTo(this._layout);
        this._weaponValue = new VUITextElement("-")
            .setGrid(1, 0)
            .margin(0, 0, 0, 10)
            .addTo(this._layout);

        this._shieldText = new VUITextElement(DTextManager.shieldStrength())
            .setGrid(2, 0)
            .setColor(this.systemColor())
            .addTo(this._layout);
        this._shieldValue = new VUITextElement("-")
            .setGrid(3, 0)
            .margin(0, 0, 0, 10)
            .addTo(this._layout);

        this._fpText = new VUITextElement(DTextManager.param(REBasics.params.fp))
            .setGrid(0, 1)
            .setColor(this.systemColor())
            .addTo(this._layout);

        this._fpValue = new VUITextElement("1/1")
            .setGrid(1, 1)
            .margin(0, 0, 0, 10)
            .addTo(this._layout);

        this._powText = new VUITextElement(DTextManager.param(REBasics.params.pow))
            .setGrid(2, 1)
            .setColor(this.systemColor())
            .addTo(this._layout);
        this._powValue = new VUITextElement("1/1")
            .setGrid(3, 1)
            .margin(0, 0, 0, 10)
            .addTo(this._layout);

        const expTotal = TextManager.expTotal.format(TextManager.exp);
        this._expText = new VUITextElement(expTotal)
            .setGrid(0, 2)
            .setColor(this.systemColor())
            .addTo(this._layout);
        this._expValue = new VUITextElement("100")
            .setGrid(1, 2)
            .margin(0, 0, 0, 10)
            .addTo(this._layout);

        // 次のレベルまで
        const expNext = TextManager.expNext.format(TextManager.level);
        this._nextexpText = new VUITextElement(expNext)
            .setGrid(2, 2)
            .setColor(this.systemColor())
            .addTo(this._layout);
        this._nextexpValue = new VUITextElement("100")
            .setGrid(3, 2)
            .margin(0, 0, 0, 10)
            .addTo(this._layout);

        this._layout.children().forEach(e => e.opacity = 0.0);



            
        // VAnimation.start(this, "window.opa", this._curve1, v => {
        //     this.opacity = (v / 20) * 255;
        // }, 0.0);
        // VAnimation.start(this, "window.y", this._curve2, v => {
        //     this.y = this._initialY + v;
        // }, 0.0)
        
        VAnimation.startAt(this, "window.o", 0, 255, 0.3, easing.outQuad, v => {
            this.opacity = v;
        }, 0.0);
        VAnimation.startAt(this, "window.y", this.y + 50, this.y, 0.3, easing.outQuad, v => {
            this.y = v;
        }, 0.0)
        .then(() => {
            VAnimation.start(this, "opacity", this._opacityCurve, v => {
                this._layout.children().forEach(e => e.opacity = v);
            }, 0.0);
            
            const offset = -0.01;
            VAnimation.start(this, "weapon.x", this._curve1, v => {
                this._weaponText.x = this._weaponValue.x =v;
                this.invalidate();
            }, 0.0);
            VAnimation.start(this, "shield.x", this._curve1, v => {
                this._shieldText.x = this._shieldValue.x = v;
                this.invalidate();
            }, offset * 1);
            VAnimation.start(this, "fp.x", this._curve1, v => {
                this._fpText.x = this._fpValue.x = v;
                this.invalidate();
            }, offset * 2);
            VAnimation.start(this, "pow.x", this._curve1, v => {
                this._powText.x = this._powValue.x = v;
                this.invalidate();
            }, offset * 3);
            VAnimation.start(this, "exp.x", this._curve1, v => {
                this._expText.x = this._expValue.x = v;
                this.invalidate();
            }, offset * 4);
            VAnimation.start(this, "nextexp.x", this._curve1, v => {
                this._nextexpText.x = this._nextexpValue.x = v;
                this.invalidate();
            }, offset * 5);
        });
        



        this.invalidate();
    }

    public setEntity(entity: LEntity): void {
        this._entity = entity;
        this.refresh();
    }

    private invalidate(): void {
        this._invalidateLayout = true;
        this._invalidateDraw = true;
    }

    destroy(): void {
        
        VAnimation.startAt(this, "window.o", this.opacity, 0, 0.3, easing.outQuad, v => {
            this.opacity = v;
            this._clientArea.opacity = v;
        });
        VAnimation.startAt(this, "window.y", this.y, this.y + 50, 0.3, easing.outQuad, v => {
            this.y = v;
        }, 0.0)
        .then(() => {
            super.destroy();
        });
    }
    
    update(): void {
        //console.log("update");
        super.update();

        // if (this.isTriggered()) {
        //     this.close();
        // }

        if (this._invalidateLayout) {
            this.layout();
            this._invalidateLayout = false;
        }

        if (this._invalidateDraw) {
            this.draw();
            this._invalidateDraw = false;
        }
    }

    close(): void {
        super.close();
        if (this.onClose) {
            this.onClose();
        }
    }

    layout(): void {
        this._layout.measure(this);
        this._layout.arrange({ x: 0, y: 0, width: this.contents.width, height: this.contents.height });
    }
        
    refresh(): void {
        if (!this._entity) return;

        this.contents.clear();

        const equipmentUser = this._entity.findEntityBehavior(LEquipmentUserBehavior);
        if (equipmentUser) {
            let atk = 0;
            let def = 0;
            for (const item of equipmentUser.equippedItemEntities()) {
                const data = item.data();
                assert(data.equipment);
                atk += LEquipmentUserBehavior.calcEquipmentParam(item, REBasics.params.atk);//data.equipment.parameters[REBasics.params.atk];
                def += LEquipmentUserBehavior.calcEquipmentParam(item, REBasics.params.def);//data.equipment.parameters[REBasics.params.def];


                // item.iterateBehaviorsReverse(b => {
                //     atk += b.onQueryIdealParamBase(REBasics.params.atk, atk);
                //     def += b.onQueryIdealParamBase(REBasics.params.def, def);
                //     console.log("ssss", atk, def, b);
                //     return true;
                // });
            }
            this._weaponValue.setText(atk.toString());
            this._shieldValue.setText(def.toString());
        }
        else {
            this._weaponValue.setText("-");
            this._shieldValue.setText("-");
        }
        
        // 満腹度
        const cfp = Math.ceil(this._entity.actualParam(REBasics.params.fp) / 10);
        const mfp = Math.ceil(this._entity.idealParam(REBasics.params.fp) / 10);
        this._fpValue.setText(`${cfp}/${mfp}`);

        // ちから
        const c = this._entity.actualParam(REBasics.params.pow);
        const m = this._entity.idealParam(REBasics.params.pow);
        this._powValue.setText(`${c}/${m}`);
        
        // 経験値
        const actor = this._entity.findEntityBehavior(LActorBehavior);
        if (actor) {
            this._expValue.setText(actor.currentExp().toString());
            this._nextexpValue.setText(actor.nextLevelExp().toString());
        }
        else {
            this._expValue.setText("-");
            this._nextexpValue.setText("-");
        }
    }

    private draw(): void {
        this.contents.clear();
        this._layout.draw(this);
    }
}
