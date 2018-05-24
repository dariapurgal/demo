import * as React from 'react'
import { Range } from '../Model'
import { DelegateBehavior, Behavior } from './Behavior'
import { DrawFillHandleBehavior } from './DrawFillHandleBehavior'


export class DrawSelectionBehavior extends DelegateBehavior {


    constructor(inner: Behavior) {
        super(new DrawFillHandleBehavior(inner))
    }

    renderPanePart = (pane: Range): React.ReactNode => {
        return <>
            {this.inner.renderPanePart(pane)}
            {this.grid.renderPartialAreaForPane(this.grid.state.selectedRange, pane, { border: '1px solid #3579f8', backgroundColor: 'rgba(53, 121, 248, 0.1)' })}
        </>
    }
}



