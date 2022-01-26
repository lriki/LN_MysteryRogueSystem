import { tr2 } from "../Common";
import { REGame } from "../objects/REGame";

export class UProperty {

    public static setValue(key: string, path: string, value: any): any {
        const propPath = new UPropertyPath(path);
        const entity = REGame.world.getFirstEntityByKey(key);
        
        if (propPath.componentType == UComponentType.Behavior) {
            let behavior;
            for (const b of entity.basicBehaviors()) {
                if (b.constructor.name.toLowerCase().includes(propPath.componentName)) {
                    behavior = b;
                }
            }
            if (behavior) {
                (behavior as any)[propPath.propertyName] = value;
            }
        }
        else {
            throw new Error("Not implemented.");
        }
    }

    public static getValue(key: string, path: string, value: any): any {
        throw new Error("Not implemented.");
    }
}

enum UComponentType {
    Behavior,
    State,
    Ability,
}

/**
 * 
 * 書式:
 * ```
 * [componentType:]componentName.propertyName[.index]
 * ```
 * 
 * 将来的に、だが、例えば State の持続時間を指定したいときは、
 * - ("State:turns", 20)
 * State の持っている behabior のプロパティを指定したいときは、
 * - ("State:generic.xxxx", 20)
 */
class UPropertyPath {
    public componentType: UComponentType;
    public componentName: string;
    public propertyName: string;
    public index: number;

    public constructor(path: string) {
        const tokens1 = path.split(":");
        let after;
        if (tokens1.length == 1) {
            this.componentType = UComponentType.Behavior;
            after = tokens1[0];
        }
        else {
            this.componentType = this.parseComponentType(tokens1[0]);
            after = tokens1[1];
        }

        const tokens2 = after.split(".");
        this.componentName = tokens2[0];
        this.propertyName = tokens2[1].toLowerCase();
        if (tokens2.length >= 3) {
            this.index = Number(tokens2[2]);
        }
        else {
            this.index = 0;
        }
    }

    private parseComponentType(type: string): UComponentType {
        if (type == "behavior") {
            return UComponentType.Behavior;
        }
        else if (type == "state") {
            return UComponentType.State;
        }
        else if (type == "ability") {
            return UComponentType.Ability;
        }
        else {
            throw new Error(tr2("プロパティパスのコンポーネント種類が不正です。(%1)").format(type));
        }
    }
}
