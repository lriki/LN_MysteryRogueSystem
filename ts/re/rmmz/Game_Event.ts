import { DHelpers, RmmzREEventMetadata } from "ts/re/data/DHelper";
import { REGame } from "ts/re/objects/REGame";
import { SRmmzHelpers } from "ts/re/system/SRmmzHelpers";
import { assert } from "../Common";
import { REDataManager } from "../data/REDataManager";
import { LState } from "../objects/states/LState";
import { REVisual } from "../visual/REVisual";


const dummyMapEvent: IDataMapEvent = {
    id: 0,
    name: "",
    note: "",
    pages: [],
    x: 0,
    y: 0,
}


declare global {
    interface Game_Event {
        //_entityData: DEntitySpawner2 | undefined;
        _isREEntity: boolean;
        _reEventData: RmmzREEventMetadata | undefined;

        
        _spritePrepared_RE: boolean;
        _prefabEventDataId_RE: number;   // Database マップ上の Prefab イベントId.
        _eventData_RE: IDataMapEvent | undefined;
        _pageData_RE: (RmmzREEventMetadata | undefined)[];

        setupPrefab(prefabEventDataId: number, mapId: number, eventData: IDataMapEvent): void;
        isREEntity(): boolean;
        isREEvent(): boolean;
        isREPrefab(): boolean;
        isREExtinct(): boolean;
        isRESpritePrepared(): boolean;
        setSpritePrepared(value: boolean): void;
    }
}

/*
const _Game_Event_initialize = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = function(mapId: number, eventId: number) {
    if (mapId > 0) {
        _Game_Event_initialize.call(this, mapId, eventId);
    }
    else {
        console.log("_Game_Event_initialize");
        Game_Character.prototype.initialize.call(this);
    }
};
*/

var _Game_Event_initMembers = Game_Event.prototype.initMembers;
Game_Event.prototype.initMembers = function() {
    // RE-Event の場合、mapId は "RE-Database" のマップのイベントとして扱う。
    // セルフスイッチをコントロールするときに参照される。
    // REシステムとしてはセルフスイッチは使用しないため実際のところなんでもよい。

    _Game_Event_initMembers.call(this);
    this._prefabEventDataId_RE = 0;
    this._spritePrepared_RE = false;
    this._pageData_RE = [];
}

var _Game_Event_event = Game_Event.prototype.event;
Game_Event.prototype.event = function(): IDataMapEvent {
    if (this.isREEvent() || this._mapId == REDataManager.databaseMapId) {
        // Game_Event のコンストラクタは event() を呼び出し、初期座標を決めようとする。
        // その時点では this._eventData をセットすることは TypeScript の仕様上不可能なので、ダミーを参照させる。
        // 実際のところ Entity と Event の座標同期は update で常に行われるため、初期座標が (0,0) でも問題はない。
        return (this._eventData_RE) ? this._eventData_RE : dummyMapEvent;
    }
    else {
        return _Game_Event_event.call(this);
    }
}

var _Game_Event_isTriggerIn = Game_Event.prototype.isTriggerIn;
Game_Event.prototype.isTriggerIn = function(triggers) {
    if (this.isREEntity())
        return false;   // イベント実行タイミングはすべて RE システム無いから決められる
    else
        return triggers.includes(this._trigger);
}

var _Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
Game_Event.prototype.setupPageSettings = function() {
    _Game_Event_setupPageSettings.call(this);

    this._isREEntity = !!SRmmzHelpers.readEntityMetadata(this);
    this._reEventData = (this._pageIndex >= 0) ? DHelpers.readREEventMetadataFromPage(this.page()) : undefined;
}

var _Game_Event_meetsConditions = Game_Event.prototype.meetsConditions;
Game_Event.prototype.meetsConditions = function(page: IDataMapEventPage): boolean {
    if (!_Game_Event_meetsConditions.call(this, page)) {
        return false;
    }

    const index = this.event().pages.findIndex(x => x == page);
    assert(index >= 0);
    const additionalData = this._pageData_RE[index];
    if (additionalData && additionalData.condition_state) {
        if (REVisual.entityVisualSet) {
            const visual = REVisual.entityVisualSet.findEntityVisualByRMMZEventId(this.eventId());
            if (visual) {
                const statekey = additionalData.condition_state;
                const state = visual.entity()._states.find(x => (REGame.world.object(x) as LState).stateData().key == statekey);
                if (!state) {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    return true;
}

const _Game_Event_update = Game_Event.prototype.update;
Game_Event.prototype.update = function() {
    if (REGame.map.floorId().isEntitySystemMap()) {
        
    }
    else {
        _Game_Event_update.call(this);
    }
}

Game_Event.prototype.setupPrefab = function(prefabEventDataId: number, mapId: number,eventData: IDataMapEvent): void {
    this._mapId = mapId;
    this._prefabEventDataId_RE = prefabEventDataId;
    this._eventData_RE = eventData;
    this._pageData_RE = [];
    for (let i = 0; i < this._eventData_RE.pages.length; i++) {
        const data = DHelpers.readREEventMetadataFromPage(this._eventData_RE.pages[i]);
        if (data) {
            this._pageData_RE[i] = data;
        }
    }
    this.refresh();
}

Game_Event.prototype.isREEntity = function(): boolean {
    return this._isREEntity;
}

Game_Event.prototype.isREEvent = function() {
    return this._prefabEventDataId_RE > 0;
}

Game_Event.prototype.isREPrefab = function() {
    return this._prefabEventDataId_RE > 0;
}

Game_Event.prototype.isREExtinct = function(): boolean {
    return this._erased;
}

Game_Event.prototype.isRESpritePrepared = function(): boolean {
    return this._spritePrepared_RE;
}

Game_Event.prototype.setSpritePrepared = function(value: boolean) {
    this._spritePrepared_RE = true;
}
