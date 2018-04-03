import { Component } from '@angular/core';

import { NgSelectItem } from '@jchinc/ng-select';
import 'rxjs/add/operator/debounceTime';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'app';

    rutasSource: Array<NgSelectItem> = [];

    constructor() {
        this.rutasSource.push(new NgSelectItem('1', 'Item 1', 'Pruebas'));
        this.rutasSource.push(new NgSelectItem('2', 'Item 2', '', false, ['prueba1', 'prueba2']));
        this.rutasSource.push(new NgSelectItem('3', 'Item 3'));
        this.rutasSource.push(new NgSelectItem('4', 'Item 4'));
        this.rutasSource.push(new NgSelectItem('5', 'Item 5'));
        this.rutasSource.push(new NgSelectItem('3', 'Item 6'));
        this.rutasSource.push(new NgSelectItem('4', 'Item 7'));
        this.rutasSource.push(new NgSelectItem('5', 'Item 8'));
        this.rutasSource.push(new NgSelectItem('3', 'Item 9'));
        this.rutasSource.push(new NgSelectItem('4', 'Item 10'));
        this.rutasSource.push(new NgSelectItem('5', 'Item 11'));
        this.rutasSource.push(new NgSelectItem('5', 'Item 12'));
        this.rutasSource.push(new NgSelectItem('4', 'Item 13'));
        this.rutasSource.push(new NgSelectItem('5', 'Item 14'));
        this.rutasSource.push(new NgSelectItem('3', 'Item 15'));
        this.rutasSource.push(new NgSelectItem('4', 'Item 16'));
        this.rutasSource.push(new NgSelectItem('5', 'Item 17'));
        this.rutasSource.push(new NgSelectItem('5', 'Item 18'));
    }

    changes(items: Array<NgSelectItem>) {
        console.log(items);
    }

    resetSource():void{
        this.rutasSource = [];
        this.rutasSource.push(new NgSelectItem('1', 'Item 1', 'Pruebas'));
        this.rutasSource.push(new NgSelectItem('2', 'Item 2', '', false, ['prueba1', 'prueba2']));
        this.rutasSource.push(new NgSelectItem('3', 'Item 3 con texto largo para verificar ellipsis'));
        this.rutasSource.push(new NgSelectItem('4', 'Item 4'));
        this.rutasSource.push(new NgSelectItem('5', 'Item 5'));
    }
}
