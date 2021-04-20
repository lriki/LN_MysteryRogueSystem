import { DBasics } from "ts/data/DBasics";
import { REData } from "ts/data/REData";
import { LActorBehavior, LBattlerBehavior } from "ts/objects/behaviors/LBattlerBehavior";
import { LFloorId } from "ts/objects/LFloorId";
import { REGame } from "ts/objects/REGame";
import { readBuilderProgram } from "typescript";


const gaugeHeight = 6;

export class VHudWindow extends Window_Base {
    static readonly HeaderHeight = 70;
    //private _floorNumberBitmap: Bitmap;
    //private _floorNumberSprite: Sprite;

    constructor() {
        super(new Rectangle(0, 0, Graphics.boxWidth, Graphics.boxHeight));
        this.frameVisible = false;
        this.backOpacity = 0;

        //this._floorNumberBitmap = new Bitmap(64, 64);
        //this._floorNumberBitmap.drawText("1F", 0, 0, 64, lineHeight, "left");
        //this._floorNumberSprite = new Sprite(this._floorNumberBitmap);
        //this.addChild(this._floorNumberSprite);
        this.refresh();
    }

    private refresh() {
        const entity = REGame.camera.focusedEntity();
        if (!entity) return;
        const battler = entity.findBehavior(LActorBehavior);
        if (!battler) return;

        //battler.actualParam(DBasics.sparams)

        this.drawFloorNumber(0, 0, entity.floorId);
        this.drawLevel(150, 0, battler.level, battler.currentExp() / battler.nextLevelExp());
        this.drawHpFp(300, 0, 80, 100, 30, 100);
        this.drawGold(567);
    }

    private drawFloorNumber(x: number, y: number, floorId: LFloorId): void {
        this.drawText("1", x, y, 32, "right");
        this.changeTextColor(this.paramTitleColor());
        this.drawText("F", x + 32, y, 32, "left");
        this.resetTextColor();
    }

    private drawLevel(x: number, y: number, level: number, expRatio: number): void {
        const t1 = "Lv ";
        const t2 = level.toString();
        const width = this.textWidth(t1 + "000");
        const w1 = this.textWidth(t1);
        //const w2 = this.textWidth(t2);

        // Text
        this.changeTextColor(this.paramTitleColor());
        this.drawText(t1, x, y, w1, "left");
        this.resetTextColor();
        this.drawText(t2, x + w1, y, width - w1, "left");

        // Gauge
        this.contents.fillRect(x, y + this.lineHeight(), width, gaugeHeight, ColorManager.gaugeBackColor());
        this.contents.fillRect(x, y + this.lineHeight(), width * expRatio, gaugeHeight, this.expGugeColor());
    }

    private drawHpFp(x: number, y: number, hp: number, maxHp: number, fp: number, maxFp: number): void {
        const width = 250;
        const t1 = "HP ";
        const t2 = `${hp} / ${maxHp}`;
        const w1 = this.textWidth(t1);
        const w2 = this.textWidth(t2);

        // Text
        this.changeTextColor(this.paramTitleColor());
        this.drawText(t1, x, y, w1, "left");
        this.resetTextColor();
        this.drawText(t2, x + w1, y, w2, "left");

        
        // Gauge
        this.contents.fillRect(x, y + this.lineHeight(), width, gaugeHeight, ColorManager.gaugeBackColor());
        this.contents.fillRect(x, y + this.lineHeight(), width * (hp / maxHp), gaugeHeight, this.hpGaugeFullyColor());
        
        this.contents.fillRect(x, y + this.lineHeight() + gaugeHeight + 1, width, gaugeHeight, ColorManager.gaugeBackColor());
        this.contents.fillRect(x, y + this.lineHeight() + gaugeHeight + 1, width * (fp / maxFp), gaugeHeight, this.fpGaugeColor());
    }

    private drawGold(gold: number): void {
        const t1 = " G";
        const t2 = gold.toString();
        const w1 = this.textWidth(t1);
        const w2 = this.textWidth(t2);
        const x = this.contents.width - (w1 + w2) - 56; // メニューボタンに隠れる分をオフセットする
        const y = 0;
        
        this.drawText(t2, x, y, w2, "right");
        this.changeTextColor(this.paramTitleColor());
        this.drawText(t1, x + w2, y, w1, "right");
        this.resetTextColor();
    }

    private paramTitleColor(): string {
        return ColorManager.textColor(23);
    }

    private expGugeColor(): string {
        return ColorManager.hpGaugeColor2();
    }

    private hpGaugeFullyColor(): string {
        return ColorManager.textColor(3);
    }

    private fpGaugeColor(): string {
        return ColorManager.textColor(23);
    }
}
