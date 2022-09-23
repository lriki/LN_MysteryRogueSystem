

// ウィンドウ表示中の制限は Game_Message.isBusy にほぼ集約されているので、
// REシステムのウィンドウによる制限もここで行う。
// そうしないと、Game_Player の移動可能判定やイベント起動判定、メニュー遷移など

import { REGame } from "../lively/REGame";

// たくさんの場所に条件を追加しなければならなくなる。
const _Game_Message_isBusy = Game_Message.prototype.isBusy;
Game_Message.prototype.isBusy = function() {
    return (
        _Game_Message_isBusy.call(this) ||
        REGame.challengeResultShowing
    );
};
