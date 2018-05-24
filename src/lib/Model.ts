import { Grid } from './Grid'

export type Orientation = 'horizontal' | 'vertical'

export type Direction = 'left' | 'right' | 'up' | 'down'

export interface Cell {
    value: any
    readonly trySetValue: (value: any) => boolean
    readonly render: (props: CellProps) => React.ReactNode
}

export interface Location {
    readonly row: Row
    readonly col: Column
}

export interface CellProps extends Cell {
    attributes: React.HTMLAttributes<HTMLDivElement>
    grid: Grid
    key: string
    isInEditMode: boolean
    isSelected: boolean
}

export interface Column {
    readonly idx: number
    readonly left: number
    readonly right: number
    readonly width: number
}

export interface Row {
    readonly idx: number
    readonly top: number
    readonly bottom: number
    readonly height: number
}

export class Range {

    constructor(
        public readonly cols: Column[],
        public readonly rows: Row[],
    ) {
        if (cols.length === 0 || rows.length === 0) return
        this.first = { row: this.rows[0], col: this.cols[0] }
        this.last = { row: this.rows[this.rows.length - 1], col: this.cols[this.cols.length - 1] }
        this.height = this.last.row.top + this.last.row.height - this.first.row.top
        this.width = this.last.col.left + this.last.col.width - this.first.col.left
    }

    readonly width: number = 0
    readonly height: number = 0
    readonly first: Location
    readonly last: Location

    contains(location: Location): boolean {
        return location.col.idx >= this.first.col.idx && location.col.idx <= this.last.col.idx &&
            location.row.idx >= this.first.row.idx && location.row.idx <= this.last.row.idx
    }

    containsRange(range: Range): boolean {
        return range.first.col.idx >= this.first.col.idx && range.first.row.idx >= this.first.row.idx &&
            range.last.col.idx <= this.last.col.idx && range.last.row.idx <= this.last.row.idx
    }

    slice(range: Range, direction: 'columns' | 'rows' | 'both'): Range {
        const firstRow = (direction === 'rows') ? range.first.row : this.first.row
        const firstCol = (direction === 'columns') ? range.first.col : this.first.col
        const lastRow = (direction === 'rows') ? range.last.row : this.last.row
        const lastCol = (direction === 'columns') ? range.last.col : this.last.col
        const slicedRows = this.rows.slice(this.rows.indexOf(firstRow), this.rows.indexOf(lastRow) + 1)
        const slicedCols = this.cols.slice(this.cols.indexOf(firstCol), this.cols.indexOf(lastCol) + 1)
        return new Range(slicedCols, slicedRows)
    }
}