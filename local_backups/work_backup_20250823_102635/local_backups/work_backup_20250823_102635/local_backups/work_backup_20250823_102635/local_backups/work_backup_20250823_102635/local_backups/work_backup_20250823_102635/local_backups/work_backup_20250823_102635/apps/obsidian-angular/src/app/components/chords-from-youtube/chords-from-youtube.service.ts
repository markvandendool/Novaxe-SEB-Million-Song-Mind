import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';

import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ChordsFromYoutubeService {
  
	yChords:any;

  constructor(private _http: HttpClient ) { 
	  this.yChords = new Subject();
  }

  searchYoutube(l){
  	console.log('searchYoutube() =>'+l );

		let obj :object = {
			link:l
		};


		const headers = new HttpHeaders({ 'Content-Type': 'application/json'});  
		this._http.post(environment.apiGetChordsFromYoutube, obj,{responseType: 'text', headers})
	    .map(res => {
	    	console.log("Received : \n"+res);
	    	this.yChords.next(res);
		  })
	    .subscribe(
	      data => console.log('data  : '+data),
	      err => console.log(err),
	      () => {
	      	console.log('Saving Complete');
	      }
	    );
  }
}
