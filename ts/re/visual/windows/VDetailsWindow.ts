import { DTextManager } from "ts/re/data/DTextManager";
import { LEntity } from "ts/re/objects/LEntity";
import { UName } from "ts/re/usecases/UName";

export class VDetailsWindow extends Window_Base {
    private _entity: LEntity;
    onClose: (() => void) | undefined;

    constructor(entity: LEntity) {
        super(new Rectangle(0, 100, Graphics.boxWidth, 400));
        this._entity = entity;
        //this.openness = 0;  // 初期状態では非表示
        this.refresh();
    }
    
    update(): void {
        super.update();

        if (this.isTriggered()) {
            this.close();
        }
    }

    close(): void {
        super.close();
        if (this.onClose) {
            this.onClose();
        }
    }
        
    refresh(): void {
        const rect = this.baseTextRect();
        this.contents.clear();

        const summary = UName.makeNameAsItem(this._entity);


        const lineHeight = this.lineHeight();
        let y = 0;
        this.drawTextEx(summary, 0, y, 300); y += lineHeight * 2;

        this.drawTextEx(this._entity.data().description, 0, y, 300); y += lineHeight;

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
