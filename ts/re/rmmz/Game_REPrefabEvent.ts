import { assert, RESerializable } from "ts/re/Common";
import { DHelpers, RmmzREEventMetadata } from "ts/re/data/DHelper";
import { REGame } from "ts/re/objects/REGame";
import { LState } from "ts/re/objects/states/LState";
import { REVisual } from "ts/re/visual/REVisual";


@RESerializable
export class Game_REPrefabEvent extends Game_Event {
    //private _databaseMapEventId: number;

    //_visualId: number = 0;


    //_activePageIndex = 0;

    constructor(dataMapId: number, eventId: number) {
        super(dataMapId, eventId);

        //this._databaseMapEventId = 1;

    }


    /*
    setPageIndex(index : number): void {
        if (this._activePageIndex != index) {
            this._activePageIndex = index;
            this.refresh();
        }
    }
    */

    
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
        const additionalData = this._pageData_RE[index];
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
    

    

    setSpritePrepared(value: boolean) {
        this._spritePrepared_RE = true;
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

