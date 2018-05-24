import * as React from 'react'
import { Grid } from '../Grid'
import { Column } from '../Model'
import { AutoScrollBehavior } from './AutoScrollBehavior'
import { DelegateBehavior } from './Behavior'
import { BasicGridBehavior } from './BasicGridBehavior'


export class ColReorderBehavior extends DelegateBehavior {
    private mouseMoveHandler = this.handleMouseMove.bind(this)
    private mouseUpHandler = this.handleMouseUp.bind(this)
    private colOnScreen: Column
    private mouseOffset: number
    private target: Column[]

    constructor(event: React.MouseEvent<HTMLDivElement>, grid: Grid) {
        super(new AutoScrollBehavior(new BasicGridBehavior(grid), 'horizontal'))
        this.target = this.grid.props.cellMatrix.cols.filter(c => c.idx < this.grid.state.selectedRange.cols[0].idx || c.idx > this.grid.state.selectedRange.cols[this.grid.state.selectedRange.cols.length - 1].idx)
        this.mouseOffset = event.clientX - this.grid.state.selectedRange.first.col.left + this.grid.gridElement.scrollLeft
        window.addEventListener('mousemove', this.mouseMoveHandler)
        window.addEventListener('mouseup', this.mouseUpHandler)
    }

    private handleMouseMove(event: MouseEvent) {
        const colUnderCursor = this.grid.getColumnOnScreen(event.clientX)
        if (colUnderCursor && colUnderCursor != this.colOnScreen)
            this.handleMouseEnterOnCol(colUnderCursor)
        const mousePosition = event.clientX + this.grid.gridElement.scrollLeft
        this.grid.setState({ shadowPosition: mousePosition - this.mouseOffset, shadowOrientation: 'vertical' })
    }

    private handleMouseUp() {
        const selectedCols = this.grid.state.selectedRange.cols
        const cellMatrix = this.grid.props.cellMatrix
        const lastRowIdx = cellMatrix.rows.length - 1
        if (!this.colOnScreen)
            this.grid.setState({ linePosition: undefined, shadowPosition: undefined })
        else {
            const positionChange = (this.colOnScreen.idx > selectedCols[0].idx) ? this.colOnScreen.idx - selectedCols[selectedCols.length - 1].idx : this.colOnScreen.idx - selectedCols[0].idx
            this.grid.props.onColumnsReordered(selectedCols[0].idx, selectedCols.length, positionChange)
            const cell = this.grid.props.cellMatrix.getLocation(this.grid.state.selectedRange.first.row.idx, this.grid.state.focusedLocation.col.idx + positionChange)
            this.grid.setState({
                focusedLocation: cell, isFocusedCellInEditMode: false,
                linePosition: undefined, shadowPosition: undefined,
                selectedRange: cellMatrix.getRange(
                    cellMatrix.getLocation(0, selectedCols[0].idx + positionChange),
                    cellMatrix.getLocation(lastRowIdx, selectedCols[selectedCols.length - 1].idx + positionChange)
                )
            })
        }
        this.grid.resetToDefaultBehavior()
        window.removeEventListener('mousemove', this.mouseMoveHandler)
        window.removeEventListener('mouseup', this.mouseUpHandler)
    }

    private handleMouseEnterOnCol(col: Column) {
        const isTargetCol = (col: Column) => { return this.target.some(c => c == col) }
        const isSelectedCol = (col: Column) => { return this.grid.state.selectedRange.cols.some(c => c == col) }
        const areColumnsMovingRight = () => { return this.grid.state.selectedRange.first.col.idx < this.colOnScreen.idx }
        this.colOnScreen = isTargetCol(col) ? col : isSelectedCol(col) ? undefined : this.colOnScreen
        const linePosition = (this.colOnScreen) ? areColumnsMovingRight() ? this.colOnScreen.left + this.colOnScreen.width : this.colOnScreen.left : undefined
        this.grid.setState({ linePosition: linePosition, lineOrientation: 'vertical' })
    }
}