
export interface TaklingCommand {
    label: string;
    displayName: string;
}

export class Game_MRInterpreterContext {
    public talkingCommands: TaklingCommand[] = [];


    // public static call(rmmzEvent: Game_Event, labelName: string) {
    //     const labelCommand = rmmzEvent.list().find(cmd => cmd.code == 118 && cmd.parameters[0] == labelName);
    // }

}
