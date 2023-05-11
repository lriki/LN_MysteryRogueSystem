import { MRView } from "../MRView";

export class VWindowFactory {
    public createWindowr<T extends Window_Base>(ctor: { new(...args: any[]): T }, defaultRect: Rectangle): T {
        let window = MRView.ext.onCreateWindow(ctor.name, defaultRect);
        if (!window) {
            window = new ctor(defaultRect);
        }
        
        return window as T;
    }
}

