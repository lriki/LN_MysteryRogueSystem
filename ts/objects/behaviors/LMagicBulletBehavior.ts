import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { Helpers } from "ts/system/Helpers";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { RESystem } from "ts/system/RESystem";
import { REGame } from "../REGame";
import { BlockLayerKind } from "../REGame_Block";
import { REGame_Entity } from "../REGame_Entity";
import { CommandArgs, LBehavior, onMoveAsMagicBullet } from "./LBehavior";


/**
 */
export class LMagicBulletBehavior extends LBehavior {

    public constructor() {
        super();
    }

    onQueryProperty(propertyId: number): any {
        if (propertyId == RESystem.properties.homeLayer)
            return BlockLayerKind.Projectile;
        else
            super.onQueryProperty(propertyId);
    }
    
    [onMoveAsMagicBullet](args: CommandArgs, context: RECommandContext): REResponse {
        const self = args.self;
        const offset = Helpers.dirToTileOffset(self.dir);
        if (REGame.map.moveEntity(self, self.x + offset.x, self.y + offset.y, BlockLayerKind.Projectile)) {
            context.postSequel(self, RESystem.sequels.blowMoveSequel);
            
            // recall
            context.post(self, self, undefined, onMoveAsMagicBullet);

            console.log("onMoveAsMagicBullet");
                
            return REResponse.Succeeded;
        }
        else {
            console.log("onMoveAsMagicBullet destroy");
            self.destroy();
        }

        return REResponse.Pass;
    }
}

