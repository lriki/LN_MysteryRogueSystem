import { REData, REData_Sequel } from "./REData";
import { REGame_Entity } from "./REGame_Entity";

/**
 * Sequel
 * 
 * 
 */
export class REGame_Sequel {
    private _entity: REGame_Entity;
    private _sequelId: number;
    private _parallel: boolean;

    constructor(entity: REGame_Entity, sequelId: number) {
        this._entity = entity;
        this._sequelId = sequelId;
        this._parallel = false;
    }

    entity(): REGame_Entity {
        return this._entity;
    }

    data(): REData_Sequel {
        return REData.sequels[this._sequelId];
    }

    isParallel(): boolean {
        return this._parallel;
    }
}

/**
 * 並列実行の単位。同時実行できる Sequel はまとめてひとつの SequelRun に属する。
 */
export type RESequelRun = REGame_Sequel[];

/**
 * 一連のコマンドチェーン内で発生した Sequel を、並列実行などを考慮して整理して保持する。
 * その後 Visual レイヤーに渡り、アニメーションが実行される。
 */
export class RESequelSet {
    private _runs: RESequelRun[];

    constructor() {
        this._runs = [];
    }

    reset() {
        this._runs.splice(0);
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
            const lastSequel = lastRun[lastRun.length - 1];
            if (!lastSequel.isParallel()) {
                // 並列 Sequel を追加しようとしたが、追加済みの終端は非並列だった。
                // 新しい Run へ追加する。
                newRun = true;
            }
            else {
                // 並列 Sequel が連続
            }
        }

        if (newRun) {
            this._runs.push([sequel]);
        }
        else {
            this._runs[this._runs.length - 1].push(sequel);
        }
    }
}


