import * as React from 'react'
import { Grid } from '../Grid'
import { Orientation, Location } from '../Model'
import { AutoScrollBehavior } from './AutoScrollBehavior'
import { DelegateBehavior } from './Behavior'
import { BasicGridBehavior } from './BasicGridBehavior'

export class CellSelectionBehavior extends DelegateBehavior {
    private clientX = 0 // for gridScrollHandler!
    private clientY = 0

    private mouseMoveHandler = this.handleMouseMove.bind(this)
    private mouseUpHandler = () => this.grid.resetToDefaultBehavior()
    private gridScrollHandler = () => this.updateCellSelection()

    // cell selection used by header and regular click? these are different behaviors!
    constructor(grid: Grid, event: React.MouseEvent<HTMLDivElement>, private selectionType: 'cell' | 'row' | 'column') {

        super(new AutoScrollBehavior(new BasicGridBehavior(grid), (selectionType == 'row') ? 'vertical' : (selectionType == 'column') ? 'horizontal' : 'both'))
        window.addEventListener('mousemove', this.mouseMoveHandler)
        window.addEventListener('mouseup', this.mouseUpHandler)
        this.grid.gridElement.addEventListener('scroll', this.gridScrollHandler)
        this.clientX = event.clientX
        this.clientY = event.clientY
        if (event.shiftKey && this.grid.state.focusedLocation) {
            this.updateCellSelection()
        }
    }

    private handleMouseMove(event: MouseEvent) {
        this.clientX = event.clientX
        this.clientY = event.clientY
        const location = this.grid.getLocationOnScreen(event.clientX, event.clientY)
        if (this.selectionType === 'column' && this.grid.state.focusedLocation.row.idx === location.row.idx) {
            this.updateColumnSelection(location)
        } else if (this.selectionType === 'row' && this.grid.state.focusedLocation.col.idx === location.col.idx) {
            this.updateRowSelection(location)
        } else {
            this.updateCellSelection()
        }

    }
    private updateColumnSelection(location: Location) {
        this.scrollIntoView()
        const cellMatrix = this.grid.props.cellMatrix
        this.grid.setState({ selectedRange: cellMatrix.getRange(this.grid.state.focusedLocation, { row: cellMatrix.last.row, col: location.col }) })
    }

    private updateRowSelection(cell: Location) {
        this.scrollIntoView()
        const cellMatrix = this.grid.props.cellMatrix
        this.grid.setState({ selectedRange: cellMatrix.getRange(this.grid.state.focusedLocation, { row: cell.row, col: cellMatrix.last.col }) })
    }

    private updateCellSelection() {
        this.scrollIntoView()
        const cellMatrix = this.grid.props.cellMatrix;
        const cellUnderCursor = this.grid.getLocationOnScreen(this.clientX, this.clientY)
        this.grid.setState({ selectedRange: cellMatrix.getRange(cellUnderCursor, this.grid.state.focusedLocation) })
    }

    // TODO not autoscroll behavior?
    private scrollIntoView() {
        const cellMatrix = this.grid.props.cellMatrix;
        if (this.isCursorOnFixedPaneBorder('horizontal')) {
            if (this.isSelectionFixedHorizontally() == 'left')
                this.grid.gridElement.scrollLeft = 0
            else if (this.isSelectionFixedHorizontally() == 'right')
                this.grid.gridElement.scrollLeft = cellMatrix.frozenRightRange.cols[0].left
        }
        if (this.isCursorOnFixedPaneBorder('vertical')) {
            if (this.isSelectionFixedVertically() == 'top')
                this.grid.gridElement.scrollTop = 0
            else if (this.isSelectionFixedVertically() == 'bottom')
                this.grid.gridElement.scrollTop = cellMatrix.frozenBottomRange.rows[0].top
        }
    }

    // TODO returns of is- methods should be boolean
    // TOOD default return missing
    private isSelectionFixedVertically(): 'top' | 'bottom' | 'default' {
        const selectedRange = this.grid.state.selectedRange
        const matrix = this.grid.props.cellMatrix
        if (matrix.frozenTopRange && matrix.frozenTopRange.containsRange(selectedRange)) return 'top'
        if (matrix.frozenBottomRange && matrix.frozenBottomRange.containsRange(selectedRange)) return 'bottom'
        return 'default'
    }


    // TODO returns of is- methods should be boolean
    // TOOD default return missing
    private isSelectionFixedHorizontally(): 'left' | 'right' | 'default' {
        const selectedRange = this.grid.state.selectedRange
        const matrix = this.grid.props.cellMatrix
        if (matrix.frozenLeftRange && matrix.frozenLeftRange.containsRange(selectedRange)) return 'left'
        if (matrix.frozenRightRange && matrix.frozenRightRange.containsRange(selectedRange)) return 'right'
        return 'default'
    }

    private isCursorOnFixedPaneBorder(orientation: Orientation) {
        const rect = this.grid.gridElement.getBoundingClientRect()
        const cellMatrix = this.grid.props.cellMatrix
        if (orientation == 'horizontal') {
            if (this.clientX >= cellMatrix.scrollableRange.cols[0].left + rect.left && this.clientX <= cellMatrix.scrollableRange.cols[0].left + rect.left + 20) return true
            if (this.clientX <= this.grid.gridElement.clientWidth - cellMatrix.frozenRightRange.width && this.clientX >= this.grid.gridElement.clientWidth - cellMatrix.frozenRightRange.width - 20) return true
        } else {
            if (this.clientY >= cellMatrix.scrollableRange.rows[0].top + rect.top && this.clientY <= cellMatrix.scrollableRange.rows[0].top + rect.top + 20) return true
            if (this.clientY <= this.grid.gridElement.clientHeight - cellMatrix.frozenBottomRange.height + rect.top && this.clientY >= this.grid.gridElement.clientHeight - cellMatrix.frozenBottomRange.height + rect.top - 20) return true
        }
        return false
    }

    dispose = () => {
        this.inner.dispose()
        window.removeEventListener('mousemove', this.mouseMoveHandler)
        window.removeEventListener('mouseup', this.mouseUpHandler)
        this.grid.gridElement.removeEventListener('scroll', this.gridScrollHandler)
    }
}