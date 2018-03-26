import { Component } from '@angular/core';

import { NgMultiselectItem } from '@jchinc/ng-multiselect';
import 'rxjs/add/operator/debounceTime';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'app';

    rutasSource: Array<NgMultiselectItem> = [];

    constructor() {
        this.rutasSource.push(new NgMultiselectItem('1', 'Item 1', 'Pruebas'));
        this.rutasSource.push(new NgMultiselectItem('2', 'Item 2', '', false, ['prueba1', 'prueba2']));
        this.rutasSource.push(new NgMultiselectItem('3', 'Item 3'));
        this.rutasSource.push(new NgMultiselectItem('4', 'Item 4'));
        this.rutasSource.push(new NgMultiselectItem('5', 'Item 5'));
        this.rutasSource.push(new NgMultiselectItem('3', 'Item 6'));
        this.rutasSource.push(new NgMultiselectItem('4', 'Item 7'));
        this.rutasSource.push(new NgMultiselectItem('5', 'Item 8'));
        this.rutasSource.push(new NgMultiselectItem('3', 'Item 9'));
        this.rutasSource.push(new NgMultiselectItem('4', 'Item 10'));
        this.rutasSource.push(new NgMultiselectItem('5', 'Item 11'));
        this.rutasSource.push(new NgMultiselectItem('5', 'Item 12'));
        this.rutasSource.push(new NgMultiselectItem('4', 'Item 13'));
        this.rutasSource.push(new NgMultiselectItem('5', 'Item 14'));
        this.rutasSource.push(new NgMultiselectItem('3', 'Item 15'));
        this.rutasSource.push(new NgMultiselectItem('4', 'Item 16'));
        this.rutasSource.push(new NgMultiselectItem('5', 'Item 17'));
        this.rutasSource.push(new NgMultiselectItem('5', 'Item 18'));
    }

    changes(items: Array<NgMultiselectItem>) {
        console.log(items);
    }

    resetSource():void{
        this.rutasSource = [];
        this.rutasSource.push(new NgMultiselectItem('1', 'Item 1', 'Pruebas'));
        this.rutasSource.push(new NgMultiselectItem('2', 'Item 2', '', false, ['prueba1', 'prueba2']));
        this.rutasSource.push(new NgMultiselectItem('3', 'Item 3 con texto largo para verificar ellipsis'));
        this.rutasSource.push(new NgMultiselectItem('4', 'Item 4'));
        this.rutasSource.push(new NgMultiselectItem('5', 'Item 5'));
    }
}
