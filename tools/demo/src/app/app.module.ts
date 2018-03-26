import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgMultiselectModule } from '@jchinc/ng-multiselect';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgMultiselectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
