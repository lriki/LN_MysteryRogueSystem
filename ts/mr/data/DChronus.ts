import { tr2 } from "../Common";

export enum DChronusTimeFrameKind {
    Daytime = 0,
    Nighttime = 1,
}

// 時間帯。 TimeZone だと UTC からの時間区分と間違えやすいので、TimeFrame という名前にする。
export interface DChronusTimeFrame {
    name: string;
    kind: DChronusTimeFrameKind;
    startHour: number;
    lastHouer: number;
    timeFrameId: number;
}

export interface DChronusTimeTone {
    timeFrameId: number;
    value: number[];
}

export class DChronus {
    public enabled: boolean;

    public readonly timeFrames: DChronusTimeFrame[];
    public readonly timeTones: DChronusTimeTone[];

    /** 月ごとの日数配列 */
    public readonly daysOfMonth: number[];

    /** 月名配列 */
    public readonly monthNames: string[];

    /** 曜日配列 */
    public readonly weekNames: string[];

    /** 1ラウンドの経過秒数 */
    public readonly secondsInRound: number;

    /** 1分の秒数 */
    public readonly secondsInMinute = 60;

    /** 1時間の分数 */
    public readonly minutesInHour = 60;

    /** 1日の分数 */
    public readonly hoursInDay = 24;

    public constructor() {
        this.enabled = false;
        this.timeFrames = [
            { name: tr2("深夜"), kind: DChronusTimeFrameKind.Nighttime, startHour: 0, lastHouer: 4, timeFrameId: 0 },
            { name: tr2("早朝"), kind: DChronusTimeFrameKind.Nighttime, startHour: 5, lastHouer: 6, timeFrameId: 1 },
            { name: tr2("朝"), kind: DChronusTimeFrameKind.Daytime, startHour: 7, lastHouer: 11, timeFrameId: 2 },
            { name: tr2("昼"), kind: DChronusTimeFrameKind.Daytime, startHour: 12, lastHouer: 16, timeFrameId: 3 },
            { name: tr2("夕方"), kind: DChronusTimeFrameKind.Daytime, startHour: 17, lastHouer: 18, timeFrameId: 4 },
            { name: tr2("夜"), kind: DChronusTimeFrameKind.Nighttime, startHour: 19, lastHouer: 21, timeFrameId: 5 },
            { name: tr2("深夜"), kind: DChronusTimeFrameKind.Nighttime, startHour: 22, lastHouer: 24, timeFrameId: 0 },
        ];
        this.timeTones = [
            // timeId:時間帯ID value:色調[赤(-255...255),緑(-255...255),青(-255...255),グレー(0...255)]
            { timeFrameId: 0, value: [-102, -102, -68, 102] },
            { timeFrameId: 1, value: [-68, -68, 0, 0] },
            { timeFrameId: 2, value: [0, 0, 0, 0] },
            { timeFrameId: 3, value: [34, 34, 34, 0] },
            { timeFrameId: 4, value: [68, -34, -34, 0] },
            { timeFrameId: 5, value: [-68, -68, 0, 68] },
        ];
        this.daysOfMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
        this.monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
        this.weekNames = ["(日)", "(月)", "(火)", "(水)", "(木)", "(金)", "(土)"];
        this.secondsInRound = this.secondsInHour; //60;
    }

    /** 1日の秒数 */
    public get secondsInDay(): number {
        return this.secondsInMinute * this.minutesInHour * this.hoursInDay;
    }

    /** 1時間の秒数 */
    public get secondsInHour(): number {
        return this.secondsInMinute * this.minutesInHour;
    }

    public getDaysOfWeek(): number {
        return this.weekNames.length;
    };

    public getDaysOfMonth(month: number): number {
        return this.daysOfMonth[month - 1];
    };

    public getDaysOfYear(): number {
        let result = 0;
        for (const d of this.daysOfMonth) {
            result += d;
        }
        return result;
    };
}

