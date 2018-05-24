import * as React from 'react'
import { VerticalDataGrid } from './Views/VerticalDataGrid'
import { HorizontalDataGrid } from './Views/HorizontalDataGrid'
import { Spreadsheet } from './Views/Spreadsheet'

export default class Demo extends React.Component<{}, { gridType: 'vertical' | 'horizontal' | 'spreadsheet' }> {
    private records: any[] = []
    private fields = [
        { name: "name", width: 200 },
        { name: "surname", width: 200 },
        { name: "age", width: 120 },
        { name: "task", width: 140 },
        { name: "other", width: 70 },
        { name: "surname1", width: 200 },
        { name: "age1", width: 120 },
        { name: "task1", width: 140 },
        { name: "other1", width: 70 },
        { name: "surname2", width: 400 },
        { name: "age2", width: 120 },
        { name: "task2", width: 140 },
        { name: "other2", width: 70 },
        { name: "surname3", width: 200 },
        { name: "age3", width: 120 },
        { name: "task3", width: 140 },
        { name: "other3", width: 70 },
        { name: "surname4", width: 200 },
        { name: "age4", width: 120 },
        { name: "task4", width: 140 },
        { name: "other4", width: 70 }
    ]


    generateData() {
        for (let i = 0; i < 200; i++) {
            this.records.push({ name: 'Name ' + i, surname: 'Surname ' + i, age: 24 + i, task: 'Task ' + i, other: 'Other ' + i, surname1: 'Nazwisko ' + i, age1: 24 + i, task1: 'Zadanie ' + i, other1: 'Other ' + i, surname2: 'Nazwisko ' + i, age2: 24 + i, task2: 'Zadanie ' + i, other2: 'Other ' + i, surname3: 'Nazwisko ' + i, age3: 24 + i, task3: 'Zadanie ' + i, other3: 'Other ' + i })
        }
    }

    componentWillMount() {
        this.setState({ gridType: 'spreadsheet' })
        this.generateData()
    }

    render() {
        return <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', top: 0, bottom: 0, right: 0, left: 0, }}>
            <div>
                <input type="radio" name="gridType" checked={this.state.gridType === 'spreadsheet'} onChange={_ => this.setState({ gridType: 'spreadsheet' })} /> Spreadsheet
                <input type="radio" name="gridType" checked={this.state.gridType === 'vertical'} onChange={_ => this.setState({ gridType: 'vertical' })} /> VerticalDataGrid
                <input type="radio" name="gridType" checked={this.state.gridType === 'horizontal'} onChange={_ => this.setState({ gridType: 'horizontal' })} /> HorizontalDataGrid
            </div>
            <div style={{ position: 'relative', flexGrow: 1, }}>

                {this.state.gridType === 'vertical' && <VerticalDataGrid
                    records={this.records}
                    fields={this.fields}
                />}

                {this.state.gridType === 'horizontal' && <HorizontalDataGrid
                    records={this.records}
                    fields={this.fields}
                />}

                {this.state.gridType === 'spreadsheet' && <Spreadsheet />}
            </div>
        </div>

    }
}






