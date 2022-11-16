import { MRSerializable } from "../Common";
import { MRData } from "../data";
import { DChronusTimeFrame } from "../data/DChronus";

@MRSerializable
export class LChronus {
    private _totalSeconds: number;
    private _totalDays: number;

    private _currentTimeFrameIndex: number;
    private _revisionNumber: number;
    private _needsLivingTimeFrameRefresh: boolean;

    public constructor() {
        this._totalSeconds = 0;
        this._totalDays = 0;
        this._currentTimeFrameIndex = 0;
        this._revisionNumber = 0;
        this._needsLivingTimeFrameRefresh = false;
    }

    /** 日中の秒数。(0 ~ MRData.chronus.secondsInDay-1) */
    public get totalSeconds(): number {
        return this._totalSeconds;
    }

    /** 経過日数 */
    public get totalDays(): number {
        return this._totalDays;
    }

    public get currentTimeFrameIndex(): number {
        return this._currentTimeFrameIndex;
    }

    public get currentTimeFrame(): DChronusTimeFrame {
        return MRData.chronus.timeFrames[this._currentTimeFrameIndex];
    }

    public get currentTimeFrameId(): number {
        return this.currentTimeFrame.timeFrameId;
    }

    private getTimeFrameIndex(): number {
        let index = 0;
        const frames = MRData.chronus.timeFrames;
        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            if (this.isHourInRange(frame.startHour, frame.lastHouer)) {
                index = i;
            }
        }
        return index;
    };

    private isHourInRange(start: number, last: number) {
        var hour = this.hour;
        return hour >= start && hour <= last;
    };

    public advanceRound(): void {
        this.advanceSeconds(MRData.chronus.secondsInRound);
    }
    
    private advanceSeconds(secs: number): void {
        if (!MRData.chronus.enabled) return;
        const secondsInDay = MRData.chronus.secondsInDay;
        this._totalSeconds += secs;
        while (this._totalSeconds >= secondsInDay) {
            this.advanceDay(1);
            this._totalSeconds -= secondsInDay;
        }
        this.requireRefresh();
    }

    private advanceDay(days: number): void {
        this._totalDays += days;
        this.requireRefresh();
    }

    private requireRefresh(): void {
        this._revisionNumber++;
        const oldTimeFrameKind = this.currentTimeFrame.kind;
        this._currentTimeFrameIndex = this.getTimeFrameIndex();
        console.log("this.currentTimeFrame", this.currentTimeFrame);
        if (oldTimeFrameKind !== this.currentTimeFrame.kind) {
            console.log("reserveLivingTimeFrameRefresh");
            this.reserveLivingTimeFrameRefresh();
        }
    }

    private reserveLivingTimeFrameRefresh(): void {
        this._needsLivingTimeFrameRefresh = true;
    }

    public clearLivingTimeFrameRefresh(): void {
        this._needsLivingTimeFrameRefresh = false;
    }

    public get needsLivingTimeFrameRefresh(): boolean { 
        return this._needsLivingTimeFrameRefresh;
    }

    public get weekIndex(): number {
        return this._totalDays % MRData.chronus.getDaysOfWeek();
    }

    public get hour(): number {
        return Math.floor(this._totalSeconds / MRData.chronus.secondsInHour);
    }


    

}

