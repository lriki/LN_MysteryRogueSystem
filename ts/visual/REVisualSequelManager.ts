import { RESequelSet } from "../RE/REGame_Sequel";


/**
 * 同時に並列実行する VisualSequel の集合
 */
export interface REVisualSequelRun {
    
}


export class REVisualSequelManager {
    private _activeSequelSet: RESequelSet | undefined;

    setup(sequelSet: RESequelSet) {
        this._activeSequelSet = sequelSet;

    }



	//void setup(rogue::SequelStage* sequelStage);
	//void update(float elapsedSeconds);
	//bool isLogicalRunning() const;
}

