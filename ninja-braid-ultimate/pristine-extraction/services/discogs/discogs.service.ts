import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment'


@Injectable({
  providedIn: 'root'
})
export class DiscogsService {

  constructor(private _http: HttpClient) { }

  getItemsEditor(song:object){

    const headers = new HttpHeaders({ 'Content-Type': 'application/json'});
    return this._http.post(environment.apiDiscogs, song,{responseType: 'text', headers})
      .map(res => {
        try{
          return res;
        }catch(e){
          return "Discogs api error"
          console.clear();
          console.warn(res);
        }
      })
  }

}