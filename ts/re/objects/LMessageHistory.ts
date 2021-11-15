import { REGame } from "./REGame";


export type ChoiceCallback = (n: number) => void;

/**
 * Game_Message はログ表示という点では機能がマッチしなかったため、独自実装したもの。
 * 
 * 前提としてユーザーと "対話" するためのものではないため、
 * Enter 待ちや選択肢の表示といった機能は持たず、ログを流すだけのシステムとなる。
 * 
 * そういった対話が必要な場合は、VMessageLogWindow は非表示にして VMessageWindow に切り替えて使うこと。
 * このあたりもそれなりに複雑なので、ひとつのウィンドウにたくさんのことをさせたくない。
 * （実際に原作でも、ログ用ウィンドウと会話用ウィンドウではタイピングの有無などいろいろ差がある）
 */
export class LMessageHistory {
    // 履歴。Floor 開始から現在までの全てのメッセージを行単位で保持する
    private _texts: string[];
    
    _lastViewLineIndex: number = -1

    constructor() {
        this._texts = [];
    }
        
    clear(): void {
        this._texts = [];
        this._lastViewLineIndex = -1;
    }

    add(text: string): void {
        this._texts.push(text);

        if (REGame.recorder.isSilentPlayback()) {
            this._lastViewLineIndex = this._texts.length;
        }
    }

    hasText(): boolean {
        return this._texts.length > 0;
    }

    texts(): readonly string[] {
        return this._texts;
    }
}

