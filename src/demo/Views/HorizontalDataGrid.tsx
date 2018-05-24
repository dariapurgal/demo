import * as React from 'react'
import { Grid, CellMatrix } from "../../lib"
import { HeaderCell, TextCell, NumberCell } from '../../lib/Cells'

export interface Field {
    name: string
    width: number
}

export interface HorizontalDataGridProps {
    records: any[]
    fields: Field[]
}
export class HorizontalDataGrid extends React.Component<HorizontalDataGridProps, { cellMatrix: CellMatrix }> {

    componentWillMount() {
        this.generateCellMatrix()
    }


    generateCellMatrix() {
        const cells = this.props.fields.map((field, fi) => this.props.records.map((record, ri) =>
            (field.name.includes('age')) ? NumberCell.Create(record[field.name], value => record[field.name] = value) :
                TextCell.Create(record[field.name], value => record[field.name] = value)))
        this.props.fields.forEach((f, i) => cells[i][0] = HeaderCell.Create('vertical', f.name, value => { }))
        //const columnWidths = this.props.records.map((record, fi) => 200)

        this.setState({
            cellMatrix: new CellMatrix({
                columnWidths: [],
                rowHeights: [],
                cells: cells,
                frozenLeftColumns: 1
            })
        })
    }

    handleRowReorder = (firstReorderedRowIdx: number, selectedRowsCount: number, positionChange: number) => {
        const reorderedElement = this.props.fields.splice(firstReorderedRowIdx, selectedRowsCount)
        this.props.fields.splice(firstReorderedRowIdx + positionChange, 0, ...reorderedElement)
        this.generateCellMatrix()
    }

    handleColReorder = (firstReorderedColumnIdx: number, selectedColumnCount: number, positionChange: number) => {

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