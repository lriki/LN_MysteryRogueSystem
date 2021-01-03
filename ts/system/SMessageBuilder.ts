import { REGame } from "ts/objects/REGame";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { RESystem } from "./RESystem";

export class SMessageBuilder {
    static makeTargetName(/*subject: REGame_Entity, */target: REGame_Entity): string {
        const watcher = REGame.camera.focusedEntity();// ?? subject;
        const name = target.queryProperty(RESystem.properties.name) as string;

        // TODO: player(watcher) が暗闇状態等の時は、ここで "なにものか" に名前を変えたりする

        return name;
    }
}
