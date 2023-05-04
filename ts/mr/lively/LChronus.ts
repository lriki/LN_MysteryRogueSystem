import { MRSerializable } from "../Common";
import { MRData } from "../data";
import { DChronusTimeFrame } from "../data/DChronus";

@MRSerializable
export class LChronus {
    // NOTE: トリアコンタンさんのプラグインは秒と日数を分けていたが、
    // 本プラグインではマップロード時に前回セーブ時の日時との差分から
    // シミュレーションを実行したりするので、差分を出しやすいようにひとつの変数で表す。
    private _totalSeconds: number;

    private _currentTimeFrameIndex: number;
    private _revisionNumber: number;
    private _needsLivingTimeFrameRefresh: boolean;

    public constructor() {
        this._totalSeconds = 0;
        this._currentTimeFrameIndex = 0;
        this._revisionNumber = 0;
        this._needsLivingTimeFrameRefresh = false;
    }

    public get revisionNumber(): number {
        return this._revisionNumber;
    }

    /** 日中の秒数。(0 ~ MRData.chronus.secondsInDay-1) */
    public get totalSeconds(): number {
        return this._totalSeconds;
    }

    /** 経過日数 */
    public getTotalDays(): number {
        return Math.floor(this._totalSeconds / MRData.chronus.secondsInDay);
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
        var hour = this.getClockHour();
        return hour >= start && hour <= last;
    };

    public advanceRound(): void {
        this.advanceSeconds(MRData.chronus.secondsInRound);
    }
    
    private advanceSeconds(secs: number): void {
        if (!MRData.chronus.enabled) return;
        this._totalSeconds += secs;
        this.requireRefresh();
    }

    private requireRefresh(): void {
        this._revisionNumber++;
        const oldTimeFrameKind = this.currentTimeFrame.kind;
        this._currentTimeFrameIndex = this.getTimeFrameIndex();
        if (oldTimeFrameKind !== this.currentTimeFrame.kind) {
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
        return this.getTotalDays() % MRData.chronus.getDaysOfWeek();
    }

    /** 現在の曜日名 */
    public getWeekName(): string {
        return MRData.chronus.weekNames[this.weekIndex];
    };

    /** 現在の秒表示 (0~59) */
    public getClockSecond(): number {
        return Math.floor(this._totalSeconds / MRData.chronus.secondsInMinute);
    }

    /** 現在の時表示 (0~23) */
    public getClockHour(): number {
        return Math.floor(this._totalSeconds / MRData.chronus.secondsInHour % MRData.chronus.hoursInDay);
    }

    /** 現在の分表示 (0~59) */
    public getClockMinute(): number {
        return Math.floor(this._totalSeconds / MRData.chronus.secondsInMinute % MRData.chronus.minutesInHour);
    }

    /** 現在の日表示 (1~12) */
    public getCalendarDay(): number {
        let days = this.getTotalDays() % MRData.chronus.getDaysOfYear();
        for (let i = 0; i < MRData.chronus.daysOfMonth.length; i++) {
            if (days < MRData.chronus.daysOfMonth[i]) return days + 1;
            days -= MRData.chronus.daysOfMonth[i];
        }
        throw new Error("Unreachable.");
    }

    /** 現在の月表示 (1~12) */
    public getCalendarMonth(): number {
        let days = this.getTotalDays() % MRData.chronus.getDaysOfYear();
        for (let i = 0; i < MRData.chronus.daysOfMonth.length; i++) {
            days -= MRData.chronus.daysOfMonth[i];
            if (days < 0) return i + 1;
        }
        throw new Error("Unreachable.");
    }

    /** 現在の年表示 (1~12) */
    public getCalendarYear(): number {
        return Math.floor(this.getTotalDays() / MRData.chronus.getDaysOfYear()) + 1;
    }

    public getDisplayText(): string {
        return this.convertDateFormatText("YYYY/MM/DD HH24:MI");
    }

    public convertDateFormatText(format: string): string {
        format = format.replace(/(YYYY)/gi, (substring, args) => {
            return this.getValuePadding(this.getCalendarYear(), substring.length);
        });
        format = format.replace(/MON/gi, () => {
            return MRData.chronus.monthNames[this.getCalendarMonth() - 1];
        });
        format = format.replace(/MM/gi, () => {
            return this.getValuePadding(this.getCalendarMonth(), String(MRData.chronus.getMonthOfYear()).length);
        });
        format = format.replace(/DDALL/gi, () => {
            return this.getValuePadding(this.getTotalDays());
        });
        format = format.replace(/DD/gi, () => {
            return this.getValuePadding(this.getCalendarDay(),
                String(MRData.chronus.getDaysOfMonth(this.getCalendarMonth())).length);
        });
        format = format.replace(/HH24/gi, () => {
            return this.getValuePadding(this.getClockHour(), 2);
        });
        format = format.replace(/HH12/gi, () => {
            return this.getValuePadding(this.getClockHour() % 12, 2);
        });
        format = format.replace(/AM/gi, () => {
            return Math.floor(this.getClockHour() / 12) === 0 ?
                $gameSystem.isJapanese() ? '午前' : 'Morning  ' :
                $gameSystem.isJapanese() ? '午後' : 'Afternoon';
        });
        format = format.replace(/MI/gi, () => {
            return this.getValuePadding(this.getClockMinute(), 2);
        });
        format = format.replace(/DY/gi, () => {
            return this.getWeekName();
        });
        // format = format.replace(/TZ/gi, () => {
        //     return this.getTimeZoneName();
        // });
        return format;
    };

    private getValuePadding(value: number, digit: number = 0, padChar?: string | undefined) {
        // if (this._disablePadding) {
        //     return value;
        // }
        if (arguments.length === 2) padChar = '0';
        var result = '';
        for (var i = 0; i < digit; i++) result += padChar;
        result += value;
        return result.substr(-digit);
    };

    

}

