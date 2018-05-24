import * as React from 'react'
import { keyCodes } from '../Constants'
import { DelegateBehavior } from './Behavior'


export class KeyNavigationInsideSelectionBehavior extends DelegateBehavior {

    private moveFocusInsideSelectedRange(direction: -1 | 1 | 'up' | 'down') {
        const selectedRange = this.grid.state.selectedRange
        const colCount = selectedRange.cols.length
        const delta = (direction === 'up') ? -colCount : (direction === 'down') ? colCount : direction
        const focusedCell = this.grid.state.focusedLocation
        const currentPosInRange = (focusedCell.row.idx - selectedRange.first.row.idx) * colCount + (focusedCell.col.idx - selectedRange.first.col.idx)
        const newPosInRange = (currentPosInRange + delta) % (selectedRange.rows.length * selectedRange.cols.length)
        const newColIdx = (this.grid.state.selectedRange.first.col.idx + (newPosInRange % colCount))
        const newRowIdx = ((this.grid.state.selectedRange.first.row.idx + Math.floor(newPosInRange / colCount)))
        const location = this.grid.props.cellMatrix.getLocation(newRowIdx, newColIdx)
        this.grid.focusLocation(location, false)

    }

    private handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {

        if (this.grid.state.selectedRange === undefined || !(this.grid.state.selectedRange.cols.length > 1 || this.grid.state.selectedRange.rows.length > 1))
            return
        const focusedCell = this.grid.state.focusedLocation

        if (event.keyCode === keyCodes.TAB && !event.shiftKey) {
            this.moveFocusInsideSelectedRange(1)
            event.preventDefault()
        }
        else if (event.keyCode === keyCodes.TAB && event.shiftKey) {
            if (this.grid.state.focusedLocation.col.idx == 0 && this.grid.state.focusedLocation.row.idx === this.grid.state.selectedRange.first.row.idx) {
                const cell = this.grid.props.cellMatrix.getLocation(this.grid.state.selectedRange.last.row.idx, this.grid.state.selectedRange.last.col.idx)
                this.grid.focusLocation(cell, false)
            } else
                this.moveFocusInsideSelectedRange(-1)

            if (this.grid.state.focusedLocation.col.idx === this.grid.state.selectedRange.first.col.idx && this.grid.state.focusedLocation.row.idx === this.grid.state.selectedRange.first.row.idx) {
                const cell = this.grid.props.cellMatrix.getLocation(this.grid.state.selectedRange.last.row.idx, this.grid.state.selectedRange.last.col.idx)
                this.grid.focusLocation(cell, false)
            }

            event.preventDefault()
        }
        else if (event.keyCode === keyCodes.ENTER && !event.shiftKey) {
            this.moveFocusInsideSelectedRange('down')
            event.preventDefault()
        }
        else if (event.keyCode === keyCodes.ENTER && event.shiftKey) {
            this.moveFocusInsideSelectedRange('up')
            if (this.grid.state.focusedLocation.row.idx === this.grid.state.selectedRange.first.row.idx) {
                const cell = this.grid.props.cellMatrix.getLocation(this.grid.state.selectedRange.last.row.idx, this.grid.state.focusedLocation.col.idx)
                this.grid.focusLocation(cell, false)
            }
            event.preventDefault()
        }
        else if (event.keyCode === keyCodes.DELETE) {
            this.delete()
        }
        else if (event.keyCode === keyCodes.BACKSPACE) {
            this.delete()
        }
        else if (!event.shiftKey && event.keyCode === keyCodes.LEFT_ARROW && focusedCell.col.idx > 0) {
            const cell = this.grid.props.cellMatrix.getLocation(focusedCell.row.idx, focusedCell.col.idx - 1)
            this.grid.focusLocation(cell)
        }
        else if (!event.shiftKey && event.keyCode === keyCodes.RIGHT_ARROW && focusedCell.col.idx < this.grid.props.cellMatrix.last.col.idx) {
            const cell = this.grid.props.cellMatrix.getLocation(focusedCell.row.idx, focusedCell.col.idx + 1)
            this.grid.focusLocation(cell)
        }
        else if (!event.shiftKey && event.keyCode === keyCodes.UP_ARROW && focusedCell.row.idx > 0) {
            const cell = this.grid.props.cellMatrix.getLocation(focusedCell.row.idx - 1, focusedCell.col.idx)
            this.grid.focusLocation(cell)
        }
        else if (!event.shiftKey && event.keyCode === keyCodes.DOWN_ARROW && focusedCell.row.idx < this.grid.props.cellMatrix.last.row.idx) {
            const cell = this.grid.props.cellMatrix.getLocation(focusedCell.row.idx + 1, focusedCell.col.idx)
            this.grid.focusLocation(cell)
        }
        event.stopPropagation()

    }


    handleKeyUp(event: React.KeyboardEvent<HTMLDivElement>) {
        if (this.grid.state.selectedRange === undefined || !(this.grid.state.selectedRange.cols.length > 1 || this.grid.state.selectedRange.rows.length > 1))
            return
        if (event.keyCode === keyCodes.TAB || event.keyCode === keyCodes.ENTER) {
            event.preventDefault()
            event.stopPropagation()
        }
    }

    delete() {
        this.grid.state.selectedRange.rows.forEach(row =>
            this.grid.state.selectedRange.cols.forEach(col =>
                this.grid.props.cellMatrix.getCell({ row, col }).trySetValue('')
            ))
        this.grid.commitChanges()
    }

    renderHiddenPart = (hiddenElement: React.ReactNode) => <div onKeyUp={e => this.handleKeyUp(e)} onKeyDown={e => this.handleKeyDown(e)}>{this.inner.renderHiddenPart(hiddenElement)}</div>

}
