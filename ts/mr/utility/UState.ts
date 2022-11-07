import { assert, tr2 } from "ts/mr/Common";
import { LStateLevelType } from "ts/mr/data/DEffect";
import { DAutoRemovalTiming, DState, DStateEffect, DStateId } from "ts/mr/data/DState";
import { DStateGroup } from "ts/mr/data/DStateGroup";
import { MRData } from "ts/mr/data/MRData";
import { LEntity } from "ts/mr/lively/LEntity";
import { LState } from "ts/mr/lively/states/LState";
import { SStateFactory } from "ts/mr/system/SStateFactory";
import { Diag } from "../Diag";

export interface StateAddition {
    stateId: DStateId;
    level: number;
    levelType: LStateLevelType;
}

interface WorkState {
    data: DState;
    submatchEffectIndex: number;
    removing: boolean;
    new: boolean;
    level: number;
}
interface WorkStateGroup {
    data: DStateGroup;
    states: WorkState[];
}

export class UState {

    private static effect(state: WorkState): DStateEffect {
        if (state.submatchEffectIndex >= 0)
            return MRData.states[state.submatchEffectIndex].effect;
        else
            return state.data.effect;
    }

    /**
     * ステート追加・削除のメイン処理
     * 
     * ステートには能力値の変化を与えるものや、現在の能力値によって自動付加されるものがある。
     * 例えばステートをまとめて追加する場合、ひとつ追加するたびに自動付加の判定を行うと、
     * 想定外のステート追加が一瞬発生してすぐ削除されるなど予測しづらい副作用を伴うことがある。
     * 
     * そのため一度にまとめて追加する場合はまず先にすべてのステートを評価し、
     * 本当に消すべきもの・残すべきもの・追加するべきものを判断して必要な操作だけを行えるようにする。
     */
    public static resolveStates(entity: LEntity, newStates: StateAddition[], removeStateIds: DStateId[]): LState[] {
        const entityData = entity.data;
        const currentStates: WorkState[] = entity.states().map(s => { return { data: s.stateData(), submatchEffectIndex: s.submatchEffectIndex(), removing: false, new: false, level: s.level() }; });
        const stateGroups: WorkStateGroup[] = MRData.stateGroups.map(sg => { return { data: sg, states: [] }; });

        // 新規ステート
        for (const newState of newStates) {
            let state = currentStates.find(s => s.data.id == newState.stateId);
            if (state) {
                // 既に追加済み
            }
            else if (!entity.isStateAddable(newState.stateId)) {
                // 耐性がある等、追加できない
                continue;
            }
            else {
                state = {
                    data: MRData.states[newState.stateId],
                    submatchEffectIndex: this.selectEffectIndex(entity, MRData.states[newState.stateId]),
                    removing: false,
                    new: true,
                    level: 0 };
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

        // 既存ステートのうち自動付加・自動削除条件を持つものは、満たされてないものに削除マークをつける
        for (const state of currentStates) {
            if (state.data.autoAdditionCondition) {
                let cond: boolean = false;
                try {
                    const a = entity;
                    cond = eval(state.data.autoAdditionCondition);
                }
                catch (e) {
                    Diag.error(tr2("ステートの自動付加条件の評価に失敗しました。ステートID: %1 条件: %2").format(state.data.id, state.data.autoAdditionCondition));
                }
                if (!cond) {
                    state.removing = true;
                }
            }

            // 削除のチェック
            if (this.checkRemoveAtActualParam(this.effect(state), entity)) {
                state.removing = true;
            }
        }

        // 自動付加条件を満たすステートを、いったんすべて追加する
        for (const data of MRData.states) {
            if (data.autoAdditionCondition && !currentStates.find(s => s.data.id == data.id)) {
                let cond: boolean = false;
                try {
                    const a = entity;
                    cond = eval(data.autoAdditionCondition);
                }
                catch (e) {
                    Diag.error(tr2("ステートの自動付加条件の評価に失敗しました。ステートID: %1 条件: %2").format(data.id, data.autoAdditionCondition));
                }
                if (cond === true) {
                    currentStates.push({
                        data: data,
                        submatchEffectIndex: this.selectEffectIndex(entity, data),
                        removing: false,
                        new: true, level: 1 });
                }
            }
        }
        for (const data of entityData.autoAdditionStates) {
            if (!currentStates.find(s => s.data.id == data.stateId)) {
                const a = entity;
                const cond = eval(data.condition);
                if (cond === true) {
                    currentStates.push({
                        data: MRData.states[data.stateId],
                        submatchEffectIndex: this.selectEffectIndex(entity, MRData.states[data.stateId]),
                        removing: false, new: true, level: 1 });
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
                    state.onDetached(entity);
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
                    state._submatchEffectIndex = workState.submatchEffectIndex;
                    state.setParent(entity);
                    assert(state.hasId());
                    state.onAttached(entity);
                    entity._effectResult.pushAddedState(workState.data.id);
                }

                state.setLevel(workState.level);
                result.push(state);
            }
        }

        return result;
    }

    private static selectEffectIndex(entity: LEntity, state: DState): number {
        for (let i = state.submatchStates.length - 1; i >= 0; i--) {
            const stateId = state.submatchStates[i];
            const effect = MRData.states[stateId].effect;
            if (this.meetsConditions(entity, effect)) {
                return i;
            }
        }
        return -1;
    }

    private static meetsConditions(entity: LEntity, effect: DStateEffect): boolean {
        //const entityData = entity.data();

        if (effect.matchConditions.kindId != 0) {
            const kindId = entity.kindDataId();
            if (effect.matchConditions.kindId != kindId) {
                return false;
            }
        }
        return true;
    }

    private static checkRemoveAtActualParam(effect: DStateEffect, entity: LEntity): boolean {
        const a = entity;
        for (const r of effect.autoRemovals) {
            if (r.kind == DAutoRemovalTiming.ActualParam) {
                const v = eval(r.formula);
                if (v === true) {
                    return true;
                }
            }
        }
        return false;
    }

    public static attemptRemoveStateAtFloorTransfer(entity: LEntity): void {
        const removes: DStateId[] = [];
        entity.iterateStates(s => {
            if (s.stateEffect().autoRemovals.find(x => x.kind == DAutoRemovalTiming.FloorTransfer)) {
                removes.push(s.stateDataId());
            }
            return true;
        });
        entity.removeStates(removes);
    }
    
    
    public static meetsApplyConditions(state: DState, target: LEntity): boolean {
        if (state.applyConditions.kindIds.length > 0) {
            if (!state.applyConditions.kindIds.find(x => x === target.kindDataId())) {
                return false;
            }
        }
        return true;
    }
}
