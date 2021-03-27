import { assert } from '../Common';
import { REDataManager } from '../data/REDataManager';
import { REVisual } from '../visual/REVisual';

export class Game_REPrefabEvent extends Game_Event {
    private _databaseMapEventId: number;
    private _spritePrepared: boolean;

    constructor(mapId: number, dataMapId: number, eventId: number) {
        // "RE-Database" のマップのイベントとして扱う。
        // セルフスイッチをコントロールするときに参照される。
        super(dataMapId, eventId);
        this._databaseMapEventId = 1;
        this._spritePrepared = false;
    }
    

    databaseMapEventId(): number {
        return this._databaseMapEventId;
    }
    
    isREPrefab(): boolean {
        return true;
    }

    isREExtinct(): boolean {
        return this._erased;
    }
    
    isRESpritePrepared(): boolean {
        return this._spritePrepared;
    }

    setSpritePrepared(value: boolean) {
        this._spritePrepared = true;
    }
}


//==============================================================================
// Game_CharacterBase

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

//==============================================================================
// Game_Event

declare global {
    interface Game_Event {
        isREEvent(): boolean;
    }
}

Game_Event.prototype.isREEvent = function() {
    return true;
};

//==============================================================================
// Game_Map

declare global {
    interface Game_Map {
        getREPrefabEvents(): Game_CharacterBase[];
        spawnREEvent(eventData: IDataMapEvent): Game_REPrefabEvent;
        //spawnREEventFromCurrentMapEvent(eventId: number): Game_REPrefabEvent;
    }
}

Game_Map.prototype.spawnREEvent = function(eventData: IDataMapEvent): Game_REPrefabEvent {
    if (!$dataMap.events) {
        throw new Error();
    }

    // 新しい Game_Event ID を発行
    const eventId = this._events.length;

    // 新しい Game_Event に対応する IDataMapEvent を登録する。
    // こうしておかないと、Game_Event のコンストラクタの locate で例外する。
    $dataMap.events[eventId] = eventData;

    var event = new Game_REPrefabEvent(this._mapId, REDataManager.databaseMapId, eventId);
    this._events[eventId] = event;
    return event;
}

/*
Game_Map.prototype.spawnREEventFromCurrentMapEvent = function(eventId: number): Game_REPrefabEvent {
    var event = new Game_REPrefabEvent(this._mapId, this._mapId, eventId);
    this._events[eventId] = event;
    return event;
}
*/

Game_Map.prototype.getREPrefabEvents = function(): Game_CharacterBase[] {
    return this.events().filter(function(event: Game_CharacterBase) {
        return event.isREPrefab();
    });
}


//==============================================================================
// Spriteset_Map

declare global {
    interface Spriteset_Map {
        _prefabSpriteIdRE: number;

        updateREPrefabEvent(): void;
        makeREPrefabEventSprite(event: Game_REPrefabEvent): void;
        removeREPrefabEventSprite(index: number): void;
    }
}

var _Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters;
Spriteset_Map.prototype.createCharacters = function() {
    console.log("$gameMap.events()", $gameMap.events());

    this._prefabSpriteIdRE = this._counter + 1;
    _Spriteset_Map_createCharacters.call(this);

    console.log("this._characterSprites", this._characterSprites);
    
    // Visual と Sprite を関連付ける
    if (REVisual.entityVisualSet) {
        this._characterSprites.forEach((sprite, index) => {
            console.log("index", index);
            if (REVisual.entityVisualSet && sprite._character.isREEvent()) {
                const event = (sprite._character as Game_Event);
                const visual = REVisual.entityVisualSet.findEntityVisualByRMMZEventId(event.eventId());
                visual?._setSpriteIndex(index);
            }
        });
    }
};

var _Spriteset_Map_update = Spriteset_Map.prototype.update;
Spriteset_Map.prototype.update = function() {
    _Spriteset_Map_update.call(this);
    this.updateREPrefabEvent();
};

Spriteset_Map.prototype.updateREPrefabEvent = function() {
    $gameMap.getREPrefabEvents().forEach((event: Game_CharacterBase) => {
        if (!event.isRESpritePrepared()) {
            this.makeREPrefabEventSprite(event as unknown as Game_REPrefabEvent);
        }
    });
    
    for (var i = 0, n = this._characterSprites.length; i < n; i++) {
        const sprite = this._characterSprites[i];
        
        if (sprite.isRECharacterExtinct() && !sprite._character.isAnimationPlaying()) {
            this.removeREPrefabEventSprite(i--);
            n--;
        }
    }
};

Spriteset_Map.prototype.makeREPrefabEventSprite = function(event: Game_REPrefabEvent) {
    assert(REVisual.manager);
    
    event.setSpritePrepared(true);
    var sprite = new Sprite_Character(event as unknown as Game_Character);

    const spriteIndex = this._characterSprites.length;
    this._characterSprites.push(sprite);

    const t: any = this._tilemap;
    t.addChild(sprite);

    // Visual と Sprite を関連付ける
    if (REVisual.entityVisualSet) {
        const visual = REVisual.entityVisualSet.findEntityVisualByRMMZEventId(event.eventId());
        visual?._setSpriteIndex(spriteIndex);
    }
};

Spriteset_Map.prototype.removeREPrefabEventSprite = function(index: number) {
    var sprite = this._characterSprites[index];
    this._characterSprites.splice(index, 1);
    sprite.endAllEffect();

    const t: any = this._tilemap;
    t.removeChild(sprite);
};


