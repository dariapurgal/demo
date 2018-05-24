import * as React from 'react'
import { DelegateBehavior, Behavior } from './Behavior'
import { Orientation } from '../Model'

export class AutoScrollBehavior extends DelegateBehavior {
    private mouseMoveHandler = this.handleMouseMove.bind(this)
    private scrollByTop = 0
    private scrollByLeft = 0
    private timer = 0

    constructor(inner: Behavior, private direction: Orientation | 'both' = 'both') {
        super(inner)
        window.addEventListener('mousemove', this.mouseMoveHandler)
    }

    dispose = () => {
        window.removeEventListener('mousemove', this.mouseMoveHandler)
        window.clearInterval(this.timer)
    }

    private handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const scrollMargin = 25
        const gridRect = this.grid.gridElement.getBoundingClientRect()
        const leftScrollBorder = gridRect.left + this.grid.props.cellMatrix.frozenLeftRange.width + scrollMargin
        const rightScrollBorder = this.grid.gridElement.clientWidth - this.grid.props.cellMatrix.frozenRightRange.width - scrollMargin
        const topScrollBorder = gridRect.top + this.grid.props.cellMatrix.frozenTopRange.height + scrollMargin
        const bottomScrollBorder = this.grid.gridElement.clientHeight - this.grid.props.cellMatrix.frozenBottomRange.height - scrollMargin
        this.scrollByLeft = this.direction === 'vertical' ? 0 :
            (event.clientX < leftScrollBorder) ? event.clientX - leftScrollBorder :
                (event.clientX > rightScrollBorder) ? event.clientX - rightScrollBorder : 0
        this.scrollByTop = this.direction === 'horizontal' ? 0 :
            (event.clientY < topScrollBorder) ? event.clientY - topScrollBorder :
                (event.clientY > bottomScrollBorder) ? event.clientY - bottomScrollBorder : 0
        if (this.direction === 'both') {
            if (this.isSelectionFixedVertically())
                this.scrollByTop = 0
            if (this.isSelectionFixedHorizontally())
                this.scrollByLeft = 0
        }

        if (this.timer === 0 && this.scrollByLeft !== 0 || this.scrollByTop !== 0) {
            window.clearInterval(this.timer)
            this.timer = window.setInterval(() => {
                const nextCol = (this.scrollByLeft !== 0) ? this.grid.props.cellMatrix.cols.find(c => c.left >= ((this.scrollByLeft > 0) ? rightScrollBorder : (leftScrollBorder >= c.width) ? -leftScrollBorder : -c.width) + this.scrollByLeft + this.grid.gridElement.scrollLeft) : undefined
                const nextRow = (this.scrollByTop !== 0) ? this.grid.props.cellMatrix.rows.find(r => r.top >= ((this.scrollByTop > 0) ? bottomScrollBorder : -topScrollBorder) + this.scrollByTop + this.grid.gridElement.scrollTop) : undefined
                const scrollToCol = nextCol || ((nextRow) ? this.grid.getColumnOnScreen(event.clientX) : undefined)
                const scrollToRow = nextRow || ((nextCol) ? this.grid.getRowOnScreen(event.clientY) : undefined)
                if (scrollToCol && scrollToRow)
                    this.grid.scrollIntoView(this.grid.props.cellMatrix.getLocation(scrollToRow.idx, scrollToCol.idx), 'smooth')
            }, 300)
        }
        else if (this.timer !== 0 && this.scrollByLeft === 0 && this.scrollByTop === 0) {
            window.clearInterval(this.timer)
            this.timer = 0
        }

    }

    private isSelectionFixedVertically() {
        const matrix = this.grid.props.cellMatrix
        return (matrix.frozenTopRange && matrix.frozenTopRange.containsRange(this.grid.state.selectedRange)) ||
            (matrix.frozenBottomRange && matrix.frozenBottomRange.containsRange(this.grid.state.selectedRange))
    }

    private isSelectionFixedHorizontally() {
        const matrix = this.grid.props.cellMatrix
        return (matrix.frozenLeftRange && matrix.frozenLeftRange.containsRange(this.grid.state.selectedRange)) ||
            (matrix.frozenRightRange && matrix.frozenRightRange.containsRange(this.grid.state.selectedRange))
    }
} 