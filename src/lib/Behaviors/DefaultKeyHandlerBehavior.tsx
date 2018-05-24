import * as React from 'react'
import { DelegateBehavior } from './Behavior'

export class DefaultKeyHandlerBehavior extends DelegateBehavior {

    private handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        if (!this.grid.state.focusedLocation || event.ctrlKey)
            return

        if ((event.keyCode >= 48 && event.keyCode <= 90) || (event.keyCode >= 96 && event.keyCode <= 111) || (event.keyCode >= 186 && event.keyCode <= 222)) {
            this.grid.props.cellMatrix.getCell(this.grid.state.focusedLocation).trySetValue('')
            this.grid.setState({ isFocusedCellInEditMode: true })
            event.stopPropagation()
            return
        }
    }

    renderHiddenPart = (hiddenElement: React.ReactNode) => <div onKeyDown={e => this.handleKeyDown(e)}>{this.inner.renderHiddenPart(hiddenElement)}</div>
}