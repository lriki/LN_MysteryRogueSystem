

export class SSoundManager {
    public static playSystemSound(n: number) {
        if (typeof SoundManager !== 'undefined') {
            SoundManager.playSystemSound(n);
        }
    }
    public static playSe(sound: IDataSound) {
        if (typeof SoundManager !== 'undefined') {
            AudioManager.playSe(sound);
        }
    }

    public static playEquip(): void {
        this.playSystemSound(4);
    }

    public static playPickItem(): void {
        this.playSe({ name: "Item1", volume: 80, pitch: 100, pan: 0 });
    }

    public static playLevelUp(): void {
        this.playSe({ name: "Item3", volume: 80, pitch: 100, pan: 0 });
    }
}
