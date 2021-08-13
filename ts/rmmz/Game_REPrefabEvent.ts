

export class Game_REPrefabEvent extends Game_Event {
    private _databaseMapEventId: number;
    private _spritePrepared: boolean;

    constructor(dataMapId: number, eventId: number) {
        // mapId は "RE-Database" のマップのイベントとして扱う。
        // セルフスイッチをコントロールするときに参照される。
        // REシステムとしてはセルフスイッチは使用しないため実際のところなんでもよい。
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

    // ベースで event() を呼び出してしまうため封印
    refresh() {

    }

}

