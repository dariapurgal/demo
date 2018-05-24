import * as React from 'react'
import { Grid } from '../Grid'
import { Behavior } from './Behavior'
import { Range } from '../Model'

export class BasicGridBehavior implements Behavior {
    constructor(public grid: Grid) { }
    renderPanePart: ((pane: Range) => React.ReactNode) = _ => undefined
    renderHiddenPart: ((hiddenElement: React.ReactNode) => React.ReactNode) = hiddenElement => hiddenElement
    dispose = () => { }
}