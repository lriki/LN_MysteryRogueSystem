import { assert } from "ts/Common";
import { SRmmzHelpers } from "ts/system/SRmmzHelpers";

const dummyMapEvent: IDataMapEvent = {
    id: 0,
    name: "",
    note: "",
    pages: [],
    x: 0,
    y: 0,
}

export class Game_REPrefabEvent extends Game_Event {
    //private _databaseMapEventId: number;
    private _spritePrepared: boolean;

    // Database マップ上の Prefab イベントId.
    // $dataMap.events のインデックスではない点に注意。
    _prefabEventDataId: number = 0;

    _eventData: IDataMapEvent | undefined;
    _activePageIndex = 0;

    constructor(dataMapId: number, eventId: number) {
        // mapId は "RE-Database" のマップのイベントとして扱う。
        // セルフスイッチをコントロールするときに参照される。
        // REシステムとしてはセルフスイッチは使用しないため実際のところなんでもよい。
        super(dataMapId, eventId);

        //this._databaseMapEventId = 1;
        this._spritePrepared = false;

    }

    setPageIndex(index : number): void {
        if (this._activePageIndex != index) {
            this._activePageIndex = index;
            this.refresh();
        }
    }

    event(): IDataMapEvent {
        // Game_Event のコンストラクタは event() を呼び出し、初期座標を決めようとする。
        // その時点では this._eventData をセットすることは TypeScript の仕様上不可能なので、ダミーを参照させる。
        // 実際のところ Entity と Event の座標同期は update で常に行われるため、初期座標が (0,0) でも問題はない。
        return (this._eventData) ? this._eventData : dummyMapEvent;
    }
    
    findProperPageIndex(): number {
        // 条件検索ではなく、Visual からの直接指定で決める
        return this._activePageIndex;
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

