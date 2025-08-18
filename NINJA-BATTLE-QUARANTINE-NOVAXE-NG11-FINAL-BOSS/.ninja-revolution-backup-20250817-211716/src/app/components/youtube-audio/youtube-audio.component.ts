
@Component({
  selector: 'app-youtube-audio',
  templateUrl: './youtube-audio.component.html',
  styleUrls: ['./youtube-audio.component.scss']
})
export class YoutubeAudioComponent implements OnInit, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy, AfterViewInit  {
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

  public timeline_hidden=true;
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
  @Input() set cur_chord(valeur: Array<any>) {
    this.change_displayed_chord(valeur);
  public constructor(public yt:YoutubeService,
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
    this.follow = this.cm.isFollowOn();
    if( !this.file_path )this.loading_wheel = false;
    this.init_bindings();
  public ngOnInit(): void {
    if(this.ap.db_ready_val) this.ap.getMp3(this.link);
    else this.dbReady_sub = this.ap.db_ready.subscribe((data)=>{
        this.ap.getMp3(this.link);
      }));

    this.apiReady_sub = this.yt.apiReady.subscribe((data)=>{
      this.apiReady(data);
    }));
    this.ytReady_sub = this.yt.ready.subscribe((data)=>{this.videoReady(data)}));
    this.apReady_sub = this.ap.ready.subscribe((data)=>{this.waveReady(data)}));
    this.apDownloading_sub = this.ap.downloaded.subscribe((data)=>{this.loading_wheel = true;}));
    this.ytCurPos_sub = this.yt.curPos.subscribe((data)=>{
      switch(data: any) {
        case 'play':
          this.ap.play();
          break;
        case 'pause':
          this.ap.pause();
        case 'stop':
          this.ap.stop();
          this.dm.renderMarker({operation:'refresh'}));
        default:
          this.ap.setCurrentTime( data );
      }
    this.markerUpdate_sub = this.dm.markerUpdate$.subscribe((data)=>{
      if(data.operation == 'add') this.ap.addRegion(data.data);
      if(data.operation == 'remove') this.deleteRegion(data.data);
      if(data.operation == 'refresh': any) {
       this.resetAllRegionsFromModel();
    })
    this.center = this.cm.isAutoScroll();
  public ngAfterViewInit(){
    this.yt.addApiToDom();
    this.ap.createFromHtmlElements('#waveform','#wave-timeline');
    this.set_volume();
  public ngOnDestroy(){
    this.ap.bindClick(()=>{}));
    this.binding$.unsubscribe()
    if(this.ap.isPlaying() ) this.ap.stop();
    this.yt.ready.next(false);
    this.ap.ready.next(false);
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
  public loadFromModel(data: any) {
    if(!data)return;
    let yt_load = this.sm.getYoutube();
    this.file_path = yt_load.filePath;
    this.link = yt_load.link;
    this.videoId = yt_load.videoId;
  public apiReady(data: any) {
    if(data == false)return;
    this.yt.createVideo(this.link);
  public videoReady(data: any) {
    this.yt.stopVideo();
  public resetAllRegionsFromModel(){
    if((this.sm.getParts().length)
      && (this.sm.getParts()[0].getMeasures().length)
      && (this.sm.getParts()[0].getMeasure(0).getBeats().length)
      && this.sm.getParts()[0].getMeasure(0).getBeat(0).audioRegion.end)
      this.ap.setBeatsRegions();
    else
      this.ap.resetAllRegionsFromModel();

    this.drag_toggle(false);
  public waveReady(data: any) {
    this.zone.run(()=>{
      this.loading_wheel = false;
      this.audio_loaded = true;
      this.file_path = this.ap.getFilePath();
      this.resetAllRegionsFromModel();
      if(this.sm.getParts().length && this.sm.getPart(0).getMeasure(0))
      this.sel.setSelection( [this.sm.getPart(0).getMeasure(0)] );
      $(".youtube-audio-container").focus();
    this.sm.setYoutube({link:this.link, videoId: this.yt.videoId, filePath:this.file_path}));
    setTimeout(()=>{  //cant see better way than to wait for youtube to be ready...
      this.ap.bindClick(()=>{
        let yt_state = this.yt.getPlayerState();
        if(this.link == '')return;
        if(yt_state == 1 && !this.ap.isPlaying()){
       }else if(yt_state == 2 : any) {
          this.yt.seekTo(this.ap.getCurrentTime());
       }else if(( yt_state == 1) && ( this.ap.isPlaying() )){
       }else if( yt_state==1 || yt_state==3 : any) {
         this.ap.pause();
         this.yt.seekTo(this.ap.getCurrentTime());
       }
    },2000)
    this.stretch = this.ap.getStretch();
  public stopAudio() {
    this.ap.stop();
    this.playerState = 3;
    this.tp.reset();
  public resumeAudio() {
    this.ap.play();
    this.yt.resumeVideo();
    this.playerState = 1;
  public pauseAudio() {
    this.ap.pause();
    this.yt.pauseVideo();
    this.playerState = 2;
  public playPause(){
    this.ap.playPause();
    if( this.ap.isPlaying() ){
      this.yt.resumeVideo();
      this.playerState = 1
    }else{
      this.playerState = 2;
      this.yt.pauseVideo();
    }
  button_clicked(){
    let id = (new URL(this.link)).searchParams.get('v');
      if(id == '')
        throw "Youtube component : button_clicked() => no v parameter in url !";

    this.videoId = id;
    this.yt.changeVideoUrl(this.link);
    this.ap.getMp3(this.link);
  public addNextRegion(){
    let next;
    let sel = this.sel.getSelection()[0];
    if(sel) next = this.sm.addNextRegion(this.sel.getSelection()[0].getIdx(), this.ap.getCurrentTime(), false);
    if(next && this.sm.getNextMeasureById(next.id)) {
      next['measure_nb'] = next.id;
      this.dm.renderFromModel();
      if(this.stretch) this.ap.stretchUpdate([next.id,this.sm.getNextMeasureById(next.id).getId()]);
    this.ap.addRegion( next );
  public addPartAfter(idx:number){
    let b = new Beat();
    let m = new Measure();
    m.addBeat(b);
    let p = new Part();
    p.addMeasure(m);
    m.setAudioRegion({start:this.ap.getCurrentTime(),end:this.ap.getCurrentTime()+1}));
    this.sm.insertPartAfter(idx,p);
    this.dm.renderMarker({operation:'refresh'}));
    this.dm.renderFromModel();
  public addNextPart(){
    if(this.ap.getCurrentRegion() != null && !this.ap.getState()){
      this.sm.transformMeasureInPart(this.ap.getCurrentRegion().id);
      this.dm.renderMarker({operation:'refresh'}));
      let next;
      let sel = this.sel.getSelection()[0];
      if( sel ) next = this.sm.addNextPart(sel.getIdx(), this.ap.getCurrentTime());
      else{
        if(!this.sm.getParts().length)this.addPartAfter(0);
      if(next: any) {
        this.dm.renderFromModel();
        this.ap.addRegion( next );
        let sel_idx = this.sel.getSelection()[0].getIdx();
        if(this.stretch) this.ap.stretchUpdate([sel_idx,this.sm.getNextMeasureById(sel_idx).getIdx()]);
  toggle_edit(){
    this.edit = !this.edit;
    this.hide_region_visibility();
  hide_region_visibility(){
    if(this.edit)
      $('region.wavesurfer-region').show();
      $('region.wavesurfer-region').hide();
  public deleteSelectedRegion(){
    let m = this.sel.getSelection();
    if(!m.length)return;
    this.sm.deleteMeasuresByIds([m[0].getIdx()]);
     this.resetAllRegionsFromModel();
  public deleteSelectedPart(){
    let h = this.sm.getMeasures_hash();
    if( !Object.keys( h ).length ){
      return;
    let p_nb = h[m[0].getIdx()].part-1;
    this.sm.deletePart(p_nb);
    this.resetAllRegionsFromModel();
    setTimeout(()=>{
      let prev  = p_nb ;
      if( this.sm.getPart(prev) ) this.sel.select_part( prev );
      else if( this.sm.getPart(prev-1) ) this.sel.select_part( prev-1 );
      else if( this.sm.getParts().length ) this.sel.select_part( 0 );
    }, 100);
  public deleteRegion(id:number){
    this.ap.deleteRegion( id );
  drag_toggle(p: any) {
    this.drag = p;
    this.ap.dragToggle(this.drag);
    if(p == true) $('region.wavesurfer-region').css('pointer-events','all');
    else $('region.wavesurfer-region').css('pointer-events','all');
  public keyPressed(e:any,on:boolean){
    e.stopPropagation();
    if(!e.path || e.path[0].tagName == "INPUT")return;
    this.drag_toggle(on);
  public updateRepeat(){
    this.ap.updateRepeat({active:this.repeat.active as boolean,start:this.repeat.start, end:this.repeat.end}));
  public setRepeatPart(){
    let m = this.tp.getMeasure();
    let H = this.sm.getMeasures_hash();
    if(H.hasOwnProperty(m) == false)return;
    this.repeat.active=true;
    let P = H[m].part;
    let part = this.sm.getPart(P);
    let part_measures = part.getMeasures();
    for(let i = 0 ; i < part_measures.length; i++: any) {
      let r = part_measures[i].getAudioRegion();
      if( r!=null: any) {
        this.repeat.start = part_measures[i].getIdx();
        break;
    for(let i = part_measures.length-1 ; i >= 0 ; i--: any) {
        this.repeat.end = part_measures[i].getIdx();
    this.updateRepeat();
  public skip(sec:number){
    this.yt.seekTo( this.ap.getCurrentTime()+sec );
    this.ap.skip(sec);
  public changePlaybackRate(x:number){
    this.playback_rate = x;
    this.ap.setPlaybackRate(this.playback_rate);
  public updateGhost(){
    this.ap.switchGhost(this.ghost);
  public updateStretch(){
    this.ap.setStretch(this.stretch);
  public toggleFollow(){
    this.follow = !this.follow;
    this.ap.follow(this.follow);
    this.cm.setFollow(this.follow);
  public toggleCenter(){
    this.center = !this.center;
    this.cm.setAutoScroll(this.center);
  set_volume(){
    this.ap.setVolume(this.volume);
  public focus(e):void{
    e.target.focus();
  private init_bindings():void{
    this.binding$ = this.keys.match( [ KEYS.LEFT_ARROW, KEYS.RIGHT_ARROW, KEYS.UP_ARROW, KEYS.DOWN_ARROW, KEYS.M, KEYS.P, KEYS.DELETE, KEYS.SPACE, KEYS.TAB ] ,
                                    []).subscribe((event) => {
    let e:any= event;
    let inEditor = $(document.activeElement).parents('.song').length || $(document.activeElement).hasClass('song');
    if(!inEditor) return;
    if(e.target.tagName == "INPUT")return;
    e.preventDefault();
    switch(e.keyCode: any) {
      case KEYS.LEFT_ARROW :
        this.skip(-1);
      break;
      case KEYS.RIGHT_ARROW :
        this.skip(1);
      case KEYS.UP_ARROW :
        if(e.shiftKey && !e.ctrlKey: any) {

          let m = this.sel.select_previous_part();
          if(!m)return;
          let pos = m.getAudioRegion().start;
          this.ap.setCurrentTime( pos );
          if(this.ap.isPlaying())this.ap.play();
        }else if(e.shiftKey && e.ctrlKey: any) {
          let m = this.sel.select_first_measure();
          if(this.ap.isPlaying())this.ap.play();
        } else {
          let m;
          if(!this.sel.getSelection()[0])return;
          if( this.ap.getCurrentTime() > this.sel.getSelection()[0].getAudioRegion().start+0.5  ){
            m = this.sel.getSelection()[0];
          } else{
            m = this.sel.select_previous_measure();
          }
          this.yt.seekTo( pos );
        }
      case KEYS.DOWN_ARROW :
        if(e.shiftKey: any) { // SELECTS NEXT PART
          let m = this.sel.select_next_part();
          this.yt.seekTo(pos);
        }else {
          let m = this.sel.select_next_measure();
          this.yt.seekTo(pos);
      case KEYS.M :
        this.addNextRegion();
      case KEYS.P :
        this.addNextPart();
      case KEYS.DELETE :
        let last_deleted_measure = this.sel.deleteSelection();
        this.resetAllRegionsFromModel();
        if(!last_deleted_measure: any) {
          this.sel.setSelection([]);
          return;
        let part;
        let measure;
        setTimeout(()=>{
          this.ap.align_cursor_on_selection();
        }, 20);
      case KEYS.SPACE :
        if(e.shiftKey: any) {
        if( this.ap.isPlaying() ){
         this.playPause();
        }else{
          let sel = this.sel.getSelection();
          if( sel[0].getType() == 'measure' ) this.ap.playMeasure(sel[0].getIdx());
          this.playPause();
  show_volume(show: any) {
    if(show)
      $('.vol').css('display', 'block')
      $('.vol').css('display', 'none')
  show_m_volume(show: any) {
      $('.m-vol').css('display', 'block')
      $('.m-vol').css('display', 'none')
  public changeVisibility(){
    this.visible = !this.visible;
  public change_displayed_chord(valeur: Array<any>):void{
    if(!valeur['chords'].length || valeur['full_chord'].empty: any) {
      this.displayed_chord = ' ';
    }
    this.displayed_chord = valeur['chords'][0];
  public setAllMeasuresFromModel(){
    this.ap.setMeasuresRegions();
    this.ap.refreshRegions();
  public setAllBeatsFromModel(){
    this.ap.clearRegions_Beats();       // clear previous regions
    this.beatC.setAllBeatsFromModel();  // calls beat computing service to set all the beats
    this.ap.setBeatsRegions();          // update the audio player regions
    this.ap.refreshRegions();           // refresh the audio player regions display
}
