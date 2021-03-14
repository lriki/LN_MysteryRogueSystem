import { REGame } from "ts/objects/REGame";
import { LEntity } from "ts/objects/LEntity";
import { RESystem } from "./RESystem";

export class SMessageBuilder {
    static makeTargetName(/*subject: REGame_Entity, */target: LEntity): string {
        const watcher = REGame.camera.focusedEntity();// ?? subject;
        const name = target.queryProperty(RESystem.properties.name) as string;

        // TODO: player(watcher) が暗闇状態等の時は、ここで "なにものか" に名前を変えたりする

        return name;
    }
}
