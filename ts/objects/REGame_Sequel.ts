import { assert } from "ts/Common";
import { REData, REData_Sequel } from "../data/REData";
import { REGame_Entity } from "./REGame_Entity";

/**
 * Sequel
 * 
 * Sequel 個別にデータを持たせたいときに利用予定 (継承よりはフィールドに持たせた方がいいかも)
 */
export class REGame_Sequel {
    private _entity: REGame_Entity;
    private _sequelId: number;
    private _parallel: boolean;

    constructor(entity: REGame_Entity, sequelId: number) {
        this._entity = entity;
        this._sequelId = sequelId;
        this._parallel = REData.sequels[this._sequelId].parallel;
    }

    entity(): REGame_Entity {
        return this._entity;
    }

    sequelId(): number {
        return this._sequelId;
    }

    data(): REData_Sequel {
        return REData.sequels[this._sequelId];
    }

    isParallel(): boolean {
        return this._parallel;
    }
}

/**
 * ある Entity に連続適用する Sequel のリスト。
 * 
 * 倍速移動などで、複数の Sequel が追加されることがある。
 */
export class RESequelClip {
    private _sequels: REGame_Sequel[];

    constructor(firstItem: REGame_Sequel) {
        this._sequels = [firstItem];
    }

    sequels(): readonly REGame_Sequel[] {
        return this._sequels;
    }

    entity(): REGame_Entity {
        return this._sequels[0].entity();
    }

    isParallel(): boolean {
        return this._sequels[0].isParallel();
    }

    add(sequel: REGame_Sequel) {
        this._sequels.push(sequel);
    }
}

/**
 * 並列実行の単位。同時実行できる RESequelClip はまとめてひとつの SequelRun に属する。
 */
export class RESequelRun {
    private _clips: RESequelClip[];

    constructor(firstItem: REGame_Sequel) {
        this._clips = [new RESequelClip(firstItem)];
    }

    clips(): readonly RESequelClip[] {
        return this._clips;
    }

    isParallel(): boolean {
        return this._clips[0].isParallel();
    }

    add(sequel: REGame_Sequel) {
        assert(sequel.isParallel() == this.isParallel());
        const index = this._clips.findIndex(x => x.entity() == sequel.entity());
        if (index < 0) {
            this._clips.push(new RESequelClip(sequel));
        }
        else {
            this._clips[index].add(sequel);
        }
    }
}

/**
 * 一連のコマンドチェーン内で発生した Sequel を、並列実行などを考慮して整理して保持する。
 * その後 Visual レイヤーに渡り、アニメーションが実行される。
 */
export class RESequelSet {
    private _runs: RESequelRun[];
    private _allParallel: boolean;
    private _isEmpty: boolean;

    constructor() {
        this._runs = [];
        this._allParallel = true;
        this._isEmpty = true;
    }

    runs(): readonly RESequelRun[] {
        return this._runs;
    }

    isAllParallel() : boolean {
        return this._allParallel;
    }

    isEmpty() : boolean {
        return this._isEmpty;
    }

    reset() {
        this._runs.splice(0);
        this._allParallel = true;
        this._isEmpty = true;
    }

    addSequel(sequel: REGame_Sequel) {
        let newRun = false;
        if (this._runs.length == 0) {
            // 初回
            newRun = true;
        }
        else if (!sequel.isParallel()) {
            // 並列実行しないものは新しい Run へ追加する
            newRun = true;
        }
        else {
            const lastRun = this._runs[this._runs.length - 1];
            if (!lastRun.isParallel()) {
                // 並列 Sequel を追加しようとしたが、追加済みの終端は非並列だった。
                // 新しい Run へ追加する。
                newRun = true;
            }
            else {
                // 並列 Sequel が連続
            }
        }

        if (newRun) {
            this._runs.push(new RESequelRun(sequel));
        }
        else {
            this._runs[this._runs.length - 1].add(sequel);
        }

        if (!sequel.isParallel()) {
            this._allParallel = false;
        }
        this._isEmpty = false;
    }
}


