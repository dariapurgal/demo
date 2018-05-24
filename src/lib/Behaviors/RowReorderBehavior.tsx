import * as React from 'react'
import { Grid } from '../Grid'
import { Row } from '../Model'
import { DelegateBehavior } from './Behavior'
import { AutoScrollBehavior } from './AutoScrollBehavior'
import { BasicGridBehavior } from './BasicGridBehavior'

export class RowReorderBehavior extends DelegateBehavior {
    private mouseMoveHandler = this.handleMouseMove.bind(this)
    private mouseUpHandler = this.handleMouseUp.bind(this)
    private rowOnScreen: Row
    private mouseOffset: number
    private target: Row[]

    constructor(event: React.MouseEvent<HTMLDivElement>, grid: Grid) {
        super(new AutoScrollBehavior(new BasicGridBehavior(grid), 'vertical'))
        this.target = this.grid.props.cellMatrix.rows.filter(r => r.idx < this.grid.state.selectedRange.rows[0].idx || r.idx > this.grid.state.selectedRange.rows[this.grid.state.selectedRange.rows.length - 1].idx)
        this.mouseOffset = event.clientY - this.grid.state.selectedRange.first.row.top + this.grid.gridElement.scrollTop
        window.addEventListener('mousemove', this.mouseMoveHandler)
        window.addEventListener('mouseup', this.mouseUpHandler)
    }

    private handleMouseMove(event: MouseEvent) {
        const row = this.grid.getRowOnScreen(event.clientY)
        if (row && row != this.rowOnScreen)
            this.handleMouseEnterOnRow(row)
        const mousePosition = event.clientY + this.grid.gridElement.scrollTop
        this.grid.setState({ shadowPosition: mousePosition - this.mouseOffset, shadowOrientation: 'horizontal' })
    }

    private handleMouseUp() {
        const selectedRows = this.grid.state.selectedRange.rows
        const cellMatrix = this.grid.props.cellMatrix
        if (!this.rowOnScreen)
            this.grid.setState({ linePosition: undefined, shadowPosition: undefined })
        else {
            const positionChange = (this.rowOnScreen.idx > selectedRows[0].idx) ? this.rowOnScreen.idx - selectedRows[selectedRows.length - 1].idx : this.rowOnScreen.idx - selectedRows[0].idx
            this.grid.props.onRowsReordered(selectedRows[0].idx, selectedRows.length, positionChange)
            const cell = this.grid.props.cellMatrix.getLocation(this.grid.state.selectedRange.first.row.idx + positionChange, this.grid.state.focusedLocation.col.idx)
            this.grid.setState({
                focusedLocation: cell, isFocusedCellInEditMode: false,
                linePosition: undefined, shadowPosition: undefined,
                selectedRange: cellMatrix.getRange(
                    cellMatrix.getLocation(selectedRows[0].idx + positionChange, 0),
                    cellMatrix.getLocation(selectedRows[selectedRows.length - 1].idx + positionChange, cellMatrix.cols.length - 1)
                )
            })
        }
        this.grid.setState({ linePosition: undefined, shadowPosition: undefined })
        this.grid.resetToDefaultBehavior()
        window.removeEventListener('mousemove', this.mouseMoveHandler)
        window.removeEventListener('mouseup', this.mouseUpHandler)
    }

    private handleMouseEnterOnRow(row: Row) {
        const isTargetRow = (row: Row) => { return this.target.some(r => r == row) }
        const isSelectedRow = (row: Row) => { return this.grid.state.selectedRange.rows.some(r => r == row) }
        const areRowsMovingDown = () => { return this.grid.state.selectedRange.first.row.idx < this.rowOnScreen.idx }
        this.rowOnScreen = isTargetRow(row) ? row : isSelectedRow(row) ? undefined : this.rowOnScreen
        const linePosition = (this.rowOnScreen) ? areRowsMovingDown() ? this.rowOnScreen.top + this.rowOnScreen.height : this.rowOnScreen.top : undefined
        this.grid.setState({ linePosition: linePosition, lineOrientation: 'horizontal' })
    }
}