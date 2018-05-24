import * as React from 'react'
import { DelegateBehavior } from './Behavior'
import { keyCodes } from '../Constants'

export class DefaultKeyNavigationBehavior extends DelegateBehavior {

    private focusCell(colIdx: number, rowIdx: number) {
        const location = this.grid.props.cellMatrix.getLocation(rowIdx, colIdx)
        this.grid.focusLocation(location)
    }

    private handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        const focusedLocation = this.grid.state.focusedLocation
        if (event.keyCode === keyCodes.TAB || event.keyCode === keyCodes.ENTER) {
            event.preventDefault()
        }

        if (!event.shiftKey && event.keyCode === keyCodes.LEFT_ARROW && focusedLocation.col.idx > 0) {
            this.focusCell(focusedLocation.col.idx - 1, focusedLocation.row.idx)
        } else if (!event.shiftKey && event.keyCode === keyCodes.RIGHT_ARROW && focusedLocation.col.idx < this.grid.props.cellMatrix.last.col.idx) {
            this.focusCell(focusedLocation.col.idx + 1, focusedLocation.row.idx)
        } else if (!event.shiftKey && event.keyCode === keyCodes.UP_ARROW && focusedLocation.row.idx > 0) {
            this.focusCell(focusedLocation.col.idx, focusedLocation.row.idx - 1)
        } else if (!event.shiftKey && event.keyCode === keyCodes.DOWN_ARROW && focusedLocation.row.idx < this.grid.props.cellMatrix.last.row.idx) {
            this.focusCell(focusedLocation.col.idx, focusedLocation.row.idx + 1)
        } else if (event.ctrlKey && event.keyCode === keyCodes.HOME) {
            this.focusCell(0, 0)
        } else if (event.keyCode === keyCodes.HOME) {
            this.focusCell(0, focusedLocation.row.idx)
        } else if (event.ctrlKey && event.keyCode === keyCodes.END) {
            this.grid.focusLocation(this.grid.props.cellMatrix.last)
        } else if (event.keyCode === keyCodes.END) {
            this.focusCell(this.grid.props.cellMatrix.cols.length - 1, focusedLocation.row.idx)
        } else if (!event.shiftKey && event.keyCode === keyCodes.PAGE_UP && !this.grid.state.isFocusedCellInEditMode) {
            const rowsOnScreen = this.grid.props.cellMatrix.rows.filter(r => r.top < this.grid.gridElement.clientHeight)
            this.focusCell(focusedLocation.col.idx, (focusedLocation.row.idx - rowsOnScreen.length > 0 ? focusedLocation.row.idx - rowsOnScreen.length : 0))
        } else if (!event.shiftKey && event.keyCode === keyCodes.PAGE_DOWN) {
            const rowsOnScreen = this.grid.props.cellMatrix.rows.filter(r => r.top < this.grid.gridElement.clientHeight)
            this.focusCell(focusedLocation.col.idx, (focusedLocation.row.idx + rowsOnScreen.length < this.grid.props.cellMatrix.rows.length ? focusedLocation.row.idx + rowsOnScreen.length : this.grid.props.cellMatrix.rows.length - 1))
        } else if (event.keyCode === keyCodes.DELETE || event.keyCode === keyCodes.BACKSPACE) {
            this.grid.props.cellMatrix.getCell(focusedLocation).trySetValue('')
            this.grid.commitChanges()
        } else {
            return
        }
        event.stopPropagation()
        event.preventDefault()
        return
    }

    handleKeyUp(event: React.KeyboardEvent<HTMLDivElement>) {
        const focusedLocation = this.grid.state.focusedLocation
        if (!focusedLocation) return
        if (event.keyCode === keyCodes.TAB && event.shiftKey && focusedLocation.col.idx > 0) {
            this.focusCell(focusedLocation.col.idx - 1, focusedLocation.row.idx)
        } else
            if (event.keyCode === keyCodes.TAB && !event.shiftKey && focusedLocation.col.idx < this.grid.props.cellMatrix.last.col.idx) {
                this.focusCell(focusedLocation.col.idx + 1, focusedLocation.row.idx)
            } else
                if (!event.shiftKey && event.keyCode === keyCodes.ENTER && this.grid.state.isFocusedCellInEditMode && focusedLocation.row.idx < this.grid.props.cellMatrix.last.row.idx) {
                    this.focusCell(focusedLocation.col.idx, focusedLocation.row.idx + 1)
                } else if (!event.shiftKey && event.keyCode === keyCodes.ENTER && !this.grid.state.isFocusedCellInEditMode) {
                    this.grid.setState({ isFocusedCellInEditMode: true })
                } else if (!event.shiftKey && event.keyCode === keyCodes.ENTER && this.grid.state.isFocusedCellInEditMode && focusedLocation.row.idx > 0) {
                    this.focusCell(focusedLocation.col.idx, focusedLocation.row.idx - 1)
                } else if (!event.shiftKey && event.keyCode === keyCodes.ENTER && !this.grid.state.isFocusedCellInEditMode) {
                    this.grid.setState({ isFocusedCellInEditMode: true })
                }
    }

    renderHiddenPart = (hiddenElement: React.ReactNode) => <div onKeyUp={e => this.handleKeyUp(e)} onKeyDown={e => this.handleKeyDown(e)} >{this.inner.renderHiddenPart(hiddenElement)}</div>
}