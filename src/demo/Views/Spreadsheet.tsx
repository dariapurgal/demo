import * as React from 'react'
import { Grid, CellMatrix } from "../../lib"
import { TextCell, HeaderCell } from '../../lib/Cells'

export class Spreadsheet extends React.Component<{}, {}> {

    private generateCellMatrix() {
        const rowHeights = Array(200).fill(25)
        const columnWidths = Array(200).fill(150)

        const cells = rowHeights.map((rh, ri) =>
            columnWidths.map((cw, ci) => TextCell.Create(ri + ' - ' + ci, _ => { }))
        )
        rowHeights.map((_, i) => cells[i][0] = HeaderCell.Create('vertical', i.toString(), _ => { }))
        columnWidths.map((_, j) => cells[0][j] = HeaderCell.Create('horizontal', j.toString(), _ => { }))
        return new CellMatrix({ frozenTopRows: 1, frozenLeftColumns: 1, frozenBottomRows: 1, frozenRightColumns: 1, rowHeights, columnWidths, cells: cells })
    }

    render() {
        return <Grid style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
            cellMatrix={this.generateCellMatrix()}
            onValuesChanged={() => this.forceUpdate()} />
    }


}
