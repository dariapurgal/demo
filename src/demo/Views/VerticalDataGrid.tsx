import * as React from "react"
import { CellMatrix, Grid } from "../../lib";
import { HeaderCell, TextCell } from "../../lib/Cells";




export interface Field {
    name: string
    width: number
}

export interface VerticalDataGridProps {
    records: any[]
    fields: Field[]
}

export class VerticalDataGrid extends React.Component<VerticalDataGridProps, { cellMatrix: CellMatrix }> {

    componentWillMount() {
        this.generateCellMatrix()
    }

    generateCellMatrix() {
        const cells = this.props.records.map((record, ri) => this.props.fields.map((field, fi) => TextCell.Create(record[field.name], value => record[field.name] = value)))
        //const columnWidths = this.props.fields.map((field, fi) => ({ colIdx: fi + 1, width: field.width }))
        this.props.records.forEach((r, j) => cells[0][j] = HeaderCell.Create('horizontal', r.name, value => { }))

        this.setState({
            cellMatrix: new CellMatrix({
                columnWidths: [],
                rowHeights: [],
                cells: cells,
                frozenTopRows: 1
            })
        })
    }

    handleRowReorder = (first: number, count: number, positionChange: number) => {
        this.generateCellMatrix()
    }

    handleColReorder = (first: number, count: number, positionChange: number) => {
        // -1 jeden od idx, ponieważ kolumny zaczynają się od 1 elementu, bez -1 bierze pod uwagę następną kolumnę - TODO albo zacząć kolumny od 0 albo zostawić 
        const reorderedElement = this.props.fields.splice(first - 1, count)
        this.props.fields.splice(first + positionChange - 1, 0, ...reorderedElement)
        this.generateCellMatrix()
    }

    handleColResize = (resizedColumnIdx: number, newColWidth: number) => {
        this.props.fields[resizedColumnIdx].width = newColWidth
        this.generateCellMatrix()
    }


    render() {
        return (<div style={{ margin: 0 }}>
            <Grid style={{ width: "100%", height: '100vh' }}
                cellMatrix={this.state.cellMatrix}
                onValuesChanged={() => { this.generateCellMatrix(); this.forceUpdate() }}
                onRowsReordered={this.handleRowReorder}
                onColumnsReordered={this.handleColReorder}
                onColResize={this.handleColResize} />
        </div>
        )
    }
}