import {
    Component,
    Input,
    OnInit
} from '@angular/core';
import { INgSelectItem, NgSelectItem } from './ng-select.models';

@Component({
    selector: 'ng-select',
    templateUrl: './ng-select.component.html',
    styleUrls: ['./ng-select.component.css']
})
export class NgSelectComponent implements OnInit {

    items: Array<INgSelectItem> = [];

    ngOnInit(): void {
        this.items.push(new NgSelectItem('1', 'Item 1'));
        this.items.push(new NgSelectItem('2', 'Item 2'));
        this.items.push(new NgSelectItem('3', 'Item 3'));
        this.items.push(new NgSelectItem('4', 'Item 4'));
        this.items.push(new NgSelectItem('5', 'Item 5'));
    }
}