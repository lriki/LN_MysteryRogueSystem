import { Window_ActionCommand } from "../windows/Window_ActionCommand";

/**
 * [足元]
 */
export class Scene_Footing extends Scene_MenuBase {

    _entityNameWindow: Window_Help | undefined;
    _commandWindow: Window_ActionCommand | undefined;

    create(): void {
        super.create();

        this._entityNameWindow = new Window_Help(new Rectangle(0, 20, 300, 100));
        this.addWindow(this._entityNameWindow);

        this._commandWindow = new Window_ActionCommand(new Rectangle(0, 100, 200, 100));
        this._commandWindow.setHandler("cancel", this.popScene.bind(this));
        this.addWindow(this._commandWindow);

        this._entityNameWindow.setText("test");
        
        console.log("create Scene_Footing");
    }
    
    start(): void {
        super.start();
        console.log("start Scene_Footing");
    }

    update(): void {
        super.update();
        console.log("update Scene_Footing");
    }

    
}

