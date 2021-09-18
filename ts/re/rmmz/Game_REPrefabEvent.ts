import { assert, RESerializable } from "ts/re/Common";
import { DHelpers, RmmzREEventMetadata } from "ts/re/data/DHelper";
import { REGame } from "ts/re/objects/REGame";
import { LState } from "ts/re/objects/states/LState";
import { REVisual } from "ts/re/visual/REVisual";

const dummyMapEvent: IDataMapEvent = {
    id: 0,
    name: "",
    note: "",
    pages: [],
    x: 0,
    y: 0,
}


@RESerializable
export class Game_REPrefabEvent extends Game_Event {
    //private _databaseMapEventId: number;
    private _spritePrepared: boolean;

    //_visualId: number = 0;

    // Database マップ上の Prefab イベントId.
    // $dataMap.events のインデックスではない点に注意。
    _prefabEventDataId: number = 0;

    _eventData: IDataMapEvent | undefined;
    _pageData: (RmmzREEventMetadata | undefined)[];
    //_activePageIndex = 0;

    constructor(dataMapId: number, eventId: number) {
        // mapId は "RE-Database" のマップのイベントとして扱う。
        // セルフスイッチをコントロールするときに参照される。
        // REシステムとしてはセルフスイッチは使用しないため実際のところなんでもよい。
        super(dataMapId, eventId);

        //this._databaseMapEventId = 1;
        this._spritePrepared = false;
        this._pageData = [];

    }

    public setupPrefab(prefabEventDataId: number, eventData: IDataMapEvent): void {
        this._prefabEventDataId = prefabEventDataId;
        this._eventData = eventData;
        this._pageData = [];
        for (let i = 0; i < this._eventData.pages.length; i++) {
            const data = DHelpers.readREEventMetadataFromPage(this._eventData.pages[i]);
            if (data) {
                this._pageData[i] = data;
                console.log("_pageData", i, data);
            }
        }
        this.refresh();
    }

    /*
    setPageIndex(index : number): void {
        if (this._activePageIndex != index) {
            this._activePageIndex = index;
            this.refresh();
        }
    }
    */

    event(): IDataMapEvent {
        // Game_Event のコンストラクタは event() を呼び出し、初期座標を決めようとする。
        // その時点では this._eventData をセットすることは TypeScript の仕様上不可能なので、ダミーを参照させる。
        // 実際のところ Entity と Event の座標同期は update で常に行われるため、初期座標が (0,0) でも問題はない。
        return (this._eventData) ? this._eventData : dummyMapEvent;
    }
    
    //findProperPageIndex(): number {
        // 条件検索ではなく、Visual からの直接指定で決める
        //return this._activePageIndex;
    //}

    
    meetsConditions(page: IDataMapEventPage): boolean {
        if (!super.meetsConditions(page)) {
            return false;
        }

        const index = this.event().pages.findIndex(x => x == page);
        assert(index >= 0);
        const additionalData = this._pageData[index];
        if (additionalData && additionalData.condition_state) {
            console.log("additionalData.condition_state", additionalData.condition_state);
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

    //databaseMapEventId(): number {
    //    return this._databaseMapEventId;
    //}
    
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

    // ベースで event() を呼び出してしまうため封印
    //refresh() {

   // }

   /*
    public restorePrefabEventData(): void {
        assert(this._prefabEventDataId > 0);
        const eventData = SRmmzHelpers.getPrefabEventDataById(this._prefabEventDataId);
        $dataMap.events[this.eventId()] = eventData;
    }
    */

}

