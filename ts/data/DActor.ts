import { DClassId } from "./DClass";

type DActorId = number;

/**
 * Actor はゲームシナリオ全体を通して存在する一意の登場人物を表すデータ構造。
 * 
 * ツクールの Actor とほぼ同義で、そこからインポートして使う。
 * ただし、必ずしも味方であるとは限らない。
 */
export class RE_Data_Actor {
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


    actionCommands: DActorId[];

    constructor(id: DActorId) {
        this.id = id;
        this.name = "null";
        this.initialX = 0;
        this.initialY = 0;
        this.classId = 0;
        this.initialLevel = 0;
        this.traits = [];
        this.actionCommands = [];
    }

    public setup(rmmzActor: IDataActor) {
        this.classId = rmmzActor.classId;
        this.initialLevel = rmmzActor.initialLevel;
        this.traits = rmmzActor.traits;
    }
}
