import { DClassId } from "./DClass";

type DActorId = number;

/**
 * Actor はゲームシナリオ全体を通して存在する一意の登場人物を表すデータ構造。
 * 
 * ツクールの Actor とほぼ同義で、そこからインポートして使う。
 * ただし、必ずしも味方であるとは限らない。
 */
export interface RE_Data_Actor
{
    /** ID (0 is Invalid). */
    id: DActorId;

    /** Name. */
    name: string;

    /** 初期配置フロア */
    //initialFloorId: number;
    
    /** 初期配置 X */
    initialX: number;
    
    /** 初期配置 Y */
    initialY: number;

    classId: DClassId;
    
    initialLevel: number;

    traits: IDataTrait[];
}

export const DActor_Default: RE_Data_Actor = {
    id: 0,
    name: "null",
    //initialFloorId: 0,
    initialX: 0,
    initialY: 0,
    classId: 0,
    initialLevel: 0,
    traits: [],
}
