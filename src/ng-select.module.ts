import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import 'rxjs/add/operator/debounceTime';

import { NgSelectComponent } from './ng-select.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    exports: [
        NgSelectComponent
    ],
    declarations: [
        NgSelectComponent
    ]
})
export class NgSelectModule { }