import { assert, tr2 } from "../Common";
import { LEntity } from "../objects/LEntity";
import { LObject } from "../objects/LObject";
import { REGame } from "../objects/REGame";
import { SFormulaOperand } from "../system/SFormulaOperand";

export class UProperty {

    public static setValue(key: string, path: string, value: any): any {
        const propPath = new UPropertyPath(path);
        const entity = REGame.world.getFirstEntityByKey(key);
        
        // if (propPath.componentType == UComponentType.Behavior) {
        //     assert(propPath.behaviorName);
        //     assert(propPath.propertyName);
        //     let behavior;
        //     for (const b of entity.basicBehaviors()) {
        //         if (b.constructor.name.toLowerCase().includes(propPath.behaviorName)) {
        //             behavior = b;
        //         }
        //     }
        //     if (behavior) {
        //         (behavior as any)[propPath.propertyName] = value;
        //     }
        // }
        // else {
        //     throw new Error("Not implemented.");
        // }
    }

    public static getValue(key: string, path: string): any {
        const entity = REGame.world.getFirstEntityByKey(key);
        throw this.getValueFromEntity(entity, path);
    }

    public static getValueFromEntity(entity: LEntity, path: string): any {
        const propPath = new UPropertyPath(path);
        const obj = this.getObject(entity, propPath);

        if (!propPath.propertyName) {
            return (obj !== undefined) ? 1 : 0;
        }

        if (obj) {
            if (propPath.behaviorName) {
                const behavior = entity.findEntityBehaviorByName(propPath.behaviorName);
                if (!behavior) new Error(`Behavior not found. ${path}`);
                let value: any = undefined;
                eval(`value = behavior.${propPath.propertyName}`);
                return value;
            }
            else if (propPath.propertyName) {
                let value: any = undefined;
                eval(`value = obj.${propPath.propertyName}`);
                return value;
            }
        }
        else {
            throw new Error(`Invalid property path. ${path}`);
        }
    }

    private static getObject(entity: LEntity, path: UPropertyPath): any | undefined {
        if (path.componentType == UComponentType.Entity) {
            return entity;
        }
        else if (path.componentType == UComponentType.Param) {
            const op = new SFormulaOperand();
            op.wrap(entity);
            return op;
        }
        else if (path.componentType == UComponentType.State) {
            return entity.states().find(x => x.stateData().key == path.element);
        }
        // else if (path.componentType == UComponentType.Behavior) {
        //     let behavior;
        //     for (const b of entity.basicBehaviors()) {
        //         if (b.constructor.name.toLowerCase().includes(path.behaviorName)) {
        //             behavior = b;
        //         }
        //     }
        //     return behavior;
        // }
        else {
            throw new Error("Not implemented.");
        }
    }
}

export enum UComponentType {
    Entity,
    Param,
    //Behavior,
    State,
    Ability,
}

/**
 * 
 * 書式:
 * ```
 * [componentType:][componentName.]propertyName
 * ```
 * 
 * 将来的に、だが、例えば State の持続時間を指定したいときは、
 * - "State[睡眠]:turns", 20
 * State の持っている behabior のプロパティを指定したいときは、
 * - "State(睡眠):generic.xxxx", 20
 */
export class UPropertyPath {
    public componentType: UComponentType;
    public element: string | undefined;
    public behaviorName: string | undefined;
    public propertyName: string | undefined;

    public constructor(path: string) {
        const tokens1 = path.split(":");
        let after;
        let componentType = undefined;
        if (tokens1.length == 1) {
            after = tokens1[0];
        }
        else {
            after = tokens1[1];
        }

        if (tokens1.length >= 2 || tokens1[0].includes("[")) {
            // Parse type and element
            const regex = /([a-z]+)(\[.+\])*/gi;
            const result = regex.exec(tokens1[0]);
            assert(result);
            const type = result[1];
            componentType = this.parseComponentType(type);
            const element = result[2];
            if (element) {
                this.element = element.substring(1, element.length - 1);
            }
            if (tokens1.length == 1) {
                after = "";
            }
        }

        if (after.length == 0) {
            if (componentType === undefined) {
                componentType = UComponentType.Param;   // デフォルトは Param とする。これがもっともよく使う
            }
        }
        else {
            // [componentType:] の後ろの部分を . で split
            const tokens2 = after.split(".");
            if (tokens2.length >= 2) {
                this.behaviorName = tokens2[0];
                this.propertyName = tokens2.slice(1).join(".");
                if (componentType === undefined) {
                    componentType = UComponentType.Entity;
                }
            }
            else {
                this.propertyName = tokens2.join(".");
                if (componentType === undefined) {
                    componentType = UComponentType.Param;   // デフォルトは Param とする。これがもっともよく使う
                }
            }
        }

        this.componentType = componentType;
    }

    private parseComponentType(type: string): UComponentType {
        switch (type.toLocaleLowerCase()) {
            case "entity":
                return UComponentType.Entity;
            case "param":
                return UComponentType.Param;
            // case "behavior":
            //     return UComponentType.Behavior;
            case "state":
                return UComponentType.State;
            case "ability":
                return UComponentType.Ability;
            default:
                throw new Error(tr2("プロパティパスのコンポーネント種類が不正です。(%1)").format(type));
        }
    }
}
