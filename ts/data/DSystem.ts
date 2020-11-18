

export enum ParameterEffectType {
    Damage,
    Recover,
    Drain,
}


export interface DSystem
{
    elements: string[];    // IDataSystem.elements (0 is Invalid)
    equipTypes: string[];  // IDataSystem.equipTypes (0 is Invalid)
}