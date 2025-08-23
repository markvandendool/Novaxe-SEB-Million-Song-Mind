import { Component, OnInit, AfterViewInit, OnDestroy, NgZone, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs';

import { Songmodel } from '@models/songmodel/songmodel';
import { ConfigModel } from '@models/configmodel/configModel';
import { DisplayService } from '@services/display/displayService';
import { YoutubeService, MediaSource } from '@services/youtube-service/youtube.service';
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
    styleUrls: ['./youtube-audio.component.scss'],
    standalone: false
})
export class YoutubeAudioComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() set display(val:boolean){
    this.visible = val;
  }
  @Output() showVideoCard = new EventEmitter<void>();
  
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

  // File upload properties
  public currentMediaSource: MediaSource | null = null;
  public uploadedFileName: string = '';
  public showFileUpload: boolean = false;

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
    this.loadFromModel(true);
  }

  ngOnInit() {
    console.log('🎬 ngOnInit started');
    
    // Initialize keyboard bindings for shortcuts (M, P, etc.)
    this.init_bindings();
    
    // Set up AudioPlayer subscriptions
    this.apReady_sub = this.ap.ready.subscribe((data) => {
      console.log('🎵 AudioPlayer ready:', data);
      this.waveReady(data);
    });
    
    this.dbReady_sub = this.ap.db_ready.subscribe((data) => {
      console.log('🗄️ Database ready:', data);
    });
    
    this.apDownloading_sub = this.ap.downloaded.subscribe((data) => {
      console.log('⬇️ Audio download status:', data);
    });
    
    // Set up YouTube service subscriptions
    this.ytReady_sub = this.yt.ready.subscribe((data) => {
      console.log('🌐 YouTube ready:', data);
      this.videoReady(data);
    });
    
    this.ytCurPos_sub = this.yt.curPos.subscribe((data) => {
      console.log('⏱️ YouTube current position:', data);
      this.zone.run(() => {
        if (typeof data === 'number') {
          this.playerState = 1; // Playing
        } else if (data === 'play') {
          this.playerState = 1; // Playing
        } else if (data === 'pause') {
          this.playerState = 2; // Paused
        } else if (data === 'stop') {
          this.playerState = 0; // Stopped
        }
      });
    });
    
    console.log('✅ ngOnInit completed');
  }
  
  ngAfterViewInit(){
    console.log('🎬 ngAfterViewInit started');
    this.yt.addApiToDom();
    this.ap.createFromHtmlElements('#waveform','#wave-timeline');
    this.set_volume();
    console.log('✅ ngAfterViewInit completed');
  }

  ngOnDestroy(){
    console.log('🗑️ ngOnDestroy started');
    
    // Stop time synchronization
    this.stopTimeSynchronization();
    
    // Clean up keyboard bindings
    if (this.binding$) this.binding$.unsubscribe();
    if (this.binding_shift$) this.binding_shift$.unsubscribe();
    
    // Clean up subscriptions
    if (this.apReady_sub) this.apReady_sub.unsubscribe();
    if (this.dbReady_sub) this.dbReady_sub.unsubscribe();
    if (this.apDownloading_sub) this.apDownloading_sub.unsubscribe();
    if (this.ytReady_sub) this.ytReady_sub.unsubscribe();
    if (this.ytCurPos_sub) this.ytCurPos_sub.unsubscribe();
    if (this.apiReady_sub) this.apiReady_sub.unsubscribe();
    if (this.markerUpdate_sub) this.markerUpdate_sub.unsubscribe();
    
    this.yt.destroy();
    console.log('✅ ngOnDestroy completed');
  }

  onFileSelected(event: any) {
    console.log('📁 File selected:', event.target.files[0]?.name);
    const file = event.target.files[0];
    if (file) {
      this.handleFileUpload(file);
    }
    // Reset the input
    event.target.value = '';
  }

  handleFileUpload(file: File) {
    console.log('🚀 Loading file:', file.name);
    try {
      this.loading_wheel = true;
      this.uploadedFileName = file.name;
      
      // Create media source for YoutubeService
      const mediaSource = this.yt.handleFileUpload(file);
      this.currentMediaSource = mediaSource;
      
      // Load media using the updated service for playback control
      this.yt.loadMedia(mediaSource);
      
      // Load the same file through AudioPlayer to generate waveform
      this.ap.load_blob(file, `local://${file.name}`);
      
      // Update the link display for local files
      this.link = `local://${file.name}`;
      this.videoId = '';
      
      // Hide file upload interface
      this.showFileUpload = false;
      
      console.log(`✅ Loaded ${mediaSource.type}: ${file.name}`);
      
    } catch (error) {
      console.error('❌ Error loading file:', error);
      alert(error.message || 'Error loading file. Please try again.');
      this.loading_wheel = false;
    }
  }

  handleYouTubeUrl(url: string) {
    console.log('🚀 Loading YouTube URL:', url);
    try {
      this.loading_wheel = true;
      this.uploadedFileName = '';
      
      // Create media source
      const mediaSource = this.yt.handleYouTubeUrl(url);
      this.currentMediaSource = mediaSource;
      
      // Load media using the updated service for playback control
      this.yt.loadMedia(mediaSource);
      
      // Load the same URL through AudioPlayer to generate waveform
      this.ap.getMp3(url);
      
      // Update the link display
      this.link = url;
      this.videoId = (new URL(url)).searchParams.get('v') || '';
      
      console.log(`✅ Loaded YouTube video: ${this.videoId}`);
      
    } catch (error) {
      console.error('❌ Error loading YouTube URL:', error);
      alert(error.message || 'Error loading YouTube URL. Please check the URL and try again.');
      this.loading_wheel = false;
    }
  }

  toggleFileUpload() {
    this.showFileUpload = !this.showFileUpload;
    console.log('📁 File upload interface toggled:', this.showFileUpload);
  }

  clearCurrentMedia() {
    console.log('🗑️ Clearing current media');
    this.currentMediaSource = null;
    this.uploadedFileName = '';
    this.link = '';
    this.videoId = '';
    this.yt.destroy();
    console.log('✅ Current media cleared');
  }

  loadFromModel(data){
    console.log('📋 loadFromModel called with data:', data);
    if(!data)return;

    let yt_load = this.sm.getYoutube();
    console.log('📋 YouTube data from model:', yt_load);
    this.file_path = yt_load.filePath;
    this.link = yt_load.link;
    this.videoId = yt_load.videoId;
    console.log('📋 Loaded from model - file_path:', this.file_path, 'link:', this.link, 'videoId:', this.videoId);

    // Actually load the media
    if (this.link && this.link.trim()) {
      console.log('🌐 Loading YouTube video from link:', this.link);
      this.yt.createVideo(this.link);
      this.yt.currentMediaSource = { type: 'youtube', url: this.link, videoId: this.videoId };
      
      // Load the audio file for WaveSurfer
      console.log('🎵 Loading audio from YouTube for WaveSurfer');
      this.ap.getAudioFromYoutube(this.link);
      
      // Emit event to show the video card so the player element becomes visible
      setTimeout(() => {
        console.log('🎬 Emitting showVideoCard event');
        this.showVideoCard.emit();
      }, 200); // Delay to ensure YouTube service has processed the video
    } else if (this.file_path && this.file_path.trim()) {
      console.log('🎵 Loading audio file from path:', this.file_path);
      // For audio files, we don't need to show the video card
      this.yt.currentMediaSource = { type: 'local-mp3', url: this.file_path };
      // Load the audio file directly
      this.ap.load(this.file_path);
    }
  }

  apiReady(data){
    console.log('🔌 apiReady called with data:', data);
    if(data == false)return;
    console.log('🔌 Creating video with link:', this.link);
    this.yt.createVideo(this.link);
  }

  videoReady(data){
    console.log('📺 videoReady called with data:', data);
    if(data == false)return;
    console.log('⏹️ Stopping video');
    this.yt.stopVideo();
  }

  resetAllRegionsFromModel(){
    console.log('🔄 resetAllRegionsFromModel called');
    
    if((this.sm.getParts().length) 
      && (this.sm.getParts()[0].getMeasures().length) 
      && (this.sm.getParts()[0].getMeasure(0).getBeats().length)
      && this.sm.getParts()[0].getMeasure(0).getBeat(0).audioRegion.end) {
      console.log('🎵 Setting beats regions');
      this.ap.setBeatsRegions();
    } else {
      console.log('🎵 Resetting all regions from model');
      this.ap.resetAllRegionsFromModel();
    }
      
    this.drag_toggle(false);
  }

  waveReady(data){
    console.log('🌊 waveReady called with data:', data);
    if(data == false)return;
    this.zone.run(()=>{
      console.log('⏳ Setting loading_wheel to false');
      this.loading_wheel = false;
      console.log('✅ Setting audio_loaded to true');
      this.audio_loaded = true;
      this.file_path = this.ap.getFilePath();
      console.log('📁 File path from audio player:', this.file_path);

      this.resetAllRegionsFromModel();
      if(this.sm.getParts().length && this.sm.getPart(0).getMeasure(0))
        this.sel.setSelection( [this.sm.getPart(0).getMeasure(0)] );
      $(".youtube-audio-container").focus();
    });

    this.sm.setYoutube({link:this.link, videoId: this.yt.videoId, filePath:this.file_path}); 

    // Set up comprehensive synchronization
    setTimeout(()=>{
      console.log('🔗 Setting up audio synchronization');
      this.setupAudioSynchronization();
    }, 1000);

    this.stretch = this.ap.getStretch();
  }

  // Set up two-way synchronization between YouTube and WaveSurfer
  setupAudioSynchronization() {
    console.log('🔗 Setting up audio synchronization');
    
    // Bind WaveSurfer click events to sync with YouTube
    this.ap.bindClick(()=>{
      let yt_state = this.yt.getPlayerState();
      console.log('🎮 WaveSurfer clicked, YouTube state:', yt_state);

      if(this.link == '') return;

      // Only sync YouTube position to WaveSurfer, don't play YouTube audio
      if(yt_state == 1 && !this.ap.isPlaying()){
        // YouTube is playing but WaveSurfer is not - start WaveSurfer only
        this.ap.play();
      } else if(yt_state == 2 ){
        // YouTube is paused - seek YouTube to WaveSurfer position
        this.yt.seekTo(this.ap.getCurrentTime());
      } else if(( yt_state == 1) && ( this.ap.isPlaying() )){
        // Both are playing - pause WaveSurfer and sync YouTube
        this.ap.pause();
        this.yt.seekTo(this.ap.getCurrentTime());
      } else if( yt_state==1 || yt_state==3 ){
        // YouTube is playing or buffering - pause WaveSurfer and sync
        this.ap.pause();
        this.yt.seekTo(this.ap.getCurrentTime());
      }
    });

    // Set up WaveSurfer play/pause event listeners
    if (this.ap.ws) {
      this.ap.ws.on('play', () => {
        console.log('🎵 WaveSurfer play event');
        // Only seek YouTube to current position, don't play YouTube audio
        this.yt.seekTo(this.ap.getCurrentTime());
      });

      this.ap.ws.on('pause', () => {
        console.log('⏸️ WaveSurfer pause event');
        // Only seek YouTube to current position, don't pause YouTube audio
        this.yt.seekTo(this.ap.getCurrentTime());
      });

      this.ap.ws.on('seek', (position: number) => {
        console.log('🔍 WaveSurfer seek event to:', position);
        this.yt.seekTo(position);
      });
    }

    // Start time synchronization
    this.startTimeSynchronization();
  }

  // Keep YouTube and WaveSurfer time synchronized
  startTimeSynchronization() {
    console.log('⏱️ Starting time synchronization');
    
    // Clear any existing interval
    if (this.interval) {
      clearInterval(this.interval);
    }

    // Check synchronization every 2 seconds
    this.interval = setInterval(() => {
      if (this.ap.isPlaying()) {
        const ytTime = this.yt.getCurrentTime();
        const wsTime = this.ap.getCurrentTime();
        const timeDiff = Math.abs(ytTime - wsTime);
        
        // If time difference is more than 0.5 seconds, sync YouTube to WaveSurfer
        if (timeDiff > 0.5) {
          console.log(`🔄 Time sync needed: YouTube=${ytTime.toFixed(2)}s, WaveSurfer=${wsTime.toFixed(2)}s, diff=${timeDiff.toFixed(2)}s`);
          
          // Use WaveSurfer time as the source of truth
          this.yt.seekTo(wsTime);
        }
      }
    }, 2000);
  }

  stopTimeSynchronization() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('⏱️ Time synchronization stopped');
    }
  }

  stopAudio() {
    console.log('⏹️ Stopping audio');
    this.ap.stop();
    // Only seek YouTube to beginning, don't stop it
    this.yt.seekTo(0);
  }

  resumeAudio() {
    console.log('▶️ Resuming audio');
    this.ap.play();
    // Only seek YouTube to current position, don't play it
    this.yt.seekTo(this.ap.getCurrentTime());
  }

  pauseAudio() {
    console.log('⏸️ Pausing audio');
    this.ap.pause();
    // Only seek YouTube to current position, don't pause it
    this.yt.seekTo(this.ap.getCurrentTime());
  }

  playPause() {
    console.log('🎮 Play/Pause toggled');
    if (this.ap.isPlaying()) {
      this.pauseAudio();
    } else {
      this.resumeAudio();
    }
  }

  button_clicked(button: string) {
    console.log('🔘 Button clicked:', button);
    switch (button) {
      case 'play':
        this.playPause();
        break;
      case 'stop':
        this.stopAudio();
        break;
      case 'skip_forward':
        this.skip(10);
        break;
      case 'skip_backward':
        this.skip(-10);
        break;
      default:
        console.log('Unknown button:', button);
    }
  }

  loadYouTubeUrl() {
    console.log('🔗 Loading YouTube URL:', this.link);
    if (this.link && this.link.trim()) {
      this.handleYouTubeUrl(this.link.trim());
    } else {
      console.log('❌ No URL provided');
    }
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
      if(this.stretch) this.ap.stretchUpdate([next.id,this.sm.getNextMeasureById(next.id).getId()]);
    }
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

    this.sm.deleteMeasuresByIds([m[0].getIdx()]);
    this.resetAllRegionsFromModel();

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

    this.sm.deletePart(p_nb);
    this.resetAllRegionsFromModel();

    this.tp.reset();
    this.dm.renderFromModel();

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
    this.drag = p;
    this.ap.dragToggle(this.drag);

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
    this.yt.skip(sec);
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
    
    // More permissive focus check - allow shortcuts when on song page
    let inEditor = $(document.activeElement).parents('.song').length || 
                   $(document.activeElement).hasClass('song') ||
                   $(document.activeElement).parents('app-song').length ||
                   window.location.pathname.includes('/score/');
    
    if(!inEditor) return;  
    if(e.target.tagName == "INPUT")return;

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
          let m = this.sel.select_previous_part();
          if(!m)return;
          let pos = m.getAudioRegion().start;
          this.ap.setCurrentTime( pos );
          if(this.ap.isPlaying())this.ap.play();
        }else if(e.shiftKey && e.ctrlKey){
          let m = this.sel.select_first_measure();
          if(!m)return;
          let pos = m.getAudioRegion().start;
          this.ap.setCurrentTime( pos );
          if(this.ap.isPlaying())this.ap.play(); 
        } else {
          let m;
          if(!this.sel.getSelection()[0])return;
          if( this.ap.getCurrentTime() > this.sel.getSelection()[0].getAudioRegion().start+0.5  ){
            m = this.sel.getSelection()[0];
          } else{
            m = this.sel.select_previous_measure();
          }
          if(!m)return;
          let pos = m.getAudioRegion().start;
          this.ap.setCurrentTime( pos );
          this.yt.seekTo( pos );
        }
      break;
      case KEYS.DOWN_ARROW :
        if(e.shiftKey){
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
        }
      break;
      case KEYS.M :
        console.log('🎵 M key pressed - adding next region');
        this.addNextRegion();
      break;
      case KEYS.P : 
        console.log('🎵 P key pressed - adding next part');
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
    this.ap.setMeasuresRegions();
    this.ap.refreshRegions();
  }

  public setAllBeatsFromModel(){
    this.ap.clearRegions_Beats();
    this.beatC.setAllBeatsFromModel();
    this.ap.setBeatsRegions();
    this.ap.refreshRegions();
  }
}



