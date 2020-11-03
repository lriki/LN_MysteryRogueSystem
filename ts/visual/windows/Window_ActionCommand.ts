import { ActionId, REData } from "ts/data/REData";

/**
 * [足元]
 */
export class Window_ActionCommand extends Window_Command {

    _actions: ActionId[];

    constructor(rect: Rectangle, actions: ActionId[]) {
        super(rect);

        // Window_Command を利用する場合、コマンドリストは makeCommandList() で生成するべき。
        // しかしこのメソッドはベースのコンストラクタからも呼ばれるため、先に this._actions を初期化することができない。
        // そのためここで設定後、refresh() することでコマンドリストを再構築している。
        this._actions = actions;
        this.refresh();
    };
    
    makeCommandList(): void {
        if (this._actions) {
            this._actions.forEach((x, i) => {
                this.addCommand(REData.actions[x].displayName, `index:${i}`, true, undefined);
            });
            this.addCommand(TextManager.command(22), "cancel", true, undefined);
        }
    };
    
    processOk(): void {
        console.log("processOk");
        super.processOk();
    };
}

