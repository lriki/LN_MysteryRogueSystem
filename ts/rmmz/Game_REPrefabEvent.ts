import { assert } from "ts/Common";
import { SRmmzHelpers } from "ts/system/SRmmzHelpers";


export class Game_REPrefabEvent extends Game_Event {
    //private _databaseMapEventId: number;
    private _spritePrepared: boolean;

    // Database マップ上の Prefab イベントId.
    // $dataMap.events のインデックスではない点に注意。
    _prefabEventDataId: number = 0;

    constructor(dataMapId: number, eventId: number) {
        // mapId は "RE-Database" のマップのイベントとして扱う。
        // セルフスイッチをコントロールするときに参照される。
        // REシステムとしてはセルフスイッチは使用しないため実際のところなんでもよい。
        super(dataMapId, eventId);

        //this._databaseMapEventId = 1;
        this._spritePrepared = false;
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

    public restorePrefabEventData(): void {
        assert(this._prefabEventDataId > 0);
        const eventData = SRmmzHelpers.getPrefabEventDataById(this._prefabEventDataId);
        $dataMap.events[this.eventId()] = eventData;
    }

}

