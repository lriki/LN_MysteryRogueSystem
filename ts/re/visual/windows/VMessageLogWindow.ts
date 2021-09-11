import { assert } from "ts/re/Common";
import { linear } from "ts/re/math/Math";
import { LMessageHistory } from "ts/re/objects/LMessageHistory";


// TextState の拡張
interface TextLineState {
    text: string;
    index: number;
    x: number;
    y: number;
    width: number;
    height: number;
    startX: number;
    startY: number;
    rtl: boolean;
    buffer: string;
    drawing: boolean;
    outputWidth: number;
    outputHeight: number;
    
    sprite: Sprite;
    scrollStartY: number;
}

/**
 */
export class VMessageLogWindow extends Window_Base {
    private _message: LMessageHistory;
    private _waitCount: number = 0;
    private _autoScroll: boolean = true;;
    private _autoScrollCount: number = 0;
    private _autoScrollCountMax: number = 10;
    private _maxLines: number = 2;

    private _autoCloseCount: number = 0;
    private _autoCloseCountMax: number = 200;
    private _lineSpriteCache: Sprite[] = [];
    private _textLines: TextLineState[] = [];

    constructor(message: LMessageHistory, rect: Rectangle) {
        super(rect);
        this._message = message;
        this.openness = 0;
        this.initMembers();
    }
    
    private initMembers() {
        this._waitCount = 0;
        this._autoCloseCount = 0;
        this._autoScrollCount = 0;
    }

    private maxLines(): number {
        return this._maxLines;
    }

    //private lineHeight(): number {
     //   return this.itemHeight();
    //}
    
    // override
    update() {
        this.checkToNotClose();
        Window_Base.prototype.update.call(this);
        while (!this.isOpening() && !this.isClosing()) {
            if (this.updateWait()) {
                return;
            } else if (this.updateLoading()) {
                return;
            } else if (this.updateInput()) {
                return;
            } else if (this.updateAutoScroll()) {
                return;
            } else if (this.canScrollStart()) {
                this.startNewMessageAndScroll();
            } else {
                this.updateAutoClose();
                return;
            }
        }
    }

    private checkToNotClose() {
        if (this._autoScroll) {
            if (this.isOpen() && this.isClosing() && this.doesContinue()) {
                this.open();
            }
        }
    }
    
    private doesContinue(): boolean {
        // 今表示している終端行移行にもログ行が溜まっている場合は表示を続行したい
        return (
            this._message.hasText() &&
            this._message._lastViewLineIndex < this._message.texts().length - 1
        );
    }
    
    private updateWait() {
        if (this._waitCount > 0) {
            this._waitCount--;
            return true;
        } else {
            return false;
        }
    }
    
    private updateLoading() {
        return false;
    }

    private updateInput() {
        return false;
    }

    private updateAutoScroll(): boolean {
        if (this._autoScrollCount > 0) {
            this._autoScrollCount--;

            const t = this._autoScrollCountMax - this._autoScrollCount;
            const dy = -linear(t, 0, this.lineHeight(), this._autoScrollCountMax);
            this._textLines.forEach(line => {
                line.sprite.y = line.scrollStartY + dy;
            });

            if (this._autoScrollCount == 0) {
                // 1 Line scroll end
                const line = this._textLines.shift();
                assert(line);
                this.releaseLineSprite(line.sprite);

                this._textLines[this._textLines.length - 1].sprite.visible = true;

                // スクロール完了時点の座標で、次回スクロール時の始点を確定する
                this._textLines.forEach(line => {
                    line.scrollStartY = line.sprite.y;
                });

                this._autoCloseCount = this._autoCloseCountMax;
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    }

    private startNewMessageAndScroll() {
        const text = this._message.texts()[this._message._lastViewLineIndex + 1];

        const textState: TextLineState = (this.createTextState(text, 0, 0, 0) as TextLineState);
        textState.x = this.newLineX(textState);
        textState.startX = textState.x;
        textState.y = 0;
        textState.height = this.lineHeight();//this.calcTextHeight(textState);

        const lineSprite = this.acquireLineSprite();
        lineSprite.bitmap?.clear();
        //lineSprite.bitmap.drawText(text, 0, 0, 100, 30, "left");
        lineSprite.x = 0;
        lineSprite.height = textState.height;
        lineSprite.visible = true;

        // 新しい行スプライトの追加位置
        const lastSprite = (this._textLines.length > 0) ? this._textLines[this._textLines.length - 1].sprite : undefined;
        if (lastSprite) {
            lineSprite.y = lastSprite.y + lastSprite.height;
        }
        else {
            lineSprite.y = 0;
        }

        textState.sprite = lineSprite;
        textState.scrollStartY = lineSprite.y;

        this._textLines.push(textState);

        this._message._lastViewLineIndex++;

        if (this._textLines.length > this.maxLines()) {
            // Start scroll
            this._autoScrollCount = this._autoScrollCountMax;
            lineSprite.visible = false;
        }
        else {
            // 一度に複数行が add されたときに一度に表示せず、一行ずつすこし時間をおいて表示してみる
            this.startWait(10);
            this._autoCloseCount = this._autoCloseCountMax;
        }

        
        // Window_Message.updateMessage の処理
        {
            
            while (!this.isEndOfText(textState)) {
                this.processCharacter(textState);
            }
            this.flushTextState(textState);
            if (this.isEndOfText(textState) && !this.pause) {
                this.onEndOfText();
            }
        }
        

        this.open();
    }
    
    private newLineX(textState: TextLineState) {
        const margin = 4;
        return textState.rtl ? this.innerWidth - margin : margin;
    }

    private canScrollStart() {
        return this.doesContinue() && this._autoScroll;
    }
    
    
    private terminateMessage() {
        this.close();
        this._textLines.forEach(line => {
            this.releaseLineSprite(line.sprite);
        })
        this._textLines = [];
    }
    
    private onEndOfText() {
        // Window_Message.onEndOfText() では選択肢など入力の開始処理を行っていたが、ここでは不要
    }
    
    // override
    processControlCharacter(textState: TextLineState, c: string) {
        Window_Base.prototype.processControlCharacter.call(this, textState, c);
        if (c === "\f") {
            throw new Error("NewPage not supported.");
        }
    }
    
    private isEndOfText(textState: TextLineState) {
        return textState.index >= textState.text.length;
    }
    
    
    // override
    processEscapeCharacter(code: string, textState: TextLineState) {
        switch (code) {
            case "C":   // override, textColor の対象を行 Sprite にする
                const bitmap = textState.sprite.bitmap;
                if (bitmap) {
                    bitmap.textColor = ColorManager.textColor((this.obtainEscapeParam(textState)));
                }
                break;
            case "$":
                throw new Error("GoldWindow not supported.");
                break;
            case ".":
                this.startWait(15);
                break;
            case "|":
                this.startWait(60);
                break;
            case "!":
                throw new Error("StartPause not supported.");
                break;
            case ">":
                throw new Error("LineShowFast not supported.");
                break;
            case "<":
                throw new Error("LineShowFast not supported.");
                break;
            case "^":
                throw new Error("PauseSkip not supported.");
                break;
            default:
                Window_Base.prototype.processEscapeCharacter.call(
                    this,
                    code,
                    textState
                );
                break;
        }
    }
        
    // override
    // drawText() の対象を行 Sprite にする
    flushTextState(textState: TextLineState): void {
        const text = textState.buffer;
        const rtl = textState.rtl;
        const width = this.textWidth(text);
        const height = textState.height;
        const x = rtl ? textState.x - width : textState.x;
        const y = textState.y;
        const bitmap = textState.sprite.bitmap;
        if (textState.drawing && bitmap) {
            bitmap.drawText(text, x, y, width, height, "left");
        }
        textState.x += rtl ? -width : width;
        textState.buffer = this.createTextBuffer(rtl);
        const outputWidth = Math.abs(textState.x - textState.startX);
        if (textState.outputWidth < outputWidth) {
            textState.outputWidth = outputWidth;
        }
        textState.outputHeight = y - textState.startY + height;
    }

    // override
    // drawIcon の対象を行 Sprite にする
    processDrawIcon(iconIndex: number, textState: TextLineState) {
        if (textState.drawing) {
            const x = textState.x + 2;
            const y = textState.y + 2;
            // Window_Base.prototype.drawIcon
            const bitmap = ImageManager.loadSystem("IconSet");
            const pw = ImageManager.iconWidth;
            const ph = ImageManager.iconHeight;
            const sx = (iconIndex % 16) * pw;
            const sy = Math.floor(iconIndex / 16) * ph;
            textState.sprite.bitmap?.blt(bitmap, sx, sy, pw, ph, x, y, pw, ph);
        }
        textState.x += ImageManager.iconWidth + 4;
    }

    private startWait(count: number) {
        this._waitCount = count;
    }

    private updateAutoClose() {
        if (this._autoCloseCount > 0) {
            this._autoCloseCount--;
            if (this._autoCloseCount <= 0) {
                this.terminateMessage();
            }
        }
    }
    
    private acquireLineSprite(): Sprite {
        if (this._lineSpriteCache.length > 0) {
            const sprite = this._lineSpriteCache.pop();
            assert(sprite);
            sprite.bitmap?.clear();
            return sprite;
        }
        else {
            const bitmap = new Bitmap(this.width, this.lineHeight());
            bitmap.fontSize = $gameSystem.mainFontSize();
            const sprite = new Sprite(bitmap);
            this._clientArea.addChild(sprite);
            return sprite;
        }
    }

    private releaseLineSprite(sprite: Sprite): void {
        sprite.visible = false;
        this._lineSpriteCache.push(sprite);
    }
}
