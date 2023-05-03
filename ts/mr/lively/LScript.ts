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
    public readonly finalClassScript: DScript;
    public readonly label: string;
    public readonly mode: LScriptCallMode;

    public readonly entityId: LEntityId | undefined;
    public readonly list: IDataList[];
    public readonly listIndex: number;

    public talkingCommands: TaklingCommand[] = [];
    public questIconKey: string | undefined = undefined;

    public constructor(id: LScriptId, entity: LEntity | undefined, finalClassScript: DScript, label: string, mode: LScriptCallMode) {
        this.id = id;
        this.finalClassScript = finalClassScript;
        this.label = label;
        this.mode = mode;
        this.list = [];
        this.listIndex = 0;

        
        if (entity) {
            this.entityId = entity.entityId().clone();
            
            // Select list.
            const result = this.findListAndLabel(entity, this.label);
            if (result) {
                this.list = result.list;
                this.listIndex = result.index;
            }
        }
        else {
            const list = this.finalClassScript.list;
            const index1 = LScriptContext.findLabelIndex(list, this.label);
            if (index1 >= 0) {
                this.list = list;
                this.listIndex = index1;
            }
        }
    }
    public setupEventScript(): boolean {
        return true;
    }

    public get isValid(): boolean {
        return this.list.length > 0;
    }

    public get entity(): LEntity {
        assert(this.entityId);
        return MRLively.world.entity(this.entityId);
    }

    // NOTE: Visual の Collapse 中など、 entity が isDestroyed になっている場合がある。
    // MRLively.world.entity() で撮ろうとすると assert するので、引数で渡す。
    public findListAndLabel(entity: LEntity, label: string): FindListAndLabelResult | undefined {
        const prefab = entity.data.prefab();
        const lists = [
            prefab.scripts[0].list, // TODO: [1] 以降も有効化する？
            this.finalClassScript.list,
        ];

        const spawner = entity.getUniqueSpawner();
        if (spawner && spawner.overrideEvent) {
            console.log("TODO: Event Page condition.");
            lists.push(spawner.overrideEvent.pages[0].list);
        }

        for (let i = lists.length - 1; i >= 0; i--) {
            const list = lists[i];
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
