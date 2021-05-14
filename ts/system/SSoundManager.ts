

export class SSoundManager {
    public static playSystemSound(n: number) {
        if (typeof SoundManager !== 'undefined') {
            SoundManager.playSystemSound(n);
        }
    }

    public static playEquip(): void {
        this.playSystemSound(4);
    };
}
