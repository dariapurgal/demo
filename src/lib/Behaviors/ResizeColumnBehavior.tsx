import { Grid } from '../Grid'
import { Column } from '../Model'
import { DelegateBehavior } from './Behavior'
import { BasicGridBehavior } from './BasicGridBehavior'


export class ResizeColumnBehavior extends DelegateBehavior {
    private mouseMoveHandler = this.handleMouseMove.bind(this)
    private mouseUpHandler = this.handleMouseUp.bind(this)
    private minColumnWidth: number = 5

    constructor(grid: Grid, private resizedColumn: Column) {
        super(new BasicGridBehavior(grid))
        this.grid.setState({ linePosition: resizedColumn.left + resizedColumn.width, lineOrientation: 'vertical' })
        window.addEventListener('mousemove', this.mouseMoveHandler)
        window.addEventListener('mouseup', this.mouseUpHandler)
    }

    private handleMouseMove(event: MouseEvent) {
        if (event.clientX >= this.grid.gridElement.clientWidth - this.grid.props.cellMatrix.frozenRightRange.width) {
            const paneRightMousePosition = event.clientX - (this.grid.gridElement.clientWidth - this.grid.props.cellMatrix.frozenRightRange.width)
            const mousePosition = (paneRightMousePosition > this.resizedColumn.left + this.minColumnWidth) ? event.clientX : this.grid.gridElement.clientWidth - (this.grid.props.cellMatrix.frozenRightRange.width + this.resizedColumn.left + this.minColumnWidth)
            this.grid.setState({ linePosition: mousePosition, lineOrientation: 'vertical' })
        } else {
            const mousePosition = (event.clientX + this.grid.gridElement.scrollLeft > this.resizedColumn.left + this.minColumnWidth) ? event.clientX + this.grid.gridElement.scrollLeft : this.resizedColumn.left + this.minColumnWidth
            this.grid.setState({ linePosition: mousePosition, lineOrientation: 'vertical' })
        }
    }

    private handleMouseUp(event: MouseEvent) {
        const mousePosition = (event.clientX + this.grid.gridElement.scrollLeft > this.resizedColumn.left + this.minColumnWidth) ? event.clientX + this.grid.gridElement.scrollLeft : this.resizedColumn.left + this.minColumnWidth
        const newWidth = mousePosition - this.resizedColumn.left
        this.grid.resetToDefaultBehavior()
        this.grid.setState({ linePosition: undefined })
        this.grid.props.onColResize(this.resizedColumn.idx, newWidth)
        window.removeEventListener('mousemove', this.mouseMoveHandler)
        window.removeEventListener('mouseup', this.mouseUpHandler)
    }
}



