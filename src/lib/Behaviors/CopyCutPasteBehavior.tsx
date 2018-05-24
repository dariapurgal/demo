import * as React from 'react'
import { Location } from '../Model'
import { DelegateBehavior } from './Behavior'

export class CopyCutPasteBehavior extends DelegateBehavior {

    private handleCut(event: React.ClipboardEvent<HTMLDivElement>) {
        const textArea = document.createElement('textarea')
        document.body.appendChild(textArea)
        textArea.value = this.getSelectedValuesInString()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        this.grid.state.selectedRange.rows.forEach(row =>
            this.grid.state.selectedRange.cols.forEach(col =>
                this.grid.props.cellMatrix.getCell({ row, col }).trySetValue('')))
        event.preventDefault()
        this.grid.hiddenFocusElement.focus()
        this.grid.commitChanges()
    }


    private handleCopy(event: React.ClipboardEvent<HTMLDivElement>) {
        // row, cell
        const content = this.getSelectedValuesInString().split('\n').map(line => line.split('\t'))
        const div = document.createElement('div')
        const table = document.createElement('table')
        content.forEach(function (rowData) {
            const row = table.insertRow(-1)
            rowData.forEach(function (cellData) {
                const cell = row.insertCell()
                cell.textContent = cellData
                cell.style.border = '1px solid #D3D3D3'
            })
        })

        div.setAttribute("contenteditable", 'true')
        div.appendChild(table)
        document.body.appendChild(div)
        div.focus()
        document.execCommand('selectAll', false, null)
        document.execCommand('copy')
        document.body.removeChild(div)
        this.grid.hiddenFocusElement.focus()
        event.preventDefault()
        this.grid.commitChanges()
    }


    private getSelectedValuesInString(): string {
        return this.grid.state.selectedRange.rows.reduce((resultString, row) =>
            resultString + this.grid.state.selectedRange.cols.reduce((rowString, col) =>
                rowString + this.grid.props.cellMatrix.getCell({ row, col }).value + '\t', '').slice(0, -1) + '\n', '').slice(0, -1)

    }

    private handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
        const selectedRange = this.grid.state.selectedRange
        const pasteContent = event.clipboardData.getData('text/plain').split('\n').map(line => line.split('\t'))
        const cellMatrix = this.grid.props.cellMatrix
        if (pasteContent.length === 1 && pasteContent[0].length === 1) {
            selectedRange.rows.forEach(row =>
                selectedRange.cols.forEach(col =>
                    cellMatrix.getCell({ row, col }).trySetValue(pasteContent[0][0])
                )
            )
        }
        else {
            let lastLocation: Location
            pasteContent.forEach((row, pasteRowIdx) =>
                row.forEach((pasteValue, pasteColIdx) => {
                    const rowIdx = selectedRange.rows[0].idx + pasteRowIdx
                    const colIdx = selectedRange.cols[0].idx + pasteColIdx
                    if (rowIdx <= cellMatrix.last.row.idx && colIdx <= cellMatrix.last.col.idx) {
                        lastLocation = cellMatrix.getLocation(rowIdx, colIdx)
                        cellMatrix.getCell(lastLocation).trySetValue(pasteValue)
                    }
                })
            )
            this.grid.setState({ selectedRange: cellMatrix.getRange(this.grid.state.selectedRange.first, lastLocation) })
        }
        event.preventDefault()
        this.grid.hiddenFocusElement.focus()
        this.grid.commitChanges()
    }

    renderHiddenPart = (hiddenElement: React.ReactNode) => <div onCut={e => this.handleCut(e)} onPaste={e => this.handlePaste(e)} onCopy={e => this.handleCopy(e)}>{this.inner.renderHiddenPart(hiddenElement)}</div>

}