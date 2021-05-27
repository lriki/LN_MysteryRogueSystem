import { REGame } from "ts/objects/REGame";


declare global {
    interface Game_CharacterBase {
        isREEvent(): boolean;   // Event であるか。他のプラグインとの競合回避のため、RE プレフィックスをつけている。
        isREPrefab(): boolean;
        isRESpritePrepared(): boolean;
        isREExtinct(): boolean;
    }
}

Game_CharacterBase.prototype.isREEvent = function() {
    return false;
};

Game_CharacterBase.prototype.isREPrefab = function() {
    return false;
};

Game_CharacterBase.prototype.isRESpritePrepared = function() {
    return false;
};

Game_CharacterBase.prototype.isREExtinct = function() {
    return false;
};

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
