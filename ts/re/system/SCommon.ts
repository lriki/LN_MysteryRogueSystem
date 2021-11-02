
export enum SStepPhase {
    SequenceStarting,
    PhaseStarting,
    StepStarting,
    MainProcess,
    MainProcessClosing,

    AfterProcess,   // カウンター用
    AfterProcessClosing,

    StepClosing,

    Closed,
}
