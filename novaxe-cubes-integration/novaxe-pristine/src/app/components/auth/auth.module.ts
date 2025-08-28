import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Remove AuthComponent from declarations since it's now standalone

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule
    ]
})
export class AuthModule { }