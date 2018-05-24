import * as React from 'react'
import { DelegateBehavior } from './Behavior'
import { keyCodes } from '../Constants';

export class ResizeSelectionWithKeysBehavior extends DelegateBehavior {

    private resizeSelection(firstColIdx: number, lastColIdx: number, firstRowIdx: number, lastRowIdx: number, scroll = true) {
        const start = this.grid.props.cellMatrix.getLocation(firstRowIdx, firstColIdx)
        const end = this.grid.props.cellMatrix.getLocation(lastRowIdx, lastColIdx)
        this.grid.setState({ selectedRange: this.grid.props.cellMatrix.getRange(start, end) })
        if (scroll)
            this.grid.scrollIntoView(end)
    }

    private handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {

        const selectedRange = this.grid.state.selectedRange
        const focusedCell = this.grid.state.focusedLocation

        if (event.keyCode === keyCodes.UP_ARROW && event.shiftKey && selectedRange.first.row.idx > 0) {
            if (selectedRange.last.row.idx > focusedCell.row.idx) {
                this.resizeSelection(selectedRange.first.col.idx, selectedRange.last.col.idx, selectedRange.first.row.idx, selectedRange.last.row.idx - 1)
            } else {
                this.resizeSelection(selectedRange.last.col.idx, selectedRange.first.col.idx, selectedRange.last.row.idx, selectedRange.first.row.idx - 1)
            }
        }
        else if (event.keyCode === keyCodes.DOWN_ARROW && event.shiftKey && selectedRange.last.row.idx < this.grid.props.cellMatrix.last.row.idx) {
            if (selectedRange.first.row.idx < focusedCell.row.idx) {
                this.resizeSelection(selectedRange.last.col.idx, selectedRange.first.col.idx, selectedRange.last.row.idx, selectedRange.first.row.idx + 1)
            } else {
                this.resizeSelection(selectedRange.first.col.idx, selectedRange.last.col.idx, selectedRange.first.row.idx, selectedRange.last.row.idx + 1)
            }
        }
        else if (event.keyCode === keyCodes.LEFT_ARROW && event.shiftKey && selectedRange.first.col.idx > 0) {
            if (selectedRange.last.col.idx > focusedCell.col.idx) {
                this.resizeSelection(selectedRange.first.col.idx, selectedRange.last.col.idx - 1, selectedRange.first.row.idx, selectedRange.last.row.idx)
            } else {
                this.resizeSelection(selectedRange.last.col.idx, selectedRange.first.col.idx - 1, selectedRange.last.row.idx, selectedRange.first.row.idx)
            }
        }
        else if (event.keyCode === keyCodes.RIGHT_ARROW && event.shiftKey && (selectedRange.last.col.idx < this.grid.props.cellMatrix.last.col.idx)) {
            if (selectedRange.first.col.idx < focusedCell.col.idx) {
                this.resizeSelection(selectedRange.last.col.idx, selectedRange.first.col.idx + 1, selectedRange.last.row.idx, selectedRange.first.row.idx)
            } else {
                this.resizeSelection(selectedRange.first.col.idx, selectedRange.last.col.idx + 1, selectedRange.first.row.idx, selectedRange.last.row.idx)
            }
        }
        else if (event.ctrlKey && event.keyCode === keyCodes.A) {
            this.resizeSelection(0, this.grid.props.cellMatrix.last.col.idx, 0, this.grid.props.cellMatrix.last.row.idx, false)
        }
        else if (event.ctrlKey && event.keyCode === keyCodes.SPACE) {
            this.resizeSelection(selectedRange.first.col.idx, selectedRange.last.col.idx, 0, this.grid.props.cellMatrix.last.row.idx, false)
        }
        else if (event.shiftKey && event.keyCode === keyCodes.SPACE) {
            this.resizeSelection(0, this.grid.props.cellMatrix.last.col.idx, selectedRange.first.row.idx, selectedRange.last.row.idx, false)
        } else if (event.shiftKey && event.keyCode === keyCodes.PAGE_UP && !this.grid.state.isFocusedCellInEditMode) {
            const rowsOnScreen = this.grid.props.cellMatrix.rows.filter(r => r.top < this.grid.gridElement.clientHeight)
            if (selectedRange.first.row.idx >= focusedCell.row.idx)
                this.resizeSelection(selectedRange.first.col.idx, selectedRange.last.col.idx, selectedRange.first.row.idx, (selectedRange.last.row.idx - rowsOnScreen.length > 0) ? selectedRange.last.row.idx - rowsOnScreen.length : 0)
            else
                this.resizeSelection(selectedRange.last.col.idx, selectedRange.first.col.idx, selectedRange.last.row.idx, (selectedRange.first.row.idx - rowsOnScreen.length > 0) ? selectedRange.first.row.idx - rowsOnScreen.length : 0)
        } else if (event.shiftKey && event.keyCode === keyCodes.PAGE_DOWN) {
            const rowsOnScreen = this.grid.props.cellMatrix.rows.filter(r => r.top < this.grid.gridElement.clientHeight)
            if (selectedRange.first.row.idx >= focusedCell.row.idx)
                this.resizeSelection(selectedRange.first.col.idx, selectedRange.last.col.idx, selectedRange.first.row.idx, (selectedRange.last.row.idx + rowsOnScreen.length < this.grid.props.cellMatrix.rows.length) ? selectedRange.last.row.idx + rowsOnScreen.length : this.grid.props.cellMatrix.rows.length - 1)
            else
                this.resizeSelection(selectedRange.last.col.idx, selectedRange.first.col.idx, selectedRange.last.row.idx, (selectedRange.first.row.idx + rowsOnScreen.length < this.grid.props.cellMatrix.rows.length) ? selectedRange.first.row.idx + rowsOnScreen.length : this.grid.props.cellMatrix.rows.length - 1)
        }
        else if (event.ctrlKey && event.shiftKey && event.keyCode === keyCodes.HOME) {
            this.resizeSelection(selectedRange.first.col.idx, selectedRange.last.col.idx, 0, selectedRange.last.row.idx)
        }
        else if (event.ctrlKey && event.shiftKey && event.keyCode === keyCodes.END) {
            this.resizeSelection(selectedRange.first.col.idx, selectedRange.last.col.idx, selectedRange.first.row.idx, this.grid.props.cellMatrix.last.row.idx, false)
        }
        else if (event.shiftKey && event.keyCode === keyCodes.HOME) {
            this.resizeSelection(0, selectedRange.last.col.idx, selectedRange.first.row.idx, selectedRange.last.row.idx)
        }
        else if (event.shiftKey && event.keyCode === keyCodes.END) {
            this.resizeSelection(selectedRange.first.col.idx, this.grid.props.cellMatrix.last.col.idx, selectedRange.first.row.idx, selectedRange.last.row.idx)
        }
        else {
            return
        }
        event.stopPropagation()
        event.preventDefault()
        return

    }

    renderHiddenPart = (hiddenElement: React.ReactNode) => <div onKeyDown={e => this.handleKeyDown(e)}>{this.inner.renderHiddenPart(hiddenElement)}</div>

}