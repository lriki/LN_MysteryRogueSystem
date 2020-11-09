import { DStateId } from "ts/data/DState";
import { ActionId } from "ts/data/REData";
import { DecisionPhase, REGame_Behavior } from "ts/RE/REGame_Behavior";
import { REGame_Entity } from "ts/RE/REGame_Entity";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";

/**
 * State
 * 
 * 各メソッドは Behavior と同一
 */
export class LState extends REGame_Behavior {
    _dataId: DStateId = 0;
    
    
    onQueryProperty(propertyId: number): any { return undefined; }

    onQueryActions(): ActionId[] { return []; }

    onDecisionPhase(entity: REGame_Entity, context: RECommandContext, phase: DecisionPhase): REResponse { return REResponse.Pass; }

    onPreAction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
    onPreReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
    onAction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
    onReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse { return REResponse.Pass; }
    
}

/*
[2020/11/8] Note: State は Attribute+Behavior 相当の実装だけど、これらを一緒にする？
----------

### 一緒にする場合
メソッドなどが勝手にシリアライズされないように、必要なフィールドのシリアライズを自分で実装する必要がある。
→ 不要。見分けてくれる。

### 分ける場合
関係するデータと処理が別々のところにできることになるので、やや複雑になる。
Attrbute を interface にしたいところだが、型情報がないと find できず使いづらい。



*/

