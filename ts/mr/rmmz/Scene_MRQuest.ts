import { VQuestClassWindow } from "../view/windows/VQuestClassWindow";
import { VWindowHelper } from "../view/windows/VWindowHelper";
import { VLayout } from "../view/ui/VUIElement";
import { VQuestListWindow } from "../view/windows/VQuestListWindow";

export class Scene_MRQuest extends Scene_MenuBase {
    private _questClassWindow!: VQuestClassWindow;
    private _questListWindow!: VQuestListWindow;

    override create(): void {
        super.create();
        this.createQuestClassWindow();
        this.createQuestListWindow();
        this.createQuestDetailsWindow();
        this._questClassWindow.activate();
    }

    private createQuestClassWindow(): void {
        const window = new VQuestClassWindow(VLayout.makeGridRect(0, 0, 4, 2));//new Rectangle(0, 0, 200, VWindowHelper.calcWindowHeight(1, true)));
        this.addWindow(window);
        this._questClassWindow = window;
    }
    
    private createQuestListWindow(): void {
        const window = new VQuestListWindow(VLayout.makeGridRect(0, 2, 4, 10));
        this.addWindow(window);
        this._questListWindow = window;
    }

    private createQuestDetailsWindow(): void {
        
    }
}
