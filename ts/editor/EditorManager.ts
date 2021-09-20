//import gui from "nw.gui"

declare var nw: any;

export class EditorManager {
    private static _editorActive: boolean = false;
    private static _gameCanvas: HTMLCanvasElement | null;
    private static _editorRoot: HTMLDivElement | null;

    public static isPlaytest(): boolean {
        return $gameTemp && $gameTemp.isPlaytest();
    }

    public static isEditorActive(): boolean {
        return this._editorActive;
    }

    public static setGameCanvas(element: HTMLCanvasElement): void {
        this._gameCanvas = element;
    }

    public static toggle() {
    //const gui = require('nw.gui');
        
        const mainWindow = nw.Window.get();
        mainWindow.resizeTo(1600, 624);

        this._gameCanvas = document.querySelector('#gameCanvas') as HTMLCanvasElement;
        if (this._gameCanvas) {
            this._gameCanvas.style.margin = "0px";

            
        }

        this._editorRoot = document.querySelector('#editorRoot') as HTMLDivElement;
        if (this._editorRoot ) {
            const width = this._gameCanvas.width * Graphics._realScale;
            //const height = this._gameCanvas.height * Graphics._realScale;
            this._editorRoot.style.marginLeft = width + "px";
        }
    }
}
