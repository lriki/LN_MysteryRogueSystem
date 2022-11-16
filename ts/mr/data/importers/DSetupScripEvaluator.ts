import { db, DSetupScriptDatabase, setDB } from "./DSetupScript";
import { DParameter, IParameterFlavorEffect } from "../DParameter";
import { IEffectProps, IParameterBuffEffectProps, IParameterValueEffectProps } from "../DEffect";
import { IFlavorEffectProps } from "../DFlavorEffect";
import * as index from "../index";
import { tr2 } from "ts/mr/Common";
import { IEmittorProps } from "../DEmittor";
import { IEntityProps, IReactionProps } from "../DEntity";
import { IEntityTemplateProps } from "../DEntityTemplate";
import { IEntityCategoryProps } from "../DEntityCategory";
import { ISpecialEffectProps } from "../DSpecialEffect";
import { ITraitProps } from "../DTrait";
import { IEffectRef } from "../DEffectSuite";

declare global {
    function EntityCategory(props: IEntityCategoryProps): IEntityCategoryProps;
    function Effect(props: IEffectProps): IEffectProps;
    function ParameterValue(props: IParameterValueEffectProps): IParameterValueEffectProps;
    function ParameterBuff(props: IParameterBuffEffectProps): IParameterBuffEffectProps;
    function SpecialEffect(props: ISpecialEffectProps): ISpecialEffectProps;
    function Trait(props: ITraitProps): ITraitProps;
    function FlavorEffect(props: IFlavorEffectProps): IFlavorEffectProps;
    function Emittor(props: IEmittorProps): IEmittorProps;
    function EffectRef(props: IEffectRef): IEffectRef;
    function Entity(props: IEntityProps): IEntityProps;
    function Reaction(props: IReactionProps): IReactionProps;
    function EntityTemplate(props: IEntityTemplateProps): IEntityTemplateProps;
}



// function Parameter(props: IParameterProps): IParameterProps {
//     return props;
// }

function EntityCategory(props: IEntityCategoryProps): IEntityCategoryProps {
    return props;
}

function Effect(props: IEffectProps): IEffectProps {
    return props;
}

function ParameterFlavorEffect(props: IParameterFlavorEffect): IParameterFlavorEffect {
    return props;
}

function ParameterValue(props: IParameterValueEffectProps): IParameterValueEffectProps {
    return props;
}

function ParameterBuff(props: IParameterBuffEffectProps): IParameterBuffEffectProps {
    return props;
}

function SpecialEffect(props: ISpecialEffectProps): ISpecialEffectProps {
    return props;
}

function Trait(props: ITraitProps): ITraitProps {
    return props;
}

function FlavorEffect(props: IFlavorEffectProps): IFlavorEffectProps {
    return props;
}

function Emittor(props: IEmittorProps): IEmittorProps {
    return props;
}

function EffectRef(props: IEffectRef): IEffectRef {
    return props;
}

function Entity(props: IEntityProps): IEntityProps {
    return props;
}

function Reaction(props: IReactionProps): IReactionProps {
    return props;
}

function EntityTemplate(props: IEntityTemplateProps): IEntityTemplateProps {
    return props;
}

export function evalScript(obj: DSetupScriptDatabase, script: string): void {
    const require = function(f: string): any {
        return index;
    };
    const tr = tr2;
    setDB(obj);
    eval(script);
    setDB(undefined);
}

