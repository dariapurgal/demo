import * as React from 'react'
import { Cell, Orientation, CellProps } from '../Model'
import { CellSelectionBehavior, ColReorderBehavior, RowReorderBehavior } from '../Behaviors'
import { zIndex } from '../Constants'

export interface HeaderCellProps extends CellProps {
    orientation: Orientation
}

export class HeaderCell extends React.Component<HeaderCellProps, {}> {
    static Create(orientation: Orientation, value: string, setValue: (value: any) => void): Cell {
        return {
            value,
            render: (cellProps) => <HeaderCell {...cellProps} orientation={orientation} />,
            trySetValue: (v) => { setValue(v); return true }
        }
    }

    handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
        const selRange = this.props.grid.state.selectedRange
        const cell = this.props.grid.getLocationOnScreen(e.clientX, e.clientY)
        if (selRange && selRange.contains(cell)) {
            if (this.props.orientation === 'horizontal')
                this.props.grid.changeBehavior(new ColReorderBehavior(e, this.props.grid))
            else
                this.props.grid.changeBehavior(new RowReorderBehavior(e, this.props.grid))

        } else {
            if (!e.shiftKey)
                this.props.grid.focusLocation(cell)
            if (this.props.orientation === 'horizontal') {
                this.props.grid.changeBehavior(new CellSelectionBehavior(this.props.grid, e, 'column'))
            }
            else
                this.props.grid.changeBehavior(new CellSelectionBehavior(this.props.grid, e, 'row'))
        }
        e.stopPropagation()
        e.preventDefault()
    }

    handleMouseClick(e: React.MouseEvent<HTMLDivElement>) {
        const location = this.props.grid.getLocationOnScreen(e.clientX, e.clientY)
        const cellMatrix = this.props.grid.props.cellMatrix
        if (!e.shiftKey) {
            if (this.props.orientation === 'horizontal') {
                this.props.grid.setState({ focusedLocation: location, selectedRange: cellMatrix.getRange(location, { row: cellMatrix.rows[cellMatrix.rows.length - 1], col: location.col }) })
            } else {
                this.props.grid.setState({ focusedLocation: location, selectedRange: cellMatrix.getRange(location, { row: location.row, col: cellMatrix.cols[cellMatrix.cols.length - 1] }) })
            }
        }
    }

    render() {
        return <div {...this.props.attributes, { style: { ...this.props.attributes.style, background: '#eee', cursor: this.props.isSelected ? '-webkit-grab' : 'default' } }} onMouseDown={e => this.handleMouseDown(e)} onClick={e => this.handleMouseClick(e)}>
            {this.props.isInEditMode && <input style={{ zIndex: zIndex.cellInput, width: this.props.attributes.style.width, height: this.props.attributes.style.height, border: 0, fontSize: 16, outline: 'none' }} ref={input => {
                if (input) {
                    input.focus()
                    input.setSelectionRange(this.props.value.length, this.props.value.length)
                }
            }} defaultValue={this.props.value} onChange={e => this.props.trySetValue(e.target.value)} />}
            {!this.props.isInEditMode && this.props.value}</div>
    }
}
