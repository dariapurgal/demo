import * as React from 'react'
import * as smoothscroll from 'smoothscroll-polyfill'
import { Behavior } from './Behaviors/Behavior'
import { DefaultGridBehavior } from './Behaviors/DefaultGridBehavior'
import { CellSelectionBehavior } from './Behaviors/CellSelectionBehavior'
import { zIndex } from './Constants'
import { Location, Row, Column, Range, Orientation } from './Model'
import { CellMatrix } from './CellMatrix'

export interface GridProps {
    cellMatrix: CellMatrix
    style?: React.CSSProperties
    onRowsReordered?: (firstReorderedRowIdx: number, reorderedRowsCount: number, positionChange: number) => void
    onColumnsReordered?: (firstReorderedColumnIdx: number, reoderderedColumnCount: number, positionChange: number) => void
    onColResize?: (resizedColumnIdx: number, newColWidth: number) => void
    onValuesChanged?: () => void
}

export class GridState {
    currentBehavior: Behavior
    selectedRange: Range
    focusedLocation: Location
    isFocusedCellInEditMode: boolean
    linePosition: number
    lineOrientation: Orientation
    shadowPosition: number
    shadowOrientation: Orientation
    visibleRange: Range
    scrollAreaWidth: number
    scrollAreaHeight: number
    minScrollTop: number
    maxScrollTop: number
    minScrollLeft: number
    maxScrollLeft: number
}

interface Borders {
    top?: boolean
    left?: boolean
    bottom?: boolean
    right?: boolean
}

export class Grid extends React.Component<GridProps, GridState> {
    gridElement: HTMLDivElement
    hiddenFocusElement: HTMLDivElement
    state = new GridState()
    private windowResizeHandler = () => this.recalcVisibleCells()

    commitChanges() {
        this.props.onValuesChanged && this.props.onValuesChanged()
    }

    componentWillMount() {
        this.state.currentBehavior = new DefaultGridBehavior(this)
        window.addEventListener('resize', this.windowResizeHandler)
    }

    componentDidMount() {
        this.recalcVisibleCells()
        smoothscroll.polyfill()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.windowResizeHandler)
    }

    focusLocation(location: Location, resetSelection = true) {
        this.scrollIntoView(location)
        const cellMatrix = this.props.cellMatrix
        if (resetSelection)
            this.setState({ focusedLocation: location, isFocusedCellInEditMode: false, selectedRange: cellMatrix.getRange(location, location) })
        else
            this.setState({ focusedLocation: location, isFocusedCellInEditMode: false })
    }

    scrollIntoView(cell: Location, behavior: 'smooth' | 'auto' | 'instant' = 'instant') {
        const col = cell.col
        const row = cell.row
        const cellMatrix = this.props.cellMatrix
        const rightScrollBorder = (this.gridElement.clientWidth - cellMatrix.frozenRightRange.width)
        const bottomScrollBorder = (this.gridElement.clientHeight - cellMatrix.frozenBottomRange.height)
        let left = this.gridElement.scrollLeft
        let top = this.gridElement.scrollTop
        if ((col.left >= cellMatrix.frozenLeftRange.width) && (col.left - this.gridElement.scrollLeft) < cellMatrix.frozenLeftRange.width)
            left = col.left - cellMatrix.frozenLeftRange.width - 1
        else if ((col.left + col.width) <= (cellMatrix.frozenLeftRange.width + cellMatrix.scrollableRange.width) && (col.left + col.width - this.gridElement.scrollLeft > rightScrollBorder))
            if (!(cell.col.width > rightScrollBorder - cellMatrix.frozenLeftRange.width))
                left = (col.left + col.width) - rightScrollBorder
            else
                left = col.left - cellMatrix.frozenLeftRange.width - 1
        if ((row.top >= cellMatrix.frozenTopRange.height) && (row.top - this.gridElement.scrollTop) < cellMatrix.frozenTopRange.height)
            top = row.top - cellMatrix.frozenTopRange.height - 1
        else if ((row.top + row.height) <= (cellMatrix.frozenTopRange.height + cellMatrix.scrollableRange.height) && (row.top + row.height - this.gridElement.scrollTop > bottomScrollBorder))
            top = (row.top + row.height) - bottomScrollBorder

        this.gridElement.scrollTo({ top: top, left: left, behavior: behavior })
    }

    getColumnOnScreen(clientX: number): Column {
        // TODO wrong calculation because left is on pane now. add pane offset
        const rect = this.gridElement.getBoundingClientRect()
        const frozenLeftColsWidth = this.props.cellMatrix.frozenLeftRange.width
        const frozenRightColsWidth = this.props.cellMatrix.frozenRightRange.width
        const contentX = clientX - rect.left + (frozenRightColsWidth && (clientX > this.gridElement.clientWidth - frozenRightColsWidth) ? this.props.cellMatrix.frozenRightRange.cols[0].left - (this.gridElement.clientWidth - frozenRightColsWidth) : (clientX > rect.left + frozenLeftColsWidth) ? this.gridElement.scrollLeft : 0)
        const cols = this.props.cellMatrix.cols
        return cols.find(col => col.left <= contentX && col.left + col.width >= contentX) || ((contentX < 0) ? cols[0] : cols[cols.length - 1])
    }

    getRowOnScreen(clientY: number): Row {
        // TODO wrong calculation because top is on pane now. add pane offset
        const rect = this.gridElement.getBoundingClientRect()
        const frozenTopRowsHeight = this.props.cellMatrix.frozenTopRange.height
        const frozenBottomRowsHeight = this.props.cellMatrix.frozenBottomRange.height
        const contentY = clientY - rect.top + (frozenBottomRowsHeight && (clientY > this.gridElement.clientHeight - frozenBottomRowsHeight) ? this.props.cellMatrix.frozenBottomRange.rows[0].top - (this.gridElement.clientHeight - frozenBottomRowsHeight) : (clientY > rect.top + frozenTopRowsHeight) ? this.gridElement.scrollTop : 0)
        const rows = this.props.cellMatrix.rows
        return rows.find(row => row.top <= contentY && row.top + row.height >= contentY) || ((contentY < 0) ? rows[0] : rows[rows.length - 1])
    }

    getLocationOnScreen(clientX: number, clientY: number): Location {
        const row = this.getRowOnScreen(clientY)
        const col = this.getColumnOnScreen(clientX)
        return { row, col }
    }

    private handleScroll() {
        const scrollTop = this.gridElement.scrollTop
        const scrollLeft = this.gridElement.scrollLeft
        if (scrollTop < this.state.minScrollTop || scrollTop > this.state.maxScrollTop ||
            scrollLeft < this.state.minScrollLeft || scrollLeft > this.state.maxScrollLeft) {
            this.recalcVisibleCells()
        }
    }

    private recalcVisibleCells() {
        const scrollTop = this.gridElement.scrollTop
        const scrollLeft = this.gridElement.scrollLeft
        const scrollAreaWidth = this.gridElement.clientWidth - this.props.cellMatrix.frozenLeftRange.width - this.props.cellMatrix.frozenRightRange.width
        const scrollAreaHeight = this.gridElement.clientHeight - this.props.cellMatrix.frozenTopRange.height - this.props.cellMatrix.frozenBottomRange.height
        const visibleCols = this.props.cellMatrix.scrollableRange.cols.filter(col => col.right >= scrollLeft - 1000 && col.left <= scrollLeft + scrollAreaWidth + 1000)
        const visibleRows = this.props.cellMatrix.scrollableRange.rows.filter(row => row.bottom >= scrollTop - 1000 && row.top <= scrollTop + scrollAreaHeight + 1000)
        const visibleRange = new Range(visibleCols, visibleRows)
        this.setState({
            scrollAreaWidth, scrollAreaHeight,
            minScrollLeft: visibleRange.first.col.left + 500,
            maxScrollLeft: visibleRange.last.col.right - scrollAreaWidth - 500,
            minScrollTop: visibleRows.length > 0 ? visibleRange.first.row.top + 500 : 0,
            maxScrollTop: visibleCols.length > 0 ? visibleRange.last.row.bottom - scrollAreaHeight - 500 : 0,
            visibleRange: visibleRange,
        })
    }

    public renderPartialAreaForPane(area: Range, pane: Range, style: React.CSSProperties) {

        if (!area || (area.cols.length === 1 && area.rows.length === 1)
            || (area.first.col.idx > pane.last.col.idx)
            || (area.last.col.idx < pane.first.col.idx)
            || (area.first.row.idx > pane.last.row.idx)
            || (area.last.row.idx < pane.first.row.idx))
            return
        const isAdjecentToFrozenTop = (area.first.row.idx <= pane.first.row.idx)
        const isAdjecentToFrozenLeft = (area.first.col.idx <= pane.first.col.idx)
        const left = (isAdjecentToFrozenLeft) ? pane.first.col.left : area.first.col.left
        const width = ((area.last.col.idx > pane.last.col.idx) ? pane.last.col.left + pane.last.col.width : area.last.col.left + area.last.col.width) - left
        const top = (isAdjecentToFrozenTop) ? pane.first.row.top : area.first.row.top
        const height = ((area.last.row.idx > pane.last.row.idx) ? pane.last.row.top + pane.last.row.height : area.last.row.top + area.last.row.height) - top
        const isBorderTop = (area.first.row.idx >= pane.first.row.idx)
        const isBorderBottom = (area.last.row.idx <= pane.last.row.idx)
        const isBorderRight = (area.last.col.idx <= pane.last.col.idx)
        const isBorderLeft = (area.first.col.idx >= pane.first.col.idx)
        return <div style={{
            ...style,
            borderTop: isBorderTop ? style.border : '',
            borderBottom: isBorderBottom ? (style.borderBottom) ? style.borderBottom : style.border : '',
            borderRight: isBorderRight ? (style.borderRight) ? style.borderRight : style.border : '',
            borderLeft: isBorderLeft ? style.border : '',
            position: 'absolute',
            top: isAdjecentToFrozenTop ? top : top - 1,
            left: isAdjecentToFrozenLeft ? left : left - 1,
            width: isBorderLeft && isAdjecentToFrozenLeft ? width - 2 : width - 1,
            height: isBorderTop && isAdjecentToFrozenTop ? height - 2 : height - 1,
            pointerEvents: 'none'
        }} />
    }

    private renderLine() {
        const isVertical = this.state.lineOrientation === 'vertical'
        return <div style={{
            position: 'absolute',
            background: '#808080',
            top: isVertical ? 0 : this.state.linePosition,
            left: isVertical ? this.state.linePosition : 0,
            width: isVertical ? 2 : this.props.cellMatrix.contentWidth,
            height: isVertical ? this.props.cellMatrix.contentHeight : 2,
            zIndex: zIndex.line,
        }} />
    }

    private renderShadow() {
        const isVertical = this.state.shadowOrientation === 'vertical'
        return <div style={{
            position: 'absolute',
            background: '#666',
            cursor: '-webkit-grabbing',
            opacity: 0.3,
            top: isVertical ? 0 : this.state.shadowPosition,
            left: isVertical ? this.state.shadowPosition : 0,
            width: isVertical ? this.state.selectedRange.width : this.props.cellMatrix.contentWidth,
            height: isVertical ? this.props.cellMatrix.contentHeight : this.state.selectedRange.height,
            zIndex: zIndex.colReorderShadow,
        }} />
    }

    private renderCell(location: Location, borders: Borders) {
        const cell = this.props.cellMatrix.getCell(location)
        const isFocused = this.state.focusedLocation && (this.state.focusedLocation === location)
        const isSelected = this.state.selectedRange && this.state.selectedRange.contains(location)
        const dynamicStyle: React.CSSProperties = isFocused ? {
            //marginLeft: isFirstCol ? 0 : -1, marginTop: isFirstRow ? 0 : -1,
            //paddingLeft: isFirstCol ? 0 : 1, paddingTop: isFirstRow ? 0 : 1,
            paddingLeft: 0,
            paddingRight: 0,
            border: 'solid 2px #3579f8'
        } : {
                paddingLeft: 2, paddingRight: 2,
                borderTop: borders.top ? 'solid 1px #CCC' : '',
                borderLeft: borders.left ? 'solid 1px #CCC' : '',
                borderBottom: borders.bottom ? 'solid 1px #CCC' : borders.bottom === undefined ? 'solid 1px #E0E0E0' : '',
                borderRight: borders.right ? 'solid 1px #CCC' : borders.right === undefined ? 'solid 1px #E0E0E0' : '',
            }

        return cell.render({
            ...cell,
            grid: this,
            key: location.row.idx + '-' + location.col.idx,
            isInEditMode: isFocused && this.state.isFocusedCellInEditMode,
            isSelected: isSelected,
            attributes: {
                style: {
                    boxSizing: 'border-box',
                    whiteSpace: 'nowrap',
                    position: 'absolute',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    left: location.col.left,
                    top: location.row.top,
                    width: location.col.width,
                    height: location.row.height,
                    ...dynamicStyle
                },
            }
        })
    }

    private renderColumnPane(style: React.CSSProperties, range: Range, borders: Borders): React.ReactNode {
        // TODO width wrong
        return (range.cols.length > 0) && <div style={{ width: range.width, height: range.height, ...style, background: 'white' }}>
            <div style={{ position: 'relative', width: range.width, height: range.height }}>
                {range.rows.map((row, ri) =>
                    range.cols.map((col, ci) => this.renderCell({ row, col }, {
                        top: borders.top && ri === 0, left: borders.left && ci === 0,
                        bottom: borders.bottom && ri === range.rows.length - 1,
                        right: borders.right && ci === range.cols.length - 1,
                    }))
                )}
                {this.renderPartialAreaForPane(this.state.selectedRange, range, { border: '1px solid #3579f8', backgroundColor: 'rgba(53, 121, 248, 0.1)' })}
                {this.state.currentBehavior.renderPanePart(range)}
            </div>
        </div >
    }

    private renderRowPane(style: React.CSSProperties, range: Range, borders: Borders): React.ReactNode {
        const matrix = this.props.cellMatrix
        return (range.rows.length > 0 &&
            <div style={{ width: matrix.frozenLeftRange.width + matrix.scrollableRange.width + matrix.frozenRightRange.width, height: range.height, background: 'white', display: 'flex', flexDirection: 'row', ...style }}>
                {matrix.frozenLeftRange.width > 0 && this.renderColumnPane({ left: 0, position: 'sticky', zIndex: zIndex.verticalPane }, matrix.frozenLeftRange.slice(range, 'rows'), { ...borders, right: true })}
                {this.state.visibleRange && this.renderColumnPane({}, range.slice(this.state.visibleRange, 'columns'), { ...borders })}
                {matrix.frozenRightRange.width > 0 && this.renderColumnPane({ right: 0, position: 'sticky', zIndex: zIndex.verticalPane }, matrix.frozenRightRange.slice(range, 'rows'), { ...borders, left: true })}
            </div>
        )
    }

    render() {
        const matrix = this.props.cellMatrix
        const disableUserSelectStyle: React.CSSProperties = {
            MozUserSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none'
        }
        return (
            <div ref={ref => { if (ref) this.gridElement = ref }} style={{ ...this.props.style, ...disableUserSelectStyle, overflow: 'auto' }} onScroll={_ => { this.handleScroll() }}>
                <div style={{ width: matrix.contentWidth, height: matrix.contentHeight, position: 'relative' }} onMouseDown={this.handleMouseDown.bind(this)} onDoubleClick={this.handleDoubleClick.bind(this)}>
                    {matrix.frozenTopRange.height > 0 && this.renderRowPane({ top: 0, position: 'sticky', zIndex: zIndex.horizontalPane }, matrix.frozenTopRange, { bottom: true })}
                    {matrix.scrollableRange.height > 0 && this.state.visibleRange && this.renderRowPane({ height: matrix.scrollableRange.height }, matrix.scrollableRange.slice(this.state.visibleRange, 'rows'), {})}
                    {matrix.frozenBottomRange.height > 0 && this.renderRowPane({ bottom: 0, position: 'sticky', zIndex: zIndex.horizontalPane }, matrix.frozenBottomRange, { top: true, bottom: false })}
                    {this.state.linePosition && this.renderLine()}
                    {this.state.shadowPosition && this.renderShadow()}
                    {this.state.currentBehavior.renderHiddenPart(<div contentEditable={true} style={{ position: 'fixed', width: 1, height: 1, opacity: 0 }} ref={ref => { if (ref) this.hiddenFocusElement = ref }} />)}
                </div>
            </div>
        )
    }

    private handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
        if (e.button == 2) {
            return
        } else {
            if (!e.shiftKey) {
                this.focusLocation(this.getLocationOnScreen(e.clientX, e.clientY))
            }
            this.changeBehavior(new CellSelectionBehavior(this, e, 'cell'))
        }

        e.preventDefault()
        e.stopPropagation()
    }

    private handleDoubleClick(e: MouseEvent) {
        const location: Location = this.getLocationOnScreen(e.clientX, e.clientY)
        // TODO will not work due to different reference , check if col and row have same ref
        if (this.state.focusedLocation === location) {
            this.setState({ isFocusedCellInEditMode: true })
        }
    }

    resetToDefaultBehavior() {
        this.changeBehavior(new DefaultGridBehavior(this))
    }

    changeBehavior(behavior: Behavior) {
        this.state.currentBehavior.dispose()
        this.setState({ currentBehavior: behavior })
        this.hiddenFocusElement.focus()
    }
}





