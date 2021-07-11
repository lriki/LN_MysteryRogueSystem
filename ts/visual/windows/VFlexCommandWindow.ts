import { DActionId } from "ts/data/DAction";
import { REData } from "ts/data/REData";

export type ActionCommandHandler = (actionId: DActionId) => void;

export type SystemCommandHandler = (commandId: string) => void;

export interface CommandInfo
{
    actionId: DActionId;     // 0 の場合はシステムコマンド
    displayText: string;
    commandId: string;
    actionHandler: ActionCommandHandler | undefined;
    systemHandler: SystemCommandHandler | undefined;
}

/**
 * - [説明] など、Sub Dialog を開く Command
 * - [投げる] [置く] など、特定の Entity に対する Action の Command
 * - [あずける] など、システム的な Command
 * 
 * add**() で追加し終わったら refresh() すること。
 */
export class VFlexCommandWindow extends Window_Command {

    private _commands: CommandInfo[] = [];

    public constructor(rect: Rectangle) {
        super(rect);
        this.openness = 0;

        // Window_Command を利用する場合、コマンドリストは makeCommandList() で生成するべき。
        // しかしこのメソッドはベースのコンストラクタからも呼ばれるため、先に this._actions を初期化することができない。
        // そのためここで設定後、refresh() することでコマンドリストを再構築している。
        //this._actions = actions;
        this.refresh();
    }

    public addActionCommand(actionId: DActionId, commandId: string, handler: ActionCommandHandler): void {
        this._commands.push({
            actionId: actionId,
            displayText: REData.actions[actionId].displayName,
            commandId: commandId,
            actionHandler: handler,
            systemHandler: undefined,
        });
    }

    public addSystemCommand(text: string, commandId: string, systemHandler: SystemCommandHandler): void {
        this._commands.push({
            actionId: 0,
            displayText: text,
            commandId: commandId,
            actionHandler: undefined,
            systemHandler: systemHandler,
        });
    }

    public clear(): void {
        this._commands = [];
        this.refresh();
    }
    
    makeCommandList(): void {
        if (this._commands) {
            this._commands.forEach((x, i) => {
                if (x.actionId == 0) {
                    this.addCommand(x.displayText, x.commandId, true, undefined);
                    this.setHandler(x.commandId, () => {
                        if (x.systemHandler) {
                            x.systemHandler(x.commandId);
                        }
                    });
                }
                else {
                    console.log("x.displayText", x.displayText);
                    this.addCommand(x.displayText, x.commandId, true, undefined);
                    this.setHandler(x.commandId, () => {
                        if (x.actionHandler) {
                            x.actionHandler(x.actionId);
                        }
                    });
                }
    
            });
            
            this.refresh();
        }
    }
    
    processOk(): void {
        super.processOk();
    }
}

