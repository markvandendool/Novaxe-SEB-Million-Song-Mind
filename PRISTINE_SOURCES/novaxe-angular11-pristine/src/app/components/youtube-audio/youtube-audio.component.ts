import { Component, OnInit, AfterViewInit, OnDestroy, NgZone, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs';

import { Songmodel } from '@models/songmodel/songmodel';
import { ConfigModel } from '@models/configmodel/configModel';
import { DisplayService } from '@services/display/displayService';
import { YoutubeService } from '@services/youtube-service/youtube.service';
import { AudioPlayer } from '@services/audioplayer/audioplayer.service';
import { TransportService } from '@services/transport/transport.service';
import { BindingsService,KEYS } from '@services/bindings/bindings.service';
import { SelectionModel } from '@models/selectionmodel/selectionmodel';
import { BeatComputingService } from '@services/beat-computing-service/beat-computing.service';

import { Beat } from '@models/songmodel/beat';
import { Measure } from '@models/songmodel/measure';
import { Part } from '@models/songmodel/part';


@Component({
  selector: 'app-youtube-audio',
  templateUrl: './youtube-audio.component.html',
  styleUrls: ['./youtube-audio.component.scss']
})
export class YoutubeAudioComponent implements OnInit, OnDestroy, AfterViewInit {


  @Input() set display(val:boolean){
    this.visible = val;
  }
	public visible:boolean=true;
  public display_Y:boolean=false;
  public audio_loaded:boolean=false;

  public done = false;
  public videoId:string="";
  public link:string="";
  public file_path:string="";
  public loading_wheel = true;
  public playerState = 0;
  public interval:any;

  public repeat:any={active:false,start:0, end:0};

  public edit:boolean=true;
  public drag:boolean=false;

  public playback_rate:number=1;
  public volume:number=0.65;

  public m_volume:number=0.6;
  
  //const 
  public timeline_hidden=true;

  //subscriptions
  public apReady_sub:Subscription;
  public dbReady_sub:Subscription;
  public apDownloading_sub:Subscription;
  public ytReady_sub:Subscription;
  public ytCurPos_sub:Subscription;
  public apiReady_sub:Subscription;
  public markerUpdate_sub:Subscription;


  public ghost:boolean=false;
  public stretch:boolean=true;

  public follow:boolean=false;
  public center:boolean=true;

  private binding$:any; //Observable ..
  private binding_shift$:any; //Observable ..

  public displayed_chord: string = '';

  // watcher of the input "chord" : 
  @Input() set cur_chord(valeur: Array<any>) {    
    this.change_displayed_chord(valeur);
  }

  constructor(public yt:YoutubeService, 
              public ap:AudioPlayer, 
              public sm:Songmodel, 
              public cm:ConfigModel, 
              public zone:NgZone, 
              private dm:DisplayService,
              private tp:TransportService,
              private keys:BindingsService,
              private sel:SelectionModel,
              public beatC:BeatComputingService
              ) {
    // let infos = this.sm.getInfos();

    // this.link = infos.getYoutube_link();
    // this.videoId = infos.getYoutube_videoId();
    // this.file_path = infos.getYoutube_filePath();
    this.loadFromModel(true);
    this.follow = this.cm.isFollowOn();
    if( !this.file_path )this.loading_wheel = false;

    this.init_bindings();
    // debugger

  // to stop listening to the binding call .unsubscribe on it
  }

  ngOnInit() {
    if(this.ap.db_ready_val) this.ap.getMp3(this.link);
    else this.dbReady_sub = this.ap.db_ready.subscribe((data)=>{
        // console.log('db_ready !!!!!!!!!');
        this.ap.getMp3(this.link);
      });
    
    this.apiReady_sub = this.yt.apiReady.subscribe((data)=>{
      this.apiReady(data); 
    });

    this.ytReady_sub = this.yt.ready.subscribe((data)=>{this.videoReady(data)});
    this.apReady_sub = this.ap.ready.subscribe((data)=>{this.waveReady(data)});
    this.apDownloading_sub = this.ap.downloaded.subscribe((data)=>{this.loading_wheel = true;});

    this.ytCurPos_sub = this.yt.curPos.subscribe((data)=>{
      switch(data){
        case 'play':
          // if(!this.ap.isPlaying()) 
          this.ap.play();
          break;
        case 'pause':
          this.ap.pause();
          break;
        case 'stop':
          this.ap.stop();
          this.dm.renderMarker({operation:'refresh'});
          break;
        default:
          // console.log(data);
          this.ap.setCurrentTime( data );
          break;
      }
    });
    this.markerUpdate_sub = this.dm.markerUpdate$.subscribe((data)=>{
      // console.log("data => ",data);
      if(data.operation == 'add') this.ap.addRegion(data.data);
      if(data.operation == 'remove') this.deleteRegion(data.data);

      if(data.operation == 'refresh'){
       this.resetAllRegionsFromModel();
       // this.setAllBeatsFromModel();
      }
    })
    this.center = this.cm.isAutoScroll();
  }
  
  ngAfterViewInit(){
    // console.log("\n\n YOUTUBE VIEW INITIATED \n\n");
    this.yt.addApiToDom();
    this.ap.createFromHtmlElements('#waveform','#wave-timeline');
    this.set_volume();
  }

  ngOnDestroy(){


    this.ap.bindClick(()=>{});
    this.binding$.unsubscribe()
    if(this.ap.isPlaying() ) this.ap.stop();

    this.yt.ready.next(false);
    this.ap.ready.next(false);
    // this.yt.curPos.next(false);
    this.yt.apiReady.next(false);

    this.apiReady_sub.unsubscribe();
    this.apReady_sub.unsubscribe();
    this.apDownloading_sub.unsubscribe();
    this.ytReady_sub.unsubscribe();
    this.ytCurPos_sub.unsubscribe();
    this.markerUpdate_sub.unsubscribe();
    if(typeof this.dbReady_sub != 'undefined') this.dbReady_sub.unsubscribe();

    this.yt.stopInterval();
    this.yt.destroy();
    this.ap.destroy();
    this.sel.reset();
    this.videoId="";
    this.link="";
    this.file_path="";

    // this.yt.removeApiFromDom();
  }

  loadFromModel(data){
    if(!data)return;

    let yt_load = this.sm.getYoutube();
    // console.log("yt_loadddddd------------------- => ",yt_load);
    this.file_path = yt_load.filePath;
    this.link = yt_load.link;
    this.videoId = yt_load.videoId;
    // this.yt.changeVideoUrl(this.link);
  }

  apiReady(data){
    if(data == false)return;
    // console.log("apiReady setting video : ");
    this.yt.createVideo(this.link);
  }

  videoReady(data){
    if(data == false)return;
    this.yt.stopVideo();
    // console.log("videoReady------------:\n"+data);
  }

  resetAllRegionsFromModel(){
    console.log('resetAllRegionsFromModel');
    
    if((this.sm.getParts().length) 
      && (this.sm.getParts()[0].getMeasures().length) 
      && (this.sm.getParts()[0].getMeasure(0).getBeats().length)
      && this.sm.getParts()[0].getMeasure(0).getBeat(0).audioRegion.end)
      this.ap.setBeatsRegions();
    else
      this.ap.resetAllRegionsFromModel();
      
    this.drag_toggle(false);
  }

  waveReady(data){
    if(data == false)return;
    this.zone.run(()=>{
      this.loading_wheel = false;
      this.audio_loaded = true;
      this.file_path = this.ap.getFilePath();



      this.resetAllRegionsFromModel();
      // this.setAllBeatsFromModel();
      if(this.sm.getParts().length && this.sm.getPart(0).getMeasure(0))

      this.sel.setSelection( [this.sm.getPart(0).getMeasure(0)] );
      $(".youtube-audio-container").focus();
    });
    // console.log("waveReady------------");

    this.sm.setYoutube({link:this.link, videoId: this.yt.videoId, filePath:this.file_path}); 

    setTimeout(()=>{  //cant see better way than to wait for youtube to be ready...
      this.ap.bindClick(()=>{
        let yt_state = this.yt.getPlayerState();

        // console.log('AUDIO PLAYER bindClick YT_state='+yt_state);
        // console.log('this.yt.playerState => ',this.yt.playerState);
        if(this.link == '')return;

        if(yt_state == 1 && !this.ap.isPlaying()){
          // this.ap.pause();
          // this.yt.seekTo(this.ap.getCurrentTime());

       }else if(yt_state == 2 ){
          this.yt.seekTo(this.ap.getCurrentTime());
       }else if(( yt_state == 1) && ( this.ap.isPlaying() )){
          this.ap.pause();
          this.yt.seekTo(this.ap.getCurrentTime());
       }else if( yt_state==1 || yt_state==3 ){
         this.ap.pause();
         this.yt.seekTo(this.ap.getCurrentTime());
       }
      });
    },2000) 

    this.stretch = this.ap.getStretch();
  }

  stopAudio() {
    this.ap.stop();
    this.playerState = 3;
    this.yt.stopVideo();
    this.tp.reset();
  }

  resumeAudio() {
    this.ap.play();
    this.yt.resumeVideo();
    this.playerState = 1;
  }

  pauseAudio() {
    this.ap.pause();
    this.yt.pauseVideo();
    this.playerState = 2;
  }

  playPause(){
    this.ap.playPause();
    
    if( this.ap.isPlaying() ){
      this.yt.resumeVideo();
      this.playerState = 1
    }else{
      this.playerState = 2;
      this.yt.pauseVideo();
    }
    // if( !this.ap.isPlaying() ) this.dm.renderMarker({operation:'refresh'}); //refresh on pause
  }

  button_clicked(){
    let id = (new URL(this.link)).searchParams.get('v');
      if(id == '')
        throw "Youtube component : button_clicked() => no v parameter in url !";
 
    this.videoId = id;      
    this.yt.changeVideoUrl(this.link);
    this.ap.getMp3(this.link);
  }


  public addNextRegion(){
    
    console.log('this.tp.getMeasure()+1 => ',this.tp.getMeasure());
    let next;
    let sel = this.sel.getSelection()[0];

    if(sel) next = this.sm.addNextRegion(this.sel.getSelection()[0].getIdx(), this.ap.getCurrentTime(), false);
    console.log('next => ',next);

    if(next && this.sm.getNextMeasureById(next.id)) {
      next['measure_nb'] = next.id;
      this.dm.renderFromModel();
      console.log('next => ',next);
      // let sel_id = this.sm.getMeasureById(next.id)[0].getId();
      if(this.stretch) this.ap.stretchUpdate([next.id,this.sm.getNextMeasureById(next.id).getId()]);
    }
    // this.resetAllRegionsFromModel();
    this.ap.addRegion( next );
  }

  public addPartAfter(idx:number){
    console.log('addPartAfter !!!!!!!!!!!!!!');
    let b = new Beat();
    let m = new Measure();
    m.addBeat(b);
    let p = new Part();
    p.addMeasure(m);
    m.setAudioRegion({start:this.ap.getCurrentTime(),end:this.ap.getCurrentTime()+1});

    this.sm.insertPartAfter(idx,p);
    this.dm.renderMarker({operation:'refresh'});
    this.dm.renderFromModel();
  }


  public addNextPart(){

    if(this.ap.getCurrentRegion() != null && !this.ap.getState()){

      this.sm.transformMeasureInPart(this.ap.getCurrentRegion().id);
      this.dm.renderFromModel();
      this.dm.renderMarker({operation:'refresh'});

    }else{

      let next;
      let sel = this.sel.getSelection()[0];
      if( sel ) next = this.sm.addNextPart(sel.getIdx(), this.ap.getCurrentTime());
      else{
        console.warn('No selection');
        // next = this.sm.addNextPart(0, this.player.getCurrentTime()); 
        if(!this.sm.getParts().length)this.addPartAfter(0);
      }

      if(next) {
        this.dm.renderFromModel();
        console.log('next => ',next);
        this.ap.addRegion( next );
        let sel_idx = this.sel.getSelection()[0].getIdx();
        if(this.stretch) this.ap.stretchUpdate([sel_idx,this.sm.getNextMeasureById(sel_idx).getIdx()]);


      }
    }
  }

  toggle_edit(){
    this.edit = !this.edit;
    this.hide_region_visibility();
  }

  hide_region_visibility(){
    if(this.edit)
      $('region.wavesurfer-region').show();
    else
      $('region.wavesurfer-region').hide();
  }

  deleteSelectedRegion(){
    console.log('deleteSelectedRegion');
    let m = this.sel.getSelection();
    if(!m.length)return;

    // DELETE MEASURE IN MODEL
    this.sm.deleteMeasuresByIds([m[0].getIdx()]);
    // DELETE MEASURE AUDIO REGION
     this.resetAllRegionsFromModel();


    // SELECT PREVIOUS MEASURE
    this.tp.reset();
    this.dm.renderFromModel();
  }

  deleteSelectedPart(){
    console.log('deleteSelectedPart');
    let m = this.sel.getSelection();
    if(!m.length)return;


    let h = this.sm.getMeasures_hash(); 
    if( !Object.keys( h ).length ){
      console.warn('error : cant delete selected part. No parts left to delete ?');
      return;
    }
    let p_nb = h[m[0].getIdx()].part-1;
    console.log('p_nb => ',p_nb);

    // DELETE PART IN MODEL
    this.sm.deletePart(p_nb);
    // DELETE PART AUDIO REGIONS
    this.resetAllRegionsFromModel();

    this.tp.reset();
    this.dm.renderFromModel();

    // SELECT PREVIOUS PART BEGINING
    setTimeout(()=>{
      let prev  = p_nb ;
      if( this.sm.getPart(prev) ) this.sel.select_part( prev );
      else if( this.sm.getPart(prev-1) ) this.sel.select_part( prev-1 );
      else if( this.sm.getParts().length ) this.sel.select_part( 0 );
    }, 100);

  }

  deleteRegion(id:number){
    this.ap.deleteRegion( id );
    this.tp.reset();
  }

  drag_toggle(p){
    // if(!p) this.drag = !this.drag;
    this.drag = p;

    this.ap.dragToggle(this.drag);

    // IMPORTANT FOR SCROLLING WAVE ON CELL
    if(p == true) $('region.wavesurfer-region').css('pointer-events','all');
    
    else $('region.wavesurfer-region').css('pointer-events','all');

  }

  keyPressed(e:any,on:boolean){

    e.stopPropagation();
    if(!e.path || e.path[0].tagName == "INPUT")return;

    this.drag_toggle(on);
  }

  updateRepeat(){
    this.ap.updateRepeat({active:this.repeat.active as boolean,start:this.repeat.start, end:this.repeat.end});
  }

  setRepeatPart(){

    let m = this.tp.getMeasure();

    let H = this.sm.getMeasures_hash();

    if(H.hasOwnProperty(m) == false)return;

    this.repeat.active=true;

    let P = H[m].part;
    let part = this.sm.getPart(P);
    let part_measures = part.getMeasures();
    for(let i = 0 ; i < part_measures.length; i++){
      let r = part_measures[i].getAudioRegion();
      if( r!=null){
        this.repeat.start = part_measures[i].getIdx();
        break;
      }
    }
    for(let i = part_measures.length-1 ; i >= 0 ; i--){

      let r = part_measures[i].getAudioRegion();
      if( r!=null){
        this.repeat.end = part_measures[i].getIdx();
        break;
      }
    }

    this.updateRepeat();
  }

  skip(sec:number){
    // console.log('skip');
    this.yt.seekTo( this.ap.getCurrentTime()+sec );
    this.ap.skip(sec);
  }

  changePlaybackRate(x:number){
    this.playback_rate = x;
    this.ap.setPlaybackRate(this.playback_rate);
  }

  updateGhost(){
    this.ap.switchGhost(this.ghost); 
  }

  updateStretch(){
    this.ap.setStretch(this.stretch);
  }

  toggleFollow(){
    this.follow = !this.follow;
    this.ap.follow(this.follow);
    this.cm.setFollow(this.follow);
  }

  toggleCenter(){
    this.center = !this.center;
    console.log("this.center => ",this.center);
    this.cm.setAutoScroll(this.center);
  }

  set_volume(){
    this.ap.setVolume(this.volume);
  }

  focus(e):void{
    e.target.focus();
  }

  private init_bindings():void{

    this.binding$ = this.keys.match( [ KEYS.LEFT_ARROW, KEYS.RIGHT_ARROW, KEYS.UP_ARROW, KEYS.DOWN_ARROW, KEYS.M, KEYS.P, KEYS.DELETE, KEYS.SPACE, KEYS.TAB ] , 
                                    []).subscribe((event) => {
    let e:any= event;
    //======================================
    //FOR NOW CHECK IF WE ARE ON THE SONG SCREEN
    let inEditor = $(document.activeElement).parents('.song').length || $(document.activeElement).hasClass('song');
    if(!inEditor) return;  
    if(e.target.tagName == "INPUT")return;
    // e.stopPropagation();
    // e.preventDefault();
    //=======================================

    e.stopPropagation();
    e.preventDefault();

    switch(e.keyCode){
      case KEYS.LEFT_ARROW :
        this.skip(-1);
      break;
      case KEYS.RIGHT_ARROW :
        this.skip(1);
      break;
      case KEYS.UP_ARROW :

        if(e.shiftKey && !e.ctrlKey) {
          
          // go back one part
          let m = this.sel.select_previous_part();
          if(!m)return;
          let pos = m.getAudioRegion().start;
          this.ap.setCurrentTime( pos );
          if(this.ap.isPlaying())this.ap.play();

        }else if(e.shiftKey && e.ctrlKey){
          
          // get back at the begining of the score
          let m = this.sel.select_first_measure();
          if(!m)return;
          let pos = m.getAudioRegion().start;
          this.ap.setCurrentTime( pos );
          if(this.ap.isPlaying())this.ap.play(); 

        } else {
          
          // go back one measure
          let m;
          if(!this.sel.getSelection()[0])return;
          // console.log('this.sel.getSelection()[0] => ',this.sel.getSelection()[0]);
          if( this.ap.getCurrentTime() > this.sel.getSelection()[0].getAudioRegion().start+0.5  ){
            m = this.sel.getSelection()[0];
          } else{
            m = this.sel.select_previous_measure();
          }
          if(!m)return;
          let pos = m.getAudioRegion().start;

          this.ap.setCurrentTime( pos );
          this.yt.seekTo( pos );
          // if(this.ap.isPlaying())this.ap.play();
        }
      break;
      case KEYS.DOWN_ARROW :

        if(e.shiftKey){ // SELECTS NEXT PART
          let m = this.sel.select_next_part();
          if(!m)return;
          let pos = m.getAudioRegion().start;
          
          this.ap.pause();
          this.ap.setCurrentTime( pos );
          this.yt.seekTo(pos); 
          if(this.ap.isPlaying())this.ap.play();
          
        }else {
          let m = this.sel.select_next_measure();
          if(!m)return;
          let pos = m.getAudioRegion().start;

          this.ap.setCurrentTime( pos );
          this.yt.seekTo(pos);
          // if(this.ap.isPlaying())this.ap.play();

        }

      break;


      case KEYS.M :
        this.addNextRegion();
      break;


      case KEYS.P : 
        this.addNextPart();
      break;



      case KEYS.DELETE : 

        let last_deleted_measure = this.sel.deleteSelection();

        this.dm.renderFromModel();
        this.resetAllRegionsFromModel();

        if(!last_deleted_measure){
          this.sel.setSelection([]);
          return;
        }
        let part;
        let measure;

        setTimeout(()=>{
          this.ap.align_cursor_on_selection();
        }, 20);
      break;

      case KEYS.SPACE :
        if(e.shiftKey){
          
        if( this.ap.isPlaying() ){
         this.playPause(); 
        }else{
          let sel = this.sel.getSelection();
          if( sel[0].getType() == 'measure' ) this.ap.playMeasure(sel[0].getIdx());
        }

        }else{

          this.playPause();
        }

      break;

    }

    });


  }

  show_volume(show){
    if(show)
      $('.vol').css('display', 'block')
    else
      $('.vol').css('display', 'none')
  }

  show_m_volume(show){
    if(show)
      $('.m-vol').css('display', 'block')
    else
      $('.m-vol').css('display', 'none')
  }

  public changeVisibility(){
    this.visible = !this.visible;
  }


  public change_displayed_chord(valeur: Array<any>):void{

    if(!valeur['chords'].length || valeur['full_chord'].empty){
      this.displayed_chord = ' ';
      return;
    } 

    this.displayed_chord = valeur['chords'][0];
  }

  public setAllMeasuresFromModel(){

    // this.beatC.setAllBeatsFromModel();
    this.ap.setMeasuresRegions();
    this.ap.refreshRegions();
  }

  public setAllBeatsFromModel(){

    this.ap.clearRegions_Beats();       // clear previous regions
    this.beatC.setAllBeatsFromModel();  // calls beat computing service to set all the beats
    this.ap.setBeatsRegions();          // update the audio player regions
    this.ap.refreshRegions();           // refresh the audio player regions display

  }
}



