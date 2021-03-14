import { assert } from "ts/Common";
import { DSequel, DSequelId } from "ts/data/DSequel";
import { REData } from "../data/REData";
import { LEntity } from "./LEntity";

/**
 * Sequel
 * 
 * Sequel 個別にデータを持たせたいときに利用予定 (継承よりはフィールドに持たせた方がいいかも)
 */
export class SSequelUnit {
    private _entity: LEntity;
    private _parallel: boolean;

    constructor(entity: LEntity, parallel: boolean) {
        this._entity = entity;
        this._parallel = parallel;
    }

    entity(): LEntity {
        return this._entity;
    }

    isParallel(): boolean {
        return this._parallel;
    }
}

export class SMotionSequel extends SSequelUnit {
    private _sequelId: DSequelId;

    constructor(entity: LEntity, sequelId: DSequelId) {
        super(entity, REData.sequels[sequelId].parallel);
        this._sequelId = sequelId;
    }

    sequelId(): DSequelId {
        return this._sequelId;
    }

    data(): DSequel {
        return REData.sequels[this._sequelId];
    }
}

export class SAnumationSequel extends SSequelUnit {
    private _anumationlId: number;
    private _isWait: boolean;

    public constructor(entity: LEntity, anumationlId: number, wait: boolean) {
        super(entity, !wait);   // wait するときは parallel にしない。してしまうと、直後に post したメッセージなどが先に進んでしまう。
        this._anumationlId = anumationlId;
        this._isWait = wait;
    }

    public anumationlId(): DSequelId {
        return this._anumationlId;
    }

    public isWait(): boolean {
        return this._isWait;
    }
}

/**
 * ある Entity に連続適用する Sequel のリスト。
 * 
 * 倍速移動などで、複数の Sequel が追加されることがある。
 */
export class RESequelClip {
    private _sequels: SSequelUnit[];

    constructor(firstItem: SSequelUnit) {
        this._sequels = [firstItem];
    }

    sequels(): readonly SSequelUnit[] {
        return this._sequels;
    }

    entity(): LEntity {
        return this._sequels[0].entity();
    }

    isParallel(): boolean {
        return this._sequels[0].isParallel();
    }

    public hasMotionSeque(): boolean {
        return this._sequels.findIndex(s => (s instanceof SMotionSequel)) >= 0;
    }

    add(sequel: SSequelUnit) {
        this._sequels.push(sequel);
    }
}

/**
 * 並列実行の単位。同時実行できる RESequelClip はまとめてひとつの SequelRun に属する。
 */
export class RESequelRun {
    private _clips: RESequelClip[];

    constructor(firstItem: SSequelUnit) {
        this._clips = [new RESequelClip(firstItem)];
    }

    clips(): readonly RESequelClip[] {
        return this._clips;
    }

    isParallel(): boolean {
        return this._clips[0].isParallel();
    }

    public hasMotionSeque(): boolean {
        return this._clips.findIndex(clip => clip.hasMotionSeque()) >= 0;
    }

    add(sequel: SSequelUnit) {
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

    addSequel(sequel: SSequelUnit) {
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


