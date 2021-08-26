import { assert } from "ts/Common";
import { DState, DStateId } from "ts/data/DState";
import { DStateGroup } from "ts/data/DStateGroup";
import { REData } from "ts/data/REData";
import { LEntity, LStateLevelType } from "ts/objects/LEntity";
import { LState } from "ts/objects/states/LState";
import { SCommandContext } from "ts/system/SCommandContext";
import { SStateFactory } from "ts/system/SStateFactory";

export interface StateAddition {
    stateId: DStateId;
    level: number;
    levelType: LStateLevelType;
}

interface WorkState {
    data: DState;
    removing: boolean;
    new: boolean;
    level: number;
}
interface WorkStateGroup {
    data: DStateGroup;
    states: WorkState[];
}

export class UState {

    public static resolveStates(entity: LEntity, newStates: StateAddition[], removeStateIds: DStateId[]): LState[] {
        const currentStates: WorkState[] = entity.states().map(s => { return { data: s.stateData(), removing: false, new: false, level: s.level() }; });
        const stateGroups: WorkStateGroup[] = REData.stateGroups.map(sg => { return { data: sg, states: [] }; });

        // 新規ステート
        for (const newState of newStates) {
            let state = currentStates.find(s => s.data.id == newState.stateId);
            if (state) {
            }
            else {
                state = { data: REData.states[newState.stateId], removing: false, new: true, level: 0 };
                currentStates.push(state);
            }

            // Level 設定
            switch (newState.levelType) {
                case LStateLevelType.AbsoluteValue:
                    state.level = newState.level;
                    break;
                case LStateLevelType.RelativeValue:
                    state.level += newState.level;
                    break;
                default:
                    throw new Error("Unreachable.");
            }

            // level 0 は削除
            if (state.level == 0) {
                state.removing = true;
            }
        }

        // 明示的に削除するべきものに削除マークを付ける
        for (const stateId of removeStateIds) {
            const state = currentStates.find(s => s.data.id == stateId);
            if (state) {
                state.removing = true;
            }
        }

        // 既存ステートのうち自動付加条件を持つものは、満たされてないものに削除マークをつける
        for (const state of currentStates) {
            if (state.data.autoAdditionCondition) {
                const a = entity;
                const cond = eval(state.data.autoAdditionCondition);
                if (!cond) {
                    state.removing = true;
                }
            }
        }

        // 自動付加条件を満たすステートを、いったんすべて追加する
        for (const data of REData.states) {
            if (data.autoAdditionCondition && !currentStates.find(s => s.data.id == data.id)) {
                const a = entity;
                const cond = eval(data.autoAdditionCondition);
                if (cond === true) {
                    currentStates.push({ data: data, removing: false, new: true, level: 1 });
                }
            }
        }

        // StateGroup に State を集める
        for (const state of currentStates) {
            for (const stateGroupId of state.data.stateGroupIds) {
                stateGroups[stateGroupId].states.push(state);
            }
        }

        // 後の処理をしやすくするため、グループごとに優先度でソートしておく (昇順)
        for (const stateGroup of stateGroups) {
            if (stateGroup.states.length > 0) {
                stateGroup.states.sort((a, b) => {
                    if (a.data.priority == b.data.priority)
                        return a.data.id - b.data.id;
                    else
                        return a.data.priority - b.data.priority;
                });
            }
        }

        // 排他ステートの処理。
        // グループごとの一番後ろの state (優先度が一番大きい) だけ残して、削除マークを付ける。
        for (const stateGroup of stateGroups) {
            if (stateGroup.data.exclusive) {
                // 削除マークのついていない一番後ろの state を探す
                let thr = -1;
                for (let i = stateGroup.states.length - 1; i >= 0; i--) {
                    if (!stateGroup.states[i].removing) {
                        thr = i;
                        break;
                    }
                }
                // そこまで消す
                for (let i = 0; i < thr; i++) {
                    stateGroup.states[i].removing = true;
                }
            }
        }


        // 削除マーク付きで、実際に存在している LState を削除する
        const oldStates = entity.states();
        for (const workState of currentStates) {
            if (workState.removing) {
                const state = oldStates.find(s => s.stateDataId() == workState.data.id);
                if (state) {
                    state.clearParent();
                    state.onDetached();
                    entity._effectResult.pushRemovedState(workState.data.id);
                }
            }
        }

        // 新たなリストを作る
        const result: LState[] = [];
        for (const workState of currentStates) {
            if (!workState.removing) {
                let state = oldStates.find(s => s.stateDataId() == workState.data.id);
                if (state) {
                    if (workState.new) {
                        assert(!workState.new);
                    }
                    state.recast();
                }
                else {
                    assert(workState.new);
                    
                    state = SStateFactory.newState(workState.data.id);
                    state.setParent(entity);
                    assert(state.hasId());
                    state.onAttached();
                    entity._effectResult.pushAddedState(workState.data.id);
                }

                state.setLevel(workState.level);
                result.push(state);
            }
        }

        return result;
    }

}
