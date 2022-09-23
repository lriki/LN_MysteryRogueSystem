import { DActorId } from "./DCommon";

/**
 * Actor はゲームシナリオ全体を通して存在する一意の登場人物を表すデータ構造。
 * 
 * ツクールの Actor とほぼ同義で、そこからインポートして使う。
 * ただし、必ずしも味方であるとは限らない。
 */
export class DActor {
    /** ID (0 is Invalid). */
    id: DActorId;


    rmmzActorId: number;

    /** 初期配置フロア */
    //initialFloorId: number;
    
    /** 初期配置 X */
    initialX: number;
    
    /** 初期配置 Y */
    initialY: number;
    
    initialLevel: number;

    maxLevel: number;



    actionCommands: DActorId[];

    constructor(id: DActorId) {
        this.id = id;
        this.rmmzActorId = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.maxLevel = 0;
        this.initialLevel = 0;
        this.actionCommands = [];
    }

    public setup(data: IDataActor) {
        this.rmmzActorId = data.id;
        this.initialLevel = data.initialLevel;
        this.maxLevel = data.maxLevel;
    }
}
