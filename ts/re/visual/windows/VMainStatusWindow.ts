import { DTextManager } from "ts/re/data/DTextManager";
import { REBasics } from "ts/re/data/REBasics";
import { LActorBehavior } from "ts/re/objects/behaviors/LActorBehavior";
import { LEquipmentUserBehavior } from "ts/re/objects/behaviors/LEquipmentUserBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { STextManager } from "ts/re/system/STextManager";
import { UName } from "ts/re/usecases/UName";
import { VAnimation, VEasingAnimationCurve } from "../animation/VAnimation";
import { easing } from "../animation/VEasing";
import { VUIGridLayout, VUITextElement } from "./VWindowHelper";

export class VMainStatusWindow extends Window_Base {
    private _entity: LEntity | undefined;
    onClose: (() => void) | undefined;

    private _layout: VUIGridLayout;

    private _curve2 = new VEasingAnimationCurve(50, 0, 0.4, easing.outExpo);
    private _curve1 = new VEasingAnimationCurve(0, 20, 0.4, easing.outExpo);

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

        this._weaponText = new VUITextElement(STextManager.weaponStrength())
            .setGrid(0, 0)
            .setColor(this.systemColor())
            .addTo(this._layout);
        this._weaponValue = new VUITextElement("-")
            .setGrid(1, 0)
            .margin(0, 0, 0, 10)
            .addTo(this._layout);

        this._shieldText = new VUITextElement(STextManager.shieldStrength())
            .setGrid(2, 0)
            .setColor(this.systemColor())
            .addTo(this._layout);
        this._shieldValue = new VUITextElement("-")
            .setGrid(3, 0)
            .margin(0, 0, 0, 10)
            .addTo(this._layout);

        this._fpText = new VUITextElement(STextManager.param(REBasics.params.fp))
            .setGrid(0, 1)
            .setColor(this.systemColor())
            .addTo(this._layout);

        this._fpValue = new VUITextElement("1/1")
            .setGrid(1, 1)
            .margin(0, 0, 0, 10)
            .addTo(this._layout);

        this._powText = new VUITextElement(STextManager.param(REBasics.params.pow))
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



            
        VAnimation.start(this, "window.opa", this._curve1, v => {
            this.opacity = (v / 20) * 255;
        }, 0.0);
        VAnimation.start(this, "window.y", this._curve2, v => {
            this.y = this._initialY + v;

        }, 0.0)
        .then(() => {
            
            VAnimation.start(this, "weapon.x", this._curve1, v => {
                this._weaponText.x = this._weaponValue.x =v;
                this.invalidate();
            }, 0.0);
            VAnimation.start(this, "shield.x", this._curve1, v => {
                this._shieldText.x = this._shieldValue.x = v;
                this.invalidate();
            }, -0.01);
            VAnimation.start(this, "fp.x", this._curve1, v => {
                this._fpText.x = this._fpValue.x = v;
                this.invalidate();
            }, -0.02);
            VAnimation.start(this, "pow.x", this._curve1, v => {
                this._powText.x = this._powValue.x = v;
                this.invalidate();
            }, -0.03);
            VAnimation.start(this, "exp.x", this._curve1, v => {
                this._expText.x = this._expValue.x = v;
                this.invalidate();
            }, -0.04);
            VAnimation.start(this, "nextexp.x", this._curve1, v => {
                this._nextexpText.x = this._nextexpValue.x = v;
                this.invalidate();
            }, -0.05);
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
    
    update(): void {
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

        const rect = this.baseTextRect();
        this.contents.clear();

        const summary = UName.makeNameAsItem(this._entity);


        const lineHeight = this.lineHeight();
        let y = 0;
        
        // this.drawTextEx(summary, 0, y, 300);
        // y += lineHeight * 2;

        // this.drawTextEx(this._entity.data().description, 0, y, 300);
        // y += lineHeight;
        
        const equipmentUser = this._entity.findEntityBehavior(LEquipmentUserBehavior);
        if (equipmentUser) {
            let atk = 0;
            let def = 0;
            for (const item of equipmentUser.equippedItemEntities()) {
                item.iterateBehaviorsReverse(b => {
                    atk = b.onQueryIdealParamBase(REBasics.params.atk, atk);
                    def = b.onQueryIdealParamBase(REBasics.params.def, def);
                    return true;
                });
            }
            this._weaponValue.setText(atk.toString());
            this._shieldValue.setText(def.toString());
        }
        else {
            this._weaponValue.setText("-");
            this._shieldValue.setText("-");
        }
        
        // 満腹度
        const cfp = this._entity.actualParam(REBasics.params.fp) / 10;
        const mfp = this._entity.idealParam(REBasics.params.fp) / 10;
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

        /*
        const lh = this.itemHeight();
        const cw = 200;
        const m = 32;

        this.drawActorNameAndLevel(cw * 0, lh * 0, cw);
        this.drawScore(cw * 1 + m, lh * 0, cw);
        this.drawPlaytime(1000, cw * 1 + m, lh * 1, cw);
        this.drawResultSummary(cw * 0, lh * 2 + lh / 2, cw * 2);

        this.drawParam(TextManager.hp, "87", cw * 0, lh * 4, cw);
        this.drawParam("満腹度", "54%", cw * 1 + m, lh * 4, cw);
        this.drawParam(TextManager.attack, "8/8", cw * 0, lh * 5, cw);
        this.drawParam(TextManager.exp, "3225", cw * 1 + m, lh * 5, cw);
        
        this._drawItem("カタナ+3", 96, 0, lh * 7);
        this._drawItem("皮の盾", 129, 0, lh * 8);
        */
    }

    private draw(): void {
        this.contents.clear();
        this._layout.draw(this);
    }


    private drawActorNameAndLevel(x: number, y: number, w: number) {
        const name = "LRIKI";
        const level = 15;

        this.drawText(name, x, y, w, "left");
        //this.changeTextColor(ColorManager.systemColor());
        this.drawText(`${TextManager.levelA} ${level}`, x, y, w, "right");
        //this.resetTextColor();
        //this.drawText(level, x, y, w, "right");
    }
    
    private drawScore(x: number, y: number, w: number) {
        const score = 99999;    // TODO:
        const width = 100;
        


        this.changeTextColor(ColorManager.systemColor());
        this.drawText(DTextManager.score, x, y, w, "left");
        this.resetTextColor();
        this.drawText(score, x, y, w, "right");
    }
    
    private drawPlaytime(frameCount: number, x: number, y: number, w: number) {
        this.drawText(this.playtimeText(frameCount), x, y, w, "right");
    }

    private drawResultSummary(x: number, y: number, w: number) {
        const text = "\\c[2]緑燐の丘 \\c[0]を無事にクリアした！"
        //const text = "\\c[2]モンスター \\c[0]にぺしゃんこにされた。"
        this.drawTextEx(text, x, y, w);
    }
    
    private drawParam(name: string, value: string, x: number, y: number, w: number) {
        //const value = 87;
        this.changeTextColor(ColorManager.systemColor());
        this.drawText(name, x, y, w, "left");
        this.resetTextColor();
        this.drawText(value, x, y, w, "right");
    }

    private _drawItem(name: string, icon: number, x: number, y: number) {
        this.drawIcon(icon, x, y)
        this.drawText(name, x + 34, y, 200, "left");
    }

    // Game_System.prototype.playtimeText
    private playtimeText(frameCount: number) {
        const hour = Math.floor(frameCount / 60 / 60);
        const min = Math.floor(frameCount / 60) % 60;
        const sec = frameCount % 60;
        return hour.padZero(2) + ":" + min.padZero(2) + ":" + sec.padZero(2);
    }

    private isTriggered(): boolean {
        return (
            Input.isRepeated("ok") ||
            Input.isRepeated("cancel") ||
            TouchInput.isRepeated()
        );
    }
}
