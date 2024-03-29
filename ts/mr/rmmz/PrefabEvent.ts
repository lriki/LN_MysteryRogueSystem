/**
 * RE用動的スプライトのライフサイクル
 * ----------
 * Entity が削除されても、動的に作成された REEvent 及び対応する CharacterSprite は
 * 非表示になるだけで、削除されることは無い。
 * 新たな Entity が作成されると、これが再利用される。
 * 
 * REEvent は通常の Event と同じ更新処理を適用したいため、$gameMap.events で管理される。
 * REEvent のインスタンス削除が発生すれば当然このリストからも取り除く必要があるが、
 * そうすると取り除いた箇所の index が undefined になってしまう。
 * コアスクリプトはそのような状態を想定していないためクラッシュする。
 */

import { SRmmzHelpers } from "ts/mr/system/SRmmzHelpers";
import { assert } from "../Common";
import { DPrefab, DPrefabId } from "../data/DPrefab";
import { MRDataManager } from "../data/MRDataManager";
import { MRView } from "../view/MRView";

//==============================================================================
// Game_Map

declare global {
    interface Game_Map {
        getREPrefabEvents(): Game_CharacterBase[];
        spawnREEvent(prefab: DPrefab, resetEventId: number | undefined, overrideEventData: IDataMapEvent | undefined): Game_Event;
    }
}

Game_Map.prototype.spawnREEvent = function(prefab: DPrefab, resetEventId: number | undefined, overrideEventData: IDataMapEvent | undefined): Game_Event {
    if (!$dataMap.events) {
        throw new Error();
    }

    assert(prefab.id > 0);
    assert(prefab.rmmzEventData.id > 0);
    const eventData = overrideEventData ?? prefab.rmmzEventData;

    // override 指定がある場合は既存イベントを再 setup する。
    // これによって固定マップのイベントではなく、Prefab マップのイベント内容として構築される。
    if (resetEventId) {
        const data = $dataMap.events[resetEventId];
        assert(data);
        const event = this._events[resetEventId] as Game_Event;
        event.initMembers();
        event.increaseRERevision();
        event.setupPrefab(prefab, $gameMap.mapId(), data);
        return event;
    }

    // フリー状態の REEvent を探してみる
    let eventId = this._events.findIndex(e =>e && e.isREEvent() && e.isREExtinct());
    if (eventId < 0) {
        // 見つからなければ新しく作る
        eventId = this._events.length;
        
        const event = new Game_Event(prefab.rmmzMapId, eventId);
        event.setupPrefab(prefab, prefab.rmmzMapId, eventData);
        this._events[eventId] = event;
        return event;
    }
    else {
        const event = this._events[eventId] as Game_Event;
        assert(event.isREEvent());

        // 再構築
        const spritePrepared_RE = event.isRESpritePrepared();
        event.initMembers();
        event.increaseRERevision();
        event.setupPrefab(prefab, prefab.rmmzMapId, eventData);
        event.setSpritePrepared(spritePrepared_RE); // initMembers でリセットされるが、スプライト割り当て済みフラグは維持する
        return event;
    }
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
        makeREPrefabEventSprite(event: Game_Event): void;
        //removeREPrefabEventSprite(index: number): void;
    }
}

// Scene 開始時の Sprite 生成
var _Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters;
Spriteset_Map.prototype.createCharacters = function() {
    this._prefabSpriteIdRE = this._counter + 1;
    _Spriteset_Map_createCharacters.call(this);

    for (let i = 0; i < this._characterSprites.length; i++) {
        const sprite =  this._characterSprites[i];
        if (sprite._character instanceof Game_Event) {
            // 固定マップで初期配置されているイベント用
            sprite._spriteIndex = i;

            if (sprite._character.isREEvent()) {
                sprite._character.setSpritePrepared(true);
            }
        }
    }
};

var _Spriteset_Map_update = Spriteset_Map.prototype.update;
Spriteset_Map.prototype.update = function() {
    this.updateREPrefabEvent();
    _Spriteset_Map_update.call(this);
};

Spriteset_Map.prototype.updateREPrefabEvent = function() {
    $gameMap.getREPrefabEvents().forEach((event: Game_CharacterBase) => {
        if (!event.isRESpritePrepared()) {
            this.makeREPrefabEventSprite(event as Game_Event);
        }
    });
    
    /*
    for (var i = 0, n = this._characterSprites.length; i < n; i++) {
        const sprite = this._characterSprites[i];
        
        if (sprite.isRECharacterExtinct() && !sprite._character.isAnimationPlaying()) {
            this.removeREPrefabEventSprite(i--);
            n--;
        }
    }
    */

    
    // Visual と Sprite を関連付ける
    if (MRView.entityVisualSet) {
        for (const visual of MRView.entityVisualSet.entityVisuals()) {
            if (visual.rmmzSpriteIndex() < 0) {
                const spriteIndex = this._characterSprites.findIndex(s => (s._character instanceof Game_Event) && s._character.eventId() == visual.rmmzEventId());
                if (spriteIndex < 0) {
                    console.log(this._characterSprites);
                    console.log("visual", visual);
                }
                assert(spriteIndex >= 0);
                visual._setSpriteIndex(spriteIndex);
            }
        }

        /*
        this._characterSprites.forEach((sprite, index) => {
            if (REVisual.entityVisualSet && sprite._character.isREEvent()) {
                const event = (sprite._character as Game_Event);
                const visual = REVisual.entityVisualSet.findEntityVisualByRMMZEventId(event.eventId());
                visual?._setSpriteIndex(index);
                if (event instanceof Game_REPrefabEvent) {
                    event.setSpritePrepared(true);
                }
            }
        });
        */
    }
};

Spriteset_Map.prototype.makeREPrefabEventSprite = function(event: Game_Event) {
    assert(MRView.sequelFactory);

    event.setSpritePrepared(true);
    var sprite = new Sprite_Character(event as unknown as Game_Character);

    const spriteIndex = this._characterSprites.length;
    this._characterSprites.push(sprite);
    sprite._spriteIndex = spriteIndex;

    const t: any = this._tilemap;
    t.addChild(sprite);

    
    //console.log("makeREPrefabEventSprite this._characterSprites", this._characterSprites.length);
}

/*
Spriteset_Map.prototype.removeREPrefabEventSprite = function(index: number) {
    var sprite = this._characterSprites[index];
    this._characterSprites.splice(index, 1);
    sprite.endAllEffect();

    const t: any = this._tilemap;
    t.removeChild(sprite);
};

*/
