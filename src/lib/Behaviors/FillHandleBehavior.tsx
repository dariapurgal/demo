import * as React from 'react'
import { Grid } from '../Grid'
import { Location, Range, Direction } from '../Model'
import { DelegateBehavior } from './Behavior'
import { AutoScrollBehavior } from './AutoScrollBehavior'
import { BasicGridBehavior } from './BasicGridBehavior'

export class FillHandleBehavior extends DelegateBehavior {
    private currentLocation: Location = null
    private mouseMoveHandler = this.handleMouseMove.bind(this)
    private mouseUpHandler = this.handleMouseUp.bind(this)
    private fillDirection: Direction
    private fillRange: Range

    constructor(grid: Grid) {
        super(new AutoScrollBehavior(new BasicGridBehavior(grid)))
        window.addEventListener('mousemove', this.mouseMoveHandler)
        window.addEventListener('mouseup', this.mouseUpHandler)
    }

    handleMouseMove(event: MouseEvent) {
        const selectedRange = this.grid.state.selectedRange
        const cellMatrix = this.grid.props.cellMatrix
        const location = this.grid.getLocationOnScreen(event.clientX, event.clientY)
        if (this.currentLocation === location) return
        this.currentLocation = location

        let diffrences: { direction: Direction, value: number }[] = []
        diffrences.push({ direction: undefined, value: 0 })
        diffrences.push({ direction: 'up', value: (location.row.idx < selectedRange.first.row.idx) ? selectedRange.first.row.idx - location.row.idx : 0 })
        diffrences.push({ direction: 'down', value: (location.row.idx > selectedRange.last.row.idx) ? location.row.idx - selectedRange.last.row.idx : 0 })
        diffrences.push({ direction: 'left', value: (location.col.idx < selectedRange.first.col.idx) ? selectedRange.first.col.idx - location.col.idx : 0 })
        diffrences.push({ direction: 'right', value: (location.col.idx > selectedRange.last.col.idx) ? location.col.idx - selectedRange.last.col.idx : 0 })
        this.fillDirection = diffrences.reduce((prev, current) => (prev.value >= current.value) ? prev : current).direction
        switch (this.fillDirection) {
            case 'right':
                this.fillRange = cellMatrix.getRange(
                    cellMatrix.getLocation(selectedRange.first.row.idx, cellMatrix.last.col.idx < selectedRange.last.col.idx + 1 ? cellMatrix.last.col.idx : selectedRange.last.col.idx + 1),
                    cellMatrix.getLocation(this.grid.state.selectedRange.last.row.idx, this.currentLocation.col.idx))
                break
            case 'left':
                this.fillRange = cellMatrix.getRange(
                    cellMatrix.getLocation(selectedRange.first.row.idx, this.currentLocation.col.idx),
                    cellMatrix.getLocation(selectedRange.last.row.idx, cellMatrix.first.col.idx > selectedRange.first.col.idx - 1 ? cellMatrix.first.col.idx : selectedRange.first.col.idx - 1))
                break

            case 'up':
                this.fillRange = cellMatrix.getRange(
                    cellMatrix.getLocation(this.currentLocation.row.idx, selectedRange.first.col.idx),
                    cellMatrix.getLocation(cellMatrix.first.row.idx > selectedRange.first.row.idx - 1 ? cellMatrix.first.row.idx : selectedRange.first.row.idx - 1, selectedRange.last.col.idx))
                break

            case 'down':
                this.fillRange = cellMatrix.getRange(
                    cellMatrix.getLocation(cellMatrix.last.row.idx < selectedRange.last.row.idx + 1 ? cellMatrix.last.row.idx : selectedRange.last.row.idx + 1, selectedRange.first.col.idx),
                    cellMatrix.getLocation(this.currentLocation.row.idx, selectedRange.last.col.idx))
                break
        }
        this.grid.forceUpdate()

    }

    handleMouseUp(event: MouseEvent) {
        const selectedRange = this.grid.state.selectedRange
        const cellMatrix = this.grid.props.cellMatrix
        let values: any[]
        switch (this.fillDirection) {
            case 'right':
                values = selectedRange.rows.map(row => this.grid.props.cellMatrix.getCell({ row, col: selectedRange.last.col }).value)
                this.fillRange.rows.forEach((row, i) => this.fillRange.cols.forEach(col => cellMatrix.getCell({ row, col }).trySetValue(values[i].value)))
                this.grid.setState({ selectedRange: cellMatrix.getRange(selectedRange.first, { row: selectedRange.last.row, col: this.currentLocation.col }) })
                this.grid.commitChanges()
                break
            case 'left':
                values = selectedRange.rows.map(row => this.grid.props.cellMatrix.getCell({ row, col: selectedRange.first.col }))
                this.fillRange.rows.forEach((row, i) => this.fillRange.cols.forEach(col => cellMatrix.getCell({ row, col }).trySetValue(values[i].value)))
                this.grid.setState({ selectedRange: cellMatrix.getRange(selectedRange.last, { row: selectedRange.first.row, col: this.currentLocation.col }) })
                this.grid.commitChanges()
                break
            case 'up':
                values = selectedRange.cols.map(col => this.grid.props.cellMatrix.getCell({ row: selectedRange.first.row, col }))
                this.fillRange.rows.forEach(row => this.fillRange.cols.forEach((col, i) => cellMatrix.getCell({ row, col }).trySetValue(values[i].value)))
                this.grid.setState({ selectedRange: cellMatrix.getRange(selectedRange.last, { row: this.currentLocation.row, col: selectedRange.first.col }) })
                this.grid.commitChanges()
                break
            case 'down':
                values = selectedRange.cols.map(col => this.grid.props.cellMatrix.getCell({ row: selectedRange.last.row, col }))
                this.fillRange.rows.forEach(row => this.fillRange.cols.forEach((col, i) => cellMatrix.getCell({ row, col }).trySetValue(values[i].value)))
                this.grid.setState({ selectedRange: cellMatrix.getRange(selectedRange.first, { row: this.currentLocation.row, col: selectedRange.last.col }) })
                this.grid.commitChanges()
                break
        }
        window.removeEventListener('mousemove', this.mouseMoveHandler)
        window.removeEventListener('mouseup', this.mouseUpHandler)
        this.grid.resetToDefaultBehavior()
    }

    renderPanePart = (pane: Range): React.ReactNode => {
        return <>
            {this.inner.renderPanePart(pane)}
            {this.fillDirection && this.grid.renderPartialAreaForPane(this.fillRange, pane, {
                backgroundColor: '',
                borderTop: this.fillDirection === 'down' ? '0px' : '1px dashed #616161',
                borderBottom: this.fillDirection === 'up' ? '0px' : '1px dashed #616161',
                borderLeft: this.fillDirection === 'right' ? '0px' : '1px dashed #616161',
                borderRight: this.fillDirection === 'left' ? '0px' : '1px dashed #616161'
            })}
        </>
    }
}



