import { REGame } from "ts/re/objects/REGame";


declare global {
    interface Game_CharacterBase {
        _reRevision: number;

        isREEvent(): boolean;   // Event であるか。他のプラグインとの競合回避のため、RE プレフィックスをつけている。
        isREPrefab(): boolean;
        isRESpritePrepared(): boolean;
        isREExtinct(): boolean;
        increaseRERevision(): void;
        reRevision(): number;
    }
}

const _Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
Game_CharacterBase.prototype.initMembers = function(): void {
    _Game_CharacterBase_initMembers.call(this);
}

Game_CharacterBase.prototype.isREEvent = function() {
    return false;
}

Game_CharacterBase.prototype.isREPrefab = function() {
    return false;
}

Game_CharacterBase.prototype.isRESpritePrepared = function() {
    return false;
}

Game_CharacterBase.prototype.isREExtinct = function() {
    return false;
}

Game_CharacterBase.prototype.increaseRERevision = function(): void {
    if (!this._reRevision) this._reRevision = 0;    // initMembers() で初期化してしまうと、Pool からの再利用時に初期化されてしまうので、ここで作る
    this._reRevision++;
}

Game_CharacterBase.prototype.reRevision = function(): number {
    if (!this._reRevision) return 0;
    return this._reRevision;
}

const _Game_CharacterBase_updatePattern = Game_CharacterBase.prototype.updatePattern;
Game_CharacterBase.prototype.updatePattern = function() {
    if (REGame.map.floorId().isEntitySystemMap()) {
        // RE System の下では、見た目の制御は Sequel に任せる
    }
    else {
        _Game_CharacterBase_updatePattern.call(this);
    }
}

const _Game_CharacterBase_updateAnimation = Game_CharacterBase.prototype.updateAnimation;
Game_CharacterBase.prototype.updateAnimation = function() {
    if (REGame.map.floorId().isEntitySystemMap()) {
        // RE System の下では、見た目の制御は Sequel に任せる
    }
    else {
        _Game_CharacterBase_updateAnimation.call(this);
    }
}
