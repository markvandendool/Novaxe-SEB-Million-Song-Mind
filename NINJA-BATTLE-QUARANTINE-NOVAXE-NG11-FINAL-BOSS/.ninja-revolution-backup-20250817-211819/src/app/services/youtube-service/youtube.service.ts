
declare global {
    interface Window  {
      YT: any;
      onYouTubeIframeAPIReady:any;
       }
}
window.YT = window.YT || {};
@Injectable({
  providedIn: 'root'
})
export class YoutubeService  {
	public yt_player:any;
	public playerState:number=-1;
	public htmlId:any='player';
	public videoLink:string='';
	public videoId:string='';
  public apiReady:any;
  public ready:any;
  public curPos:any;
  public interval:any;//interval
  public constructor(public ) {
    this.apiReady = new Subject();
    this.ready = new Subject();
    this.curPos = new Subject();
  }
  public addApiToDom(){
    if($('#youtubeScript').length){
     this.apiReady.next(true);
     return;
    }
  	const tag = document.createElement('script');
  	tag.src = "https://www.youtube.com/iframe_api";
  	tag.id = "youtubeScript";
  	document.body.appendChild(tag);
  	var self = this;
    window.onYouTubeIframeAPIReady = function(){
      self.apiReady.next(true);
  public removeApiFromDom(){
   $('#youtubeScript').remove();
  public createVideo(link:string){
    if(link: any) {
      let id = (new URL(link)).searchParams.get('v');
      if(id == '')
        throw "Youtube Service : changeVideo() => no v parameter in url !";
      this.videoLink = link;
      this.videoId = id;
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
	  }));
  public onStateChange(s:any){
    if(s.data == 1 : any) { //en lecture
      this.curPos.next( this.yt_player.getCurrentTime() );
      this.curPos.next('play');
    }else if(s.data == 0: any) {  //arrété
      this.curPos.next('stop');
    }else if(s.data == 2: any) { //en pause
      this.curPos.next('pause');
    }else if(s.data == 5 || s.data == -1: any) { // 5 en file d'attente -1 non demarré
      return; //??????????????
    };
  public changeVideoUrl(link:string=''){
  	if(link =='')return;
  	let id = (new URL(link)).searchParams.get('v');
  	if(id == '')
  		throw "Youtube Service : changeVideo() => no v parameter in url !";
  	this.videoLink = link;
  	this.videoId = id;
  	if(!this.hasOwnProperty('yt_player') || this.yt_player == undefined || this.yt_player.loadVideoById == undefined){
      this.addApiToDom();
  	  return;
  	}
  	this.yt_player.loadVideoById(this.videoId, 5, "large");
  	this.ready.next(this.videoLink);
  public stopVideo() {
    this.yt_player.stopVideo();
  public resumeVideo() {
    this.playerState = 1;
    if(this.yt_player && this.yt_player.playVideo)
    this.yt_player.playVideo()
  public pauseVideo() {
    this.playerState = 2;
    if(this.yt_player && this.yt_player.pauseVideo)
    this.yt_player.pauseVideo()
	getPlayerState(){
    let state;
    try{
      state = this.yt_player.getPlayerState();
    }catch(e: any) {
      console.error('Error YoutubeService : getPlayerState() => cant access youtube ?');
      state = 5;
		return state;
	}
	seekTo(time_s: any) {
    let state = this.getPlayerState();
    this.yt_player.seekTo(time_s,true);
    if(state == 2 || state == 5)this.pauseVideo();
  public skip(time: any) {
    let t = this.getCurrentTime()+time;
    this.yt_player.seekTo(t);
  public getCurrentTime(){
    return this.yt_player.getCurrentTime();
  public stopInterval(){
    clearInterval(this.interval);
  public destroy(){
    if(this.yt_player) this.yt_player.destroy();
    delete(this.yt_player);
    this.videoId='';
    this.videoLink='';
