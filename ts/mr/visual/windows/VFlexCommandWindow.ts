import { DActionId } from "ts/mr/data/DCommon";
import { MRData } from "ts/mr/data/MRData";
import { SDialogCommand } from "ts/mr/system/dialogs/SDialogCommand";

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

    public setupFromCommandList(commands: SDialogCommand[]): void {
        this.clear();
        for (const command of commands) {
            if (command.isActivityCommand) {
                this.addActionCommand(command.actionId, command.displayName, `act#${command.actionId}`, command.activityCommandHandler);
            }
            else if (command.isSystemCommand) {
                this.addSystemCommand(command.displayName, command.systemCommandId, command.systemCommandIdHandler);
            }
            else {
                throw new Error("Unreachable.");
            }
        }
    }

    public addActionCommand(actionId: DActionId, displayName: string | undefined, commandId: string, handler: ActionCommandHandler): void {
        this._commands.push({
            actionId: actionId,
            displayText: displayName ?? MRData.actions[actionId].displayName,
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

    public fitHeight(): void {
        this.height = this.fittingHeight(this._commands.length);
    }
    
    // override. 外部から再構築したいときは refresh を呼ぶこと。
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
                    this.addCommand(x.displayText, x.commandId, true, undefined);
                    this.setHandler(x.commandId, () => {
                        if (x.actionHandler) {
                            x.actionHandler(x.actionId);
                        }
                    });
                }
            });
        }

        //this.addCommand(TextManager.cancel, "cancel", true, undefined);
    }
    
    processOk(): void {
        super.processOk();
    }
}

