import { ActionId, REData } from "ts/data/REData";

/*
[2020/12/6] アイテムに対する Action
----------

インベントリ内の、投げる、置く、食べる、説明など。
足元の、ひろう、など。

これらの Action は、実際の状態にかかわらず Action は実行できるかを示すもので、主に UI の表示に使う。
封印状態だから使えない、といった reject は、実際にコマンドを発行した後に行う (だいたいターンを消費する)

関係者は
1. アイテムの Entity
2. インベントリを持っている Entity
3. Actor の Entity

インベントリを持っている Entity は、Actor の他、壺なども該当する。
Actor が自分の持ち物を操作するときは 2 と 3 が同一となる。

1 2 は継承関係にあってもいいが、3とはその関係にない。
例えばアイテムは基本として「投げる」ができるが、2 が壺(アイテムを取り出せない)だった場合、「投げる」はできない。
アイテムは1つのインベントリにしか入ることはできないので、アイテムEntityに対して Action を問い合わせた時に、
親インベントリからも問い合わせを同時に行ってしまう、というのもあり。
NOTE: 「土」は「説明」、しかない。保存の壺に入れられたときも、取り出すことはできない

一方 3 は、例えば Player は必ずしも自分のインベントリ内のアイテムを投げるものではない点に注意。
代表的なのだと、足元にある保存の壺の中のアイテムを投げるようなケース。


*/

export type ActionCommandHandler = (actionId: ActionId) => void;


export interface ActionCommand
{
    actionId: ActionId;
    handler: ActionCommandHandler;
}

/**
 * [足元]
 */
export class VActionCommandWindow extends Window_Command {

    _actions: ActionCommand[] = [];

    constructor(rect: Rectangle) {
        super(rect);
        this.openness = 0;

        // Window_Command を利用する場合、コマンドリストは makeCommandList() で生成するべき。
        // しかしこのメソッドはベースのコンストラクタからも呼ばれるため、先に this._actions を初期化することができない。
        // そのためここで設定後、refresh() することでコマンドリストを再構築している。
        //this._actions = actions;
        this.refresh();
    }

    /*
    setActionList(actions: ActionId[]): void {
        this._actions = actions;
        this.refresh();
    }
    */

    clear(): void {
        this._actions = [];
        this.refresh();
    }

    setActionList2(actions: ActionCommand[]): void {
        this._actions = actions;
        this.refresh();
    }

    addActionCommand(action: ActionId, handler: ActionCommandHandler): void {
        this.setHandler(`action:${action}`, () => handler(action));
        this.refresh();
    }
    
    makeCommandList(): void {
        if (this._actions) {
            this._actions.forEach((x, i) => {
                this.addCommand(REData.actions[x.actionId].displayName, `action:${x.actionId}`, true, undefined);
                this.setHandler(`action:${x.actionId}`, () => {
                    x.handler(x.actionId);
                });
            });
        }
        this.addCommand(TextManager.command(22), "cancel", true, undefined);
    }
    
    processOk(): void {
        super.processOk();
    }
}

