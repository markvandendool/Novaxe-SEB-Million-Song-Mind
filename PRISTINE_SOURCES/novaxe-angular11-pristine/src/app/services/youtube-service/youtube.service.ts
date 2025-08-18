import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

declare global {
    interface Window { 
      YT: any;
      onYouTubeIframeAPIReady:any;
       }
}
window.YT = window.YT || {};


@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

	public yt_player:any;
	public playerState:number=-1;

	public htmlId:any='player';

	public videoLink:string='';
	public videoId:string='';

  //Subject
  public apiReady:any;
  public ready:any; 
  public curPos:any;

  public interval:any;//interval

  constructor() { 

    this.apiReady = new Subject();
    this.ready = new Subject();
    this.curPos = new Subject();

    // this.addApiToDom();


  }

  addApiToDom(){
    // console.log("addApiToDom");
    if($('#youtubeScript').length){
          // console.log(`
          //     ***********

          // Youtube API script ALREADY instanciated !!!

          //     ***********
          // `);

     this.apiReady.next(true);
     return;
    }
  	// This code loads the IFrame Player API code asynchronously, according to the instructions at
  	// https://developers.google.com/youtube/iframe_api_reference#Getting_Started
  	const tag = document.createElement('script');

  	tag.src = "https://www.youtube.com/iframe_api";
  	tag.id = "youtubeScript";

  	document.body.appendChild(tag);

  	var self = this;
    window.onYouTubeIframeAPIReady = function(){
	  	// console.log(`
	  	//     ***********

	  	// Youtube API script instanciated !

		  //     ***********
	  	// `);
      self.apiReady.next(true);
	  	// self.createVideo();
    }
  }

  removeApiFromDom(){
   $('#youtubeScript').remove(); 
  }


  createVideo(link:string){
    if(link) {
      let id = (new URL(link)).searchParams.get('v');
      if(id == '')
        throw "Youtube Service : changeVideo() => no v parameter in url !";

      this.videoLink = link;
      this.videoId = id;
    }

    // console.log("\n\nCREATING VIDEO on #"+this.htmlId);
  	// var self = this;
    this.yt_player = null;
	  this.yt_player = new window['YT'].Player(this.htmlId, {
	    height: '460',
	    width: '640',
	    videoId: this.videoId,
      playerVars: {autoplay:0, controls:0,cc_load_policy:0,iv_load_policy:3,modestbranding:1,disablekb:1,rel:0,showinfo:0,loop:1,playlist:this.videoId,fs:1},
	    events: {
	      'onReady': ()=>{
          this.yt_player.mute();
          this.yt_player.pauseVideo();
          this.ready.next(this.videoLink)
        },
	      'onStateChange': (s)=>{
          this.onStateChange(s);}
	    }
	  });
  }

  onStateChange(s:any){
    if(s.data == 1 ){ //en lecture
      this.curPos.next( this.yt_player.getCurrentTime() );
      this.curPos.next('play');
    }else if(s.data == 0){  //arrété
      this.curPos.next('stop');
    }else if(s.data == 2){ //en pause
      this.curPos.next('pause');
    }else if(s.data == 5 || s.data == -1){ // 5 en file d'attente -1 non demarré
      return; //??????????????
      // this.yt_player.pauseVideo();
      this.curPos.next( this.yt_player.getCurrentTime() );
    };

  }

  changeVideoUrl(link:string=''){
    // console.log("changeVideoUrl : " +link);

    // let self = this;

  	if(link =='')return;

  	let id = (new URL(link)).searchParams.get('v');

  	if(id == '')
  		throw "Youtube Service : changeVideo() => no v parameter in url !";

  	this.videoLink = link;
  	this.videoId = id;

  	if(!this.hasOwnProperty('yt_player') || this.yt_player == undefined || this.yt_player.loadVideoById == undefined){
      this.addApiToDom();
      // setTimeout(()=>{
      //   this.changeVideoUrl(link);
      // },1000);
  		console.warn( "Youtube Service : changeVideo() => yt_player not instanciated !" );
  	  return;
  	}
  	this.yt_player.loadVideoById(this.videoId, 5, "large");

  	this.ready.next(this.videoLink);

  }


  stopVideo() {
    this.yt_player.stopVideo();
  }

  resumeVideo() {
    this.playerState = 1;
    if(this.yt_player && this.yt_player.playVideo)
    this.yt_player.playVideo()
    // this.yt_player.resumeVideo();
  }

  pauseVideo() {
    this.playerState = 2;
    if(this.yt_player && this.yt_player.pauseVideo)
    this.yt_player.pauseVideo()
    // this.yt_player.resumeVideo();
  }

	getPlayerState(){
    let state;
    try{
      state = this.yt_player.getPlayerState();
    }catch(e){
      console.error('Error YoutubeService : getPlayerState() => cant access youtube ?');
      state = 5;
    }
		return state;
	}

	seekTo(time_s){
    let state = this.getPlayerState();
    this.yt_player.seekTo(time_s,true);
    if(state == 2 || state == 5)this.pauseVideo();
	}

  skip(time){
    let t = this.getCurrentTime()+time;
    console.log("t =>", t)
    this.yt_player.seekTo(t);
  }

  getCurrentTime(){
    return this.yt_player.getCurrentTime();
  }

  stopInterval(){
    clearInterval(this.interval);
  }

  destroy(){
    if(this.yt_player) this.yt_player.destroy();

    delete(this.yt_player);
    this.videoId='';
    this.videoLink='';
    // this.ws.file_path='';

  }

}
