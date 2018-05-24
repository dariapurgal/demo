import * as React from 'react'
import { CellProps, Cell } from '../Model'
import { zIndex, keyCodes } from '../Constants'

export class TextCell extends React.Component<CellProps, {}> {
  static Create(value: string, setValue: (value: any) => void): Cell {
    return {
      value,
      render: (cellProps) => <TextCell {...cellProps} />,
      trySetValue: (v) => { setValue(v); return true }
    }
  }

  handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {

    if (e.keyCode === keyCodes.RIGHT_ARROW || e.keyCode === keyCodes.DOWN_ARROW) {
      let input: HTMLInputElement = e.target as HTMLInputElement
      if (input.selectionEnd === input.value.length) {
        this.props.grid.hiddenFocusElement.focus()
        e.preventDefault()
      }
    }
    if (e.keyCode === keyCodes.LEFT_ARROW || e.keyCode === keyCodes.UP_ARROW) {
      let input: HTMLInputElement = e.target as HTMLInputElement
      if (input.selectionEnd === 0) {
        this.props.grid.hiddenFocusElement.focus()
        e.preventDefault()
      }
    }

    if (e.keyCode === keyCodes.TAB || e.keyCode === keyCodes.ENTER) {
      this.props.grid.hiddenFocusElement.focus()
      e.preventDefault()
    }
  }

  render() {
    return <div {...this.props.attributes} >
      {this.props.isInEditMode && <input style={{ zIndex: zIndex.cellInput, width: this.props.attributes.style.width, height: this.props.attributes.style.height, border: 0, fontSize: 16, outline: 'none' }} ref={input => {
        if (input) {
          input.focus()
          input.setSelectionRange(input.value.length, input.value.length)

        }
      }} defaultValue={this.props.value} onChange={e => { this.props.trySetValue(e.target.value); this.props.grid.commitChanges() }} onKeyDown={(e) => this.handleKeyDown(e)} />}
      {!this.props.isInEditMode && this.props.value}</div>
  }
}