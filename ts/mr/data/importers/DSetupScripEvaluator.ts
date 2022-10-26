import { db } from "./DSetupScript";
import { DParameter } from "../DParameter";
import { IEffectProps, IParameterBuffEffectProps } from "../DEffect";
import { IFlavorEffectProps } from "../DFlavorEffect";
import * as index from "../index";
import { tr2 } from "ts/mr/Common";

declare global {
    function Effect(props: IEffectProps): IEffectProps;
    function ParameterBuffEffect(props: IParameterBuffEffectProps): IParameterBuffEffectProps;
    function FlavorEffect(props: IFlavorEffectProps): IFlavorEffectProps;
}



// function Parameter(props: IParameterProps): IParameterProps {
//     return props;
// }



function Effect(props: IEffectProps): IEffectProps {
    return props;
}

function ParameterBuffEffect(props: IParameterBuffEffectProps): IParameterBuffEffectProps {
    return props;
}

function FlavorEffect(props: IFlavorEffectProps): IFlavorEffectProps {
    return props;
}





export function evalScript(obj: db, script: string): void {
    const require = function(f: string): any {
        return index;
    };
    const tr = tr2;
    eval(script);
}

