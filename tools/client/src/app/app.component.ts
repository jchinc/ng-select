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

    constructor(){
        this.rutasSource.push(new NgSelectItem('1', 'Item 1'));
        this.rutasSource.push(new NgSelectItem('2', 'Item 2'));
        this.rutasSource.push(new NgSelectItem('3', 'Item 3'));
        this.rutasSource.push(new NgSelectItem('4', 'Item 4'));
        this.rutasSource.push(new NgSelectItem('5', 'Item 5'));
    }
}
