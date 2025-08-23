import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment'
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-store',
    templateUrl: './store.component.html',
    styleUrls: ['./store.component.scss'],
    standalone: false
})
export class StoreComponent implements OnInit {

  public counter(i: number) {return new Array(i);}
  public list:Array<any> = [];  

  constructor( public _http:HttpClient ) { }

  ngOnInit(): void {
    this.refreshScores();
  }

  refreshScores(){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json'});  
    this._http.get(environment.apiList, {responseType: 'text', headers})
        .pipe(map(res => {
          this.list = JSON.parse(res);
        }))
        .subscribe(
          data => console.log('data  : '+data),
          err => console.log(err),
          () => {console.log('Refresh Complete') }
        );
  }

}
