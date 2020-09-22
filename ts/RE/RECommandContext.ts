
export class RECommandContext
{
    private _visualAnimationWaiting: boolean = false;

    visualAnimationWaiting(): boolean {
        return this._visualAnimationWaiting;
    }

    clearVisualAnimationWaiting(): void {
        this._visualAnimationWaiting = false;
    }
    
    isRunning(): boolean {
        return false;   // TODO:
    }
}


