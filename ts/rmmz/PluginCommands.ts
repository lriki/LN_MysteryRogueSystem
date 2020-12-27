import { REData } from "ts/data/REData";
import { REGame } from "ts/objects/REGame";
import { Scene_Warehouse } from "./Scene_Warehouse";

const pluginName: string = "LN_RoguelikeEngine";

PluginManager.registerCommand(pluginName, "RE.ShowChallengeResult", (args: any) => {
    REGame.challengeResultShowing = true;
    $gameMap._interpreter.setWaitMode("REResultWinodw");
});

PluginManager.registerCommand(pluginName, "RE.ShowWarehouse", (args: any) => {
    const actorId: number = args.actorId;
    if (!args.actorId || args.actorId < 0 || REData.actors.length <= actorId) {
        throw new Error("RE.ShowWarehouse - Invalid 'actorId'.");
    }
    


    console.log("RE.ShowWarehouse", args);

    
    //SceneManager.push(Scene_Warehouse);
});
