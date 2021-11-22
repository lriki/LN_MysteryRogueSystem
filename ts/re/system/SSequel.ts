import { assert } from "ts/re/Common";
import { DSequel, DSequelId } from "ts/re/data/DSequel";
import { REData } from "../data/REData";
import { LEntity } from "../objects/LEntity";

/**
 * Sequel
 * 
 * Sequel 個別にデータを持たせたいときに利用予定 (継承よりはフィールドに持たせた方がいいかも)
 */
export class SSequelUnit {
    private _entity: LEntity;
    private _parallel: boolean;
    private _args: any | undefined;

    constructor(entity: LEntity, parallel: boolean, args: any | undefined) {
        this._entity = entity;
        this._parallel = parallel;
        this._args = args;
    }

    entity(): LEntity {
        return this._entity;
    }

    isParallel(): boolean {
        return this._parallel;
    }

    args(): any | undefined {
        return this._args;
    }
}

export class SMotionSequel extends SSequelUnit {

    /*
    [2021/11/18]
    ----------
    移動→ワープの罠にかかったとき、ワープ後の座標へ歩行移動してから、その場でワープモーションを取る問題がある。
    原因は、entity の座標が変わった後に 移動とワープSequel が同時に Flush されるため。
    最初の移動Sequel時点ではすでに移動目標がワープ先になっている。

    これを解決するには…
    A. 移動Sequel自体に、移動先座標を渡す。(entityの座標を直接参照しない)
    B. ワナ発動前に強制 Flush する。

    B の場合、AIMinor End のタイミングで強制 flush してしまうと、倍速 Entity の動きが1マスごとに Flush されてしまう。
    v0.3.0 では B のようにしていたが、そんな理由のため修正することになった。

    ということで A でやるしかない。
    */
    private _sequelId: DSequelId;
    private _startX: number | undefined;
    private _startY: number | undefined;
    private _targetX: number;
    private _targetY: number;

    constructor(entity: LEntity, sequelId: DSequelId, targetX: number, targetY: number, args: any | undefined) {
        super(entity, REData.sequels[sequelId].parallel, args);
        this._sequelId = sequelId;
        this._targetX = targetX;
        this._targetY = targetY;
    }

    sequelId(): DSequelId {
        return this._sequelId;
    }

    data(): DSequel {
        return REData.sequels[this._sequelId];
    }

    public setStartPosition(x: number, y: number): void {
        this._startX = x;
        this._startY = y;
    }

    public hasStartPosition(): boolean {
        return !!this._startX && !!this._startY;
    }

    public startX(): number {
        assert(this._startX !== undefined);
        return this._startX;
    }

    public startY(): number {
        assert(this._startY !== undefined);
        return this._startY;
    }
    
    public targetX(): number {
        return this._targetX;
    }

    public targetY(): number {
        return this._targetY;
    }
}

export class SAnumationSequel extends SSequelUnit {
    private _anumationlId: number;
    private _isWait: boolean;

    public constructor(entity: LEntity, anumationlId: number, wait: boolean) {
        super(entity, !wait, undefined);   // wait するときは parallel にしない。してしまうと、直後に post したメッセージなどが先に進んでしまう。
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

export class SBalloonSequel extends SSequelUnit {
    private _balloonId: number;
    private _isWait: boolean;

    public constructor(entity: LEntity, balloonId: number, wait: boolean) {
        super(entity, !wait, undefined);   // wait するときは parallel にしない。してしまうと、直後に post したメッセージなどが先に進んでしまう。
        this._balloonId = balloonId;
        this._isWait = wait;
    }

    public balloonId(): DSequelId {
        return this._balloonId;
    }

    public isWait(): boolean {
        return this._isWait;
    }
}

export class SWaitSequel extends SSequelUnit {
    private _waitCount: number;
    public constructor(entity: LEntity, waitCount: number) {
        super(entity, true, undefined);
        this._waitCount = waitCount;
    }

    public waitCount(): number {
        return this._waitCount;
    }
}

/**
 * ある Entity に連続適用する Sequel のリスト。
 * 
 * 倍速移動などで、複数の Sequel が追加されることがある。
 */
export class SSequelClip {
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
export class SSequelRun {
    private _clips: SSequelClip[];

    constructor(firstItem: SSequelUnit) {
        this._clips = [new SSequelClip(firstItem)];
    }

    clips(): readonly SSequelClip[] {
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
            this._clips.push(new SSequelClip(sequel));
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
export class SSequelSet {
    private _runs: SSequelRun[];
    private _allParallel: boolean;
    private _isEmpty: boolean;

    constructor() {
        this._runs = [];
        this._allParallel = true;
        this._isEmpty = true;
    }

    runs(): readonly SSequelRun[] {
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
            this._runs.push(new SSequelRun(sequel));
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


