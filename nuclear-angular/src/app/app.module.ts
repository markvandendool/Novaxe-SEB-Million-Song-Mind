import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BraidComponent } from './components/braid/braid.component';
import { TransportComponent } from './components/transport/transport.component';

@NgModule({
  declarations: [
    AppComponent,
    BraidComponent,
    TransportComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
