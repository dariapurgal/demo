import * as React from 'react'
import { Range } from '../Model'
import { DelegateBehavior, Behavior } from './Behavior'
import { FillHandleBehavior } from './FillHandleBehavior'

export class DrawFillHandleBehavior extends DelegateBehavior {

    constructor(inner: Behavior) {
        super(inner)
    }
    private renderFillHandle(pane: Range) {
        if (!this.grid.state.selectedRange || !pane.contains(this.grid.state.selectedRange.last) || this.grid.state.isFocusedCellInEditMode)
            return

        const focusedCell = this.grid.state.focusedLocation
        const row = this.grid.state.selectedRange.last
        //const first = this.grid.state.selectedRange.firstCell
        const onFocus = row.col.idx == focusedCell.col.idx && row.row.idx == focusedCell.row.idx
        const left = row.col.left + row.col.width - (onFocus ? 5.5 : 4.5)
        const top = row.row.top + row.row.height - (onFocus ? 5.5 : 4.5)
        return <div onMouseDown={e => {
            this.grid.setState({ currentBehavior: new FillHandleBehavior(this.grid) })
            e.stopPropagation()
        }}
            style={{
                position: 'absolute',
                top: top,
                left: left,
                width: 6, height: 6,
                backgroundColor: '#3579f8',
                border: '1px solid white',
                cursor: 'crosshair',
                // zIndex: (pane.lastCol.idx === focusedCell.col.idx) ? 10 : 0
            }} />
    }



    renderPanePart = (pane: Range): React.ReactNode => {
        return <>
            {this.inner.renderPanePart(pane)}
            {this.renderFillHandle(pane)}
        </>
    }
}



