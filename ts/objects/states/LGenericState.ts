import { DStateId } from "ts/data/DState";
import { REGame_Behavior } from "ts/RE/REGame_Behavior";
import { LState } from "./State";

export class LGenericState extends REGame_Behavior {
    _stateId: DStateId = 0;
}
