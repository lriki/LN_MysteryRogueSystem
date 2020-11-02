import { assert } from "ts/Common";
import { REEntityVisualSet } from "./REEntityVisualSet";
import { REVisual_Manager } from "./REVisual_Manager";

/**
 */
export class REVisual
{
    static manager: REVisual_Manager | undefined;
    static entityVisualSet: REEntityVisualSet | undefined;

    static initialize() {
        assert(!this.manager);
        this.manager = new REVisual_Manager();
    }

    static finalize() {
        if (this.manager) {
            this.manager._finalize();
            this.manager = undefined;
        }
    }
}

