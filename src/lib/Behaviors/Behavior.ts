import * as React from 'react'
import { Grid } from '../Grid'
import { Range } from '../Model'


export interface Behavior {
    renderPanePart: (pane: Range) => React.ReactNode
    renderHiddenPart: (hiddenElement: React.ReactNode) => React.ReactNode
    dispose: () => void
    grid: Grid
}

export class DelegateBehavior implements Behavior {
    constructor(protected inner: Behavior) { }
    renderPanePart: (pane: Range) => React.ReactNode
        = this.inner.renderPanePart
    renderHiddenPart: (hiddenElement: React.ReactNode) => React.ReactNode
        = this.inner.renderHiddenPart
    dispose: () => void
        = this.inner.dispose
    grid: Grid
        = this.inner.grid
}