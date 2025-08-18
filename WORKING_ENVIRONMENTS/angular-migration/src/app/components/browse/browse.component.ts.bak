import { Component, OnInit, Input } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';

import { UserModel } from '@models/usermodel/usermodel';
import { ConfigModel } from '@models/configmodel/configModel';
import { Songmodel } from '@models/songmodel/songmodel';

import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})

export class BrowseComponent implements OnInit {


	@Input()
	page: string;

	@Input()
	param: string;

	public list:Array<any> = [];	
	public analysisPatrn:string = '';

	public modalInfos:any={};

	public searchPattrn:any={};
	public isList:boolean;

  constructor( public _http:HttpClient, public user:UserModel, public cm:ConfigModel, private sm:Songmodel ) { }

  ngOnInit() {
		this.cleanSearch();
		this.setPageInputs();
		this.modalInfos.hide = true;
		this.isList = this.cm.browse_dislplay_list;
  }

  private refreshScores(){
		const headers = new HttpHeaders({ 'Content-Type': 'application/json'});  
		this._http.get(environment.apiList, {responseType: 'text', headers})
		    .map(res => {
		    	this.list = JSON.parse(res);
			  })
		    .subscribe(
		      data => console.log('data  : '+data),
		      err => console.log(err),
		      () => {console.log('Refresh Complete') }
		    );

  }

  public deleteScore(){

  	let id:any = this.modalInfos['id'];
		const headers = new HttpHeaders({ 'Content-Type': 'application/json'});  

		let obj:object = {
			id:id,
			user:this.user.get_user()
		};

		this._http.post(environment.apiDeleteSong, obj, {responseType: 'text', headers})
	    .map(res => {
	    	this.refreshScores();
		  	this.modalInfos.hide = true;	
		  })
	    .subscribe(
	      data => console.log('data  : '+data),
	      err => {
		      console.log(err),
  	    	this.refreshScores();
  		  	this.modalInfos.hide = true;	
	      },
	      () => {console.log('delete Complete') }
	    );
  }


  public search(){

  	if(this.searchPattrn.title == '' && this.searchPattrn.artist == '' && this.searchPattrn.author == '' && this.searchPattrn.album == '' && 
  			this.searchPattrn.style == '' && this.searchPattrn.chords == '' && this.searchPattrn.analysis == '' && this.searchPattrn.tonality == '' ){
  		this.refreshScores();
  		return;
  	}
		let obj:object = {
			pattrnTitle:this.searchPattrn['title'],
			pattrnArtist:this.searchPattrn['artist'],
			pattrnAlbum:this.searchPattrn['album'],
			pattrnAuthor:this.searchPattrn['author'],
			pattrnKey:this.searchPattrn['tonality'],
			pattrnStyle:this.searchPattrn['style'],
			pattrnChords:this.searchPattrn['chords'],
		};
		console.log('obj => ',obj);

		const headers = new HttpHeaders({ 'Content-Type': 'application/json'}); 
			
			
		this._http.post(environment.apiSearchAnalysis, obj, {responseType: 'text', headers})
			.map(res => {
			try{	
				this.list = JSON.parse(res);
				console.log("this.list => ",this.list);
				this.listStyles();
			}catch(e){
				console.log(e)
				console.log('res => ');
				console.log(res)
			}
			})
			.subscribe( data => console.log('data  : '+data),
			err => console.log(err),
			() => {console.log('Search Complete') }
			);

  }

  public openDeleteModal(index:number){
  	event.stopPropagation();
  	this.modalInfos.id = this.list[index].id;
  	this.modalInfos.title 	= this.list[index].title;	
  	this.modalInfos.hide 	= false;
  }

  public cleanSearch(){
  	this.searchPattrn.title='';
		this.searchPattrn.artist='';
		this.searchPattrn.author='';
		this.searchPattrn.album='';
		this.searchPattrn.style='';
		this.searchPattrn.chords='';
		this.searchPattrn.analysis='';
		this.searchPattrn.tonality='';

  	this.refreshScores();
  }

  private setPageInputs(){
		if(this.page != 'home'){
			switch(this.page){
				case('title'):
					this.searchPattrn.title=this.param;
				break;
				case('artist'):
					this.searchPattrn.artist=this.param;
				break;
				case('author'):
					this.searchPattrn.author=this.param;
				break;
				case('album'):
					this.searchPattrn.album=this.param;
				break;
				case('style'):
					this.searchPattrn.style=this.param;
				break;
				case('key'):
					this.searchPattrn.tonality=this.param;
				break;
				// case('chords'):
				// 	this.searchPattrn.chords=this.param;
				// break;
				default:
				break;
			}
			this.search();
		}
		else
  		this.refreshScores();
  }


  private listStyles(){
  	var styles = [];
  	for (let i=0; i<this.list.length; i++){

  		var str = this.list[i]['style'].replaceAll(/\/| - /g,' ');
  		str = str.trim();
  		str = str.split(' ');

  		for(let j=0; j<str.length; j++){
  			styles.push(str[j]);
  		}
  	}
  	let uniqueStyles = [...new Set(styles)];
  	uniqueStyles = uniqueStyles.filter(e => e !== 'unknown');
  	uniqueStyles = uniqueStyles.filter(e => e !== '');

  	this.sm.setListStyles(uniqueStyles);
  }


}
