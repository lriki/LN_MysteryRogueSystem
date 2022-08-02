
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

export enum SWarehouseDialogResult {
    Succeeded = 0,
    SucceededAsMuch = 1,
    
    Cancel = -1,
    FullyCanceled = -2,
}
