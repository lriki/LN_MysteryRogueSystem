import { LActivity } from "./LActivity";

export abstract class LActivityPreprocessor {
    public abstract preprocess(src: LActivity): LActivity;
}
