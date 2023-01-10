import { assert } from "../Common";
import { DEntityId } from "../data/DEntity";
import { DPrefabId } from "../data/DPrefab";
import { DScript } from "../data/DScript";
import { LEntity } from "./LEntity";
import { LEntityId } from "./LObject";
import { MRLively } from "./MRLively";

export type LScriptId = number;

export enum LScriptCallMode {
    Query,
    Command,
}

export interface FindListAndLabelResult {
    list: IDataList[];
    index: number;
}

export interface TaklingCommand {
    label: string;
    displayName: string;
}

export class LScriptContext {
    public readonly id: LScriptId;
    public readonly entityId: LEntityId;
    public readonly finalClassScript: DScript;
    public readonly label: string;
    public readonly mode: LScriptCallMode;
    public readonly list: IDataList[];
    public readonly listIndex: number = 0;
    public talkingCommands: TaklingCommand[] = [];

    public constructor(id: LScriptId, entity: LEntity, finalClassScript: DScript, label: string, mode: LScriptCallMode) {
        this.id = id;
        this.entityId = entity.entityId().clone();
        this.finalClassScript = finalClassScript;
        this.label = label;
        this.mode = mode;


        // Select list.
        const result = this.findListAndLabel(label);
        assert(result);
        this.list = result.list;
        this.listIndex = result.index;
    }

    public get entity(): LEntity {
        return MRLively.world.entity(this.entityId);
    }

    public findListAndLabel(label: string): FindListAndLabelResult | undefined {
        const prefab = this.entity.data.prefab();
        const lists = [
            this.finalClassScript.list,
            prefab.scripts[0].list, // TODO: [1] 以降も有効化する？
        ];
        for (const list of lists) {
            const index1 = LScriptContext.findLabelIndex(list, label);
            if (index1 >= 0) {
                return {
                    list: list,
                    index: index1,
                }
            }
        }
        return undefined;
    }

    public static findLabelIndex(list: IDataList[], label: string): number {
        for (let i = 0; i < list.length; i++) {
            const command = list[i];
            if (command.code === 118) {
                if (command.parameters[0] === label) {
                    return i;
                }
            }
        }
        return -1;
    }
}
