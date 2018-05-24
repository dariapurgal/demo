//import * as React from 'react'
import { Grid } from '../Grid'
import { DelegateBehavior } from './Behavior'
import { KeyNavigationInsideSelectionBehavior } from './KeyNavigationInsideSelectionBehavior'
import { DefaultKeyNavigationBehavior } from './DefaultKeyNavigationBehavior'
import { CopyCutPasteBehavior } from './CopyCutPasteBehavior'
import { ResizeSelectionWithKeysBehavior } from './ResizeSelectionWithKeysBehavior'
import { BasicGridBehavior } from './BasicGridBehavior'
import { DrawFillHandleBehavior } from './DrawFillHandleBehavior'
import { DefaultKeyHandlerBehavior } from './DefaultKeyHandlerBehavior'


export class DefaultGridBehavior extends DelegateBehavior {
    constructor(grid: Grid) {
        super(new DrawFillHandleBehavior(
            new DefaultKeyNavigationBehavior(
                new KeyNavigationInsideSelectionBehavior(
                    new ResizeSelectionWithKeysBehavior(
                        new DefaultKeyHandlerBehavior(
                            new CopyCutPasteBehavior(
                                new BasicGridBehavior(grid)
                            )
                        )
                    )
                )
            )
        ))
    }
}