import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

  constructor(private _http: HttpClient) { }

  public getItems(song:object){

    const headers = new HttpHeaders({ 'Content-Type': 'application/json'});
    return this._http.post(environment.apiSpotify, song,{responseType: 'text', headers})
      .map(res => {
        try{
          return JSON.parse(res);
        }catch(e){
          return "Spotify api error"
          console.clear();
          console.warn(res);
        }
      })
  }


  public getFeatures(id:object){

    const headers = new HttpHeaders({ 'Content-Type': 'application/json'});
    return this._http.post(environment.apiSpotifyAnalysis, id,{responseType: 'text', headers})
      .map(res => {
        try{
          return JSON.parse(res);
        }catch(e){
          return "Spotify api error"
          console.clear();
          console.warn(res);
        }
      })
  }


  public getInfos(id:object){

    const headers = new HttpHeaders({ 'Content-Type': 'application/json'});
    return this._http.post(environment.apiSpotifyContents, id,{responseType: 'text', headers})
      .map(res => {
        try{
          return JSON.parse(res);
        }catch(e){
          return "Spotify api error"
          console.clear();
          console.warn(res);
        }
      })
  }


  public getReco(infos:object){

    const headers = new HttpHeaders({ 'Content-Type': 'application/json'});
    return this._http.post(environment.apiSpotifyReco, infos,{responseType: 'text', headers})
      .map(res => {
        try{
          return JSON.parse(res);
        }catch(e){
          return "Spotify api error"
          console.clear();
          console.warn(res);
        }
      })
  }


  public getTop(id:object){

    const headers = new HttpHeaders({ 'Content-Type': 'application/json'});
    return this._http.post(environment.apiSpotifyTop, id,{responseType: 'text', headers})
      .map(res => {
        try{
          return JSON.parse(res);
        }catch(e){
          return "Spotify api error"
          console.clear();
          console.warn(res);
        }
      })
  }


}
