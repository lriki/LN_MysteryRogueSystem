
export enum SStepPhase {
    RunStarting,
        PhaseStarting,
            StepStarting,

                MainProcess,
                MainProcessClosing,
                AfterProcess,   // カウンター用
                AfterProcessClosing,

            StepClosing,

        PhaseClosing,
    RunClosing,
    Closed,
}
