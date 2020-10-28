import { REVisual_Manager } from "./REVisual_Manager";

/**
 */
export class REVisual
{
    static manager: REVisual_Manager;

    static initialize() {
        this.manager = new REVisual_Manager();
    }

    static finalize() {
        if (this.manager) {
            this.manager._finalize();
        }
    }
}

