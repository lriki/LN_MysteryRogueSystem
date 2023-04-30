import { MRLively } from "ts/mr/lively/MRLively";
import { SRmmzHelpers } from "ts/mr/system/SRmmzHelpers";
import { assert } from "../Common";
import { DAnnotationReader, DRmmzEventPageAnnotation, DRmmzFloorEventAnnotation, DRmmzPrefabEventAnnotation } from "../data/importers/DAnnotationReader";
import { DPrefab, DPrefabId } from "../data/DPrefab";
import { MRDataManager } from "../data/MRDataManager";
import { LState } from "../lively/states/LState";
import { MRView } from "../view/MRView";
import { VEntityId } from "../view/VCommon";
import { LEntityId } from "../lively/LObject";


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
        _reEventData: DRmmzPrefabEventAnnotation | undefined;

        
        _spritePrepared_RE: boolean;
        _prefabId_RE: DPrefabId;
        _eventData_RE: IDataMapEvent | undefined;
        _pageData_RE: (DRmmzPrefabEventAnnotation | undefined)[];
        _MREventPageAnnotations: (DRmmzEventPageAnnotation | undefined)[];
        //_MRVisualId: VEntityId;
        _MRNeedsRefresh: boolean;
        _MREntityId: LEntityId | undefined;
        _MRFloorEventAnnotation: DRmmzFloorEventAnnotation | undefined;

        setupPrefab(prefab: DPrefab, mapId: number, eventData: IDataMapEvent): void;
        resetPrefab(prefab: DPrefab): void;
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

var _Game_Event_initialize = Game_Event.prototype.initialize;
Game_Event.prototype.initialize = function(mapId, eventId) {
    _Game_Event_initialize.call(this, mapId, eventId);
    
    // @MR-EventPage によるページごとの追加情報を取り出しておく
    const pages = this.event().pages;
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const annotation = page ?
            DAnnotationReader.readEventPageAnnotation(page) :
            undefined;
        this._MREventPageAnnotations.push(annotation);
    }
}

var _Game_Event_initMembers = Game_Event.prototype.initMembers;
Game_Event.prototype.initMembers = function() {
    // RE-Event の場合、mapId は "MR-Prefabs" のマップのイベントとして扱う。
    // セルフスイッチをコントロールするときに参照される。
    // REシステムとしてはセルフスイッチは使用しないため実際のところなんでもよい。

    _Game_Event_initMembers.call(this);
    this._prefabId_RE = 0;
    this._spritePrepared_RE = false;
    this._pageData_RE = [];
    this._MREventPageAnnotations = [];
    //this._MRVisualId = 0;


}

var _Game_Event_event = Game_Event.prototype.event;
Game_Event.prototype.event = function(): IDataMapEvent {
    if (this.isREEvent() || this._mapId == MRDataManager.databaseMapId) {
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

    this._isREEntity = !!SRmmzHelpers.readEntityMetadata(this, this._mapId);
    this._reEventData = (this._pageIndex >= 0) ? DAnnotationReader.readREEventAnnotationFromPage(this.page()) : undefined;
    this._MRFloorEventAnnotation = (this._pageIndex >= 0) ? DAnnotationReader.readFloorEventAnnotationFromPage(this.page()) : undefined;
}

var _Game_Event_meetsConditions = Game_Event.prototype.meetsConditions;
Game_Event.prototype.meetsConditions = function(page: IDataMapEventPage): boolean {
    if (!_Game_Event_meetsConditions.call(this, page)) {
        return false;
    }

    const index = this.event().pages.findIndex(x => x == page);

    // @MR-EventPage による条件チェック
    {
        const additionalData = this._MREventPageAnnotations[index];
        if (additionalData) {
            if (additionalData.conditionActivatedQuestTaskKey) {
                if (!MRLively.questManager.isQuestTaskAcivated(additionalData.conditionActivatedQuestTaskKey)) {
                    return false;
                }
            }
        }
    }


    assert(index >= 0);
    const additionalData = this._pageData_RE[index];
    if (additionalData && additionalData.condition_state) {
        if (MRView.entityVisualSet) {
            const visual = MRView.entityVisualSet.findEntityVisualByRMMZEventId(this.eventId());
            if (visual) {
                const statekey = additionalData.condition_state;
                const state = visual.entity()._states.find(x => (MRLively.world.object(x) as LState).stateData().key == statekey);
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
    // if (REGame.map.floorId().isEntitySystemMap()) {
        
    // }
    // else {
        _Game_Event_update.call(this);
    // }
}

const _Game_Event_refresh = Game_Event.prototype.refresh;
Game_Event.prototype.refresh = function() {
    _Game_Event_refresh.call(this);
    this._MRNeedsRefresh = true;
}

Game_Event.prototype.setupPrefab = function(prefab: DPrefab, mapId: number, eventData: IDataMapEvent): void {
    this._mapId = mapId;
    this._prefabId_RE = prefab.id;
    this._eventData_RE = eventData;
    this._pageData_RE = [];
    for (let i = 0; i < this._eventData_RE.pages.length; i++) {
        const data = DAnnotationReader.readREEventAnnotationFromPage(this._eventData_RE.pages[i]);
        if (data) {
            this._pageData_RE[i] = data;
        }
    }
    this.refresh();
}

Game_Event.prototype.resetPrefab = function(prefab: DPrefab): void {
    this._pageIndex = -2;   // pageIndex に変化が無い場合、refresh() しても setupPage() が呼ばれなくなるので、先にリセットする。
    this.setupPrefab(prefab, prefab.rmmzMapId, prefab.rmmzEventData);
}

Game_Event.prototype.isREEntity = function(): boolean {
    return this._isREEntity;
}

Game_Event.prototype.isREEvent = function() {
    return this._prefabId_RE > 0;
}

Game_Event.prototype.isREPrefab = function() {
    return this._prefabId_RE > 0;
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
