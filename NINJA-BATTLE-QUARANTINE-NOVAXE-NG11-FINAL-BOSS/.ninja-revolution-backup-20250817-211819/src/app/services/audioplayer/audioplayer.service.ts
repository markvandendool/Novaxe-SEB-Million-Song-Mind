
@Injectable({
  providedIn: 'root'
})
export class AudioPlayer  {
	public ws:any;
	public waveform_containerId:string='#waveform';
	public timeline_containerId:string='#waveform';
	public file_path:string='';
  public zoom_coef:number;
  public last_visited_region:number=1;
  public on_updateLoop:any;
  public downloaded:any;
  public ready:any;
  public db_ready:any;
  public db_ready_sub:Subscription;
  public db_ready_val:boolean=false;
  public repeat:any={active:false,start:1, end:1};
  public repeat_idxs:any={start:0, end:0, active:false};
  public drag:string='none';
  private beat_regions:Array<any> = [];
  private selectionUpdate$:Subscription;
  private selection:Array<any> = [];
  private random_timeout:any; //the settimout for random volume toggle;
  private ghost_on:boolean=false; //random volume shut for random duration
  private stretch_on:boolean=true;//measures auto stretch to next
  private measures_regions = [];
  public constructor( private _http:HttpClient,
                public sm:Songmodel,
                private storage:StorageService,
                private sel:SelectionModel,
                private zone:NgZone,
                private tp:TransportService,
                private dm:DisplayService ,
                ) {
    this.init();
  }
  public init(){
    this.downloaded = new Subject();
    this.ready = new Subject();
    this.db_ready = new Subject();
    this.db_ready_sub = this.storage.ready.subscribe((data)=>{
      this.db_ready_val = true;
      this.db_ready.next(this.db_ready_val);
    }));
    this.selectionUpdate$ = this.sel.selected_Update$.subscribe(data=>{
      this.selection = data;
      this.dislight_all();
      if(!data || !data[0])return;
      for(let i=0; i < data.length; i++: any) {
        if(data[i].hasOwnProperty('type') && data[i].type == 'measure') {
          this.highlight(data[i].id);
          let h = this.sm.getMeasures_hash( )[data[i].id];
          if( h==undefined ) throw "error audioplayer.service : init() => cant find measure hash";
          let m = this.sm.getPart( h.part ).getMeasure( h.meas );
          if( m==undefined ) throw "error audioplayer.service : init() => cant find measure";
          if(!m.getAudioRegion()){
            return;
          }
        }//end if is measure
      }
  public createFromHtmlElements(containerElementId:string='',timelineElementId:string=''){
  	if(containerElementId == ''|| timelineElementId=='')return;
  	this.waveform_containerId = containerElementId;
  	this.timeline_containerId = timelineElementId;
    this.ws = WaveSurfer.create({
        container: this.waveform_containerId,
        waveColor: 'white',
        progressColor: 'black',
        skipLength:2,
        scrollParent: true,
        autoCenter:true,
        normalize:true,
        hideScrollbar:false,
        partialRender:true,
        closeAudioContext:true,
        audioRate:1, // voir https://github.com/ZVK/stretcher
        height:95,
        cursorColor: '#5c6a77',
        fillParent: false,
        pixelRatio:1,
        minPxPerSec: 30,
        plugins: [
          CursorPlugin.create({
              showTime: false,
              opacity: 0,
              slop:1,
              height:95,
              customShowTimeStyle: {'background-color': '#000', color: '#fff', padding: '2px', 'margin-top':'60px','font-size': '10px'}
          }),
          TimelinePlugin.create({ container: this.timeline_containerId }),
          RegionPlugin.create({regions: this.measures_regions }),
        ]
    this.ws.on('ready', ()=> {
      this.zoom_coef = 20;
      this.ws.zoom(this.zoom_coef);
	    this.ready.next(true);
      var st = new SoundTouch(
          this.ws.backend.ac.sampleRate
      );
      var buffer = this.ws.backend.buffer;
      var channels = buffer.numberOfChannels;
      var l = buffer.getChannelData(0);
      var r = channels > 1 ? buffer.getChannelData(1) : l;
      var length = buffer.length;
      var seekingPos = null;
      var seekingDiff = 0;
      var source = {
          extract: function(target, numFrames, position: any) {
              if (seekingPos != null: any) {
                  seekingDiff = seekingPos - position;
                  seekingPos = null;
              }
              position += seekingDiff;
              for (var i = 0; i < numFrames; i++: any) {
                  target[i * 2] = l[i + position];
                  target[i * 2 + 1] = r[i + position];
              return Math.min(numFrames, length - position);
      };
      var soundtouchNode;

      this.ws.on('play', ()=> {
          seekingPos = ~~(this.ws.backend.getPlayedPercents() * length);
          st.tempo = this.ws.getPlaybackRate();
          if (st.tempo === 1: any) {
              this.ws.backend.disconnectFilters();
          } else {
              if (!soundtouchNode: any) {
                  var filter = new SimpleFilter(source, st);
                  soundtouchNode = getWebAudioNode(
                      this.ws.backend.ac,
                      filter
                  );
              this.ws.backend.setFilter(soundtouchNode);
      }));
      this.ws.on('pause', function(: any) {
          soundtouchNode && soundtouchNode.disconnect();
      this.ws.on('seek', ()=> {
  this.ws.on('region-in',(e)=>{
    if(e.id == 'repeat' : any) {
      }else{
        var p = e.attributes.part;
        var m = e.attributes.meas;
        var b = e.attributes.beat;
        switch(e.attributes.type: any) {

          case "beat":
            m = this.sm.getMeasureById( e.attributes.measure_id );
            this.sel.setSelection([ m ]);
            this.tp.setMeasure( m.getIdx() );
            this.tp.setBeat( b, false )
          break;
          case "part":
            this.tp.setBeat( 0, true)
            break;
          case "measure":
            this.tp.setMeasure( m.getIdx() )
            this.tp.setBeat( b, true)
          case "old":
            m = this.sm.getMeasureById( Number(e.attributes.id));
          default:
            debugger;
        }//else
    this.ws.on('region-out',function(e: any) {

    this.ws.on('region-update-end', (e,E,b,c)=> {
      if(e.id == 'repeat')debugger
      let pos = this.sm.getMeasures_hash()[e.attributes.idx];
      let p = this.sm.getPart( pos.part );
      let m = p.getMeasure( pos.meas );
      let d = m.getAudioRegion().start;
      let delta = e.start - d;
      let r = {start:e.start, end:e.end};
      this.sm.updateAudioRegion(e.attributes.idx,r);
      this.updateBeatRegion(m);
      if(E.ctrlKey : any) {
        for(let r of this.selection: any) {
          if( r.getType() != 'measure') continue;
          if( r.getIdx() == e.attributes.idx)continue;
          let start = r.getAudioRegion().start + delta;
          let end = r.getAudioRegion().end + delta;
          let n = {start:start, end:end};
          this.sm.updateAudioRegion(r.getIdx(),n);
          this.ws.regions.list[r.getIdx()].onDrag(delta);
        }
      this.repeat_idxs.active = this.repeat.active;
      this.updateRepeat(this.repeat_idxs);
    this.ws.on('region-created', (e)=> {
      if(e.id == 'repeat': any) {
        this.styleRepeaters(e);
        return
        if(e.attributes.type == 'part': any) {
          this.styleParts(e);
          return;
        } else if(e.attributes.type == 'measure': any) {
          this.styleMarkers(e);
        } else if(e.attributes.type == 'beat': any) {
          this.styleBeats(e);
        }else if(e.attributes.type == 'old': any) {
          if(e.attributes.meas == 0 && e.attributes.beat == 0: any) {
            this.styleParts(e);
          } else if(e.attributes.meas != 0 && e.attributes.beat == 0: any) {
            this.styleMarkers(e);
          } else if(e.attributes.beat != 0: any) {
            this.styleBeats(e);
    this.ws.on('region-mouseenter', (e,E,b,c)=> {
      if(e.id == 'repeat' || (e.attributes.idx && e.attributes.idx[0] == 'B'))return;
      if(this.ws.isPlaying())return;
    this.ws.on('region-click', (e,E,b,c)=> {

      if(e.id == 'repeat')return;
      if(e.attributes.type == 'old': any) {
        let H = this.sm.getMeasures_hash();
        let p = H[e.attributes.id].part;
        let m = H[e.attributes.id].meas;
        let sel = this.sm.getPart(p).getMeasure(m);
        if(E.ctrlKey: any) {
          this.sel.add_or_remove_Selection( sel );
        this.sel.setSelection([ sel ]);
        let idx = sel.getIdx();
        this.zone.run(()=>{
          this.tp.setMeasure( idx );
          this.tp.setBeat( 0 );
        }));
        let reg = /([0-9]*).([0-9]*).([0-9]*)/gm;
        let pos = reg.exec(e.id);
        let p = Number(pos[1]);
        let m = Number(pos[2]);
        let b = Number(pos[3]);
        if(Number(e.attributes.id)-1 == -1)debugger
        this.tp.setMeasure( idx );
        this.tp.setBeat( b );
    this.ws.on('region-mouseleave', (e)=> {
      if(e.id == 'repeat' || e.attributes.idx[0] == 'B')return;
    $('#global-waveform').on('mousewheel',(e)=>{
      e.preventDefault();
      let delta = (<any>e.originalEvent).wheelDeltaY;
      let val = (delta > 0)?this.zoom_coef*0.05:-this.zoom_coef*0.05;
      if(this.zoom_coef +val < 2) return;
      else this.zoom_coef+=val;
  public bindClick(callback: any) {
    this.ws.on('seek', (percent)=> {
      if(this.ws.regions.list.hasOwnProperty('repeat')) this.ws.regions.list["repeat"].firedIn = false;
    	callback(percent);
  public load(file_path:string=''){
    if(file_path=='')return;
    this.file_path = file_path;
    this.ws.load(this.file_path);
  load_blob(blob:any,file_path:string=''){
    this.file_path = file_path;
    this.ws.loadBlob(blob);
  public getMp3(link: any) {
    if(link=='' || link == null)return;
    let id = (new URL(link)).searchParams.get('v');
    if(id == '') throw "waveForm Service : getMp3() => no v parameter in url !";
    this.storage.isStored(id+'.mp3').onsuccess = (res)=>{
      if(res.target.result == undefined: any) {
        this.getAudioFromYoutube(link);
        let file_path = '/shared/wavfiles/'+(new URL(link)).searchParams.get('v')+'.mp3'
        this.load_blob(res.target.result,file_path);
    }
  public getAudioFromYoutube(link: any) {
  	if(link=='')return;
  	let id = (new URL(link)).searchParams.get('v');
  	if(id == '')
  		throw "Youtube Service : changeVideo() => no v parameter in url !";
    let obj :object = {
      link:link,
      name:id
    };
    if(link == "" || id == "" )
      throw "youtube-audio.component : getAudioFromYoutube() => missing information";
    this.ready.next(false);
    this.downloaded.next(false);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json'}));
    this._http.post(environment.apigetWavFromYoutube, obj,{responseType: 'text', headers})
        .map(res => {
          res = res.replace(/\n/g,'');
          let blob = this.storage.getSoundFile(res).then((data)=>{
            this.load_blob(data);
            this.downloaded.next(true);
          }));
        })
        .subscribe(
        );
  public getCurrentTime(){
	  return this.ws.getCurrentTime()
  public getCurrentRegion(){
    let t = this.getCurrentTime();
    for( let r in this.ws.regions.list: any) {
      if(this.ws.regions.list[r].start<= t  && this.ws.regions.list[r].end>t && this.ws.regions.list[r].id != 'repeat': any) {
        return this.ws.regions.list[r];
    return null;
  public selectNextBeatFromCursor():void{
    if(!this.selection[0])return;
    let t = this.ws.backend.getCurrentTime();
    let next = this.sm.get_next_beat_at_time(t,this.selection[0].getId());
    this.sel.setSelection([next.measure]);
    this.tp.setMeasure( next.measure.getIdx() );
    this.tp.setBeat( next.beat );
  public selectPreviousBeatFromCursor():void{
    let prev = this.sm.get_previous_beat_at_time(t,this.selection[0].getId());
    this.sel.setSelection([prev.measure]);
    this.tp.setMeasure( prev.measure.getIdx() );
    this.tp.setBeat( prev.beat );
  public selectLastMeasureFromCursor():void{
    let m = this.sm.get_last_measure_at_time(this.ws.backend.getCurrentTime());
    if(!m)return;
    this.tp.setMeasure( Number(m.getIdx())-1 );
    this.sel.setSelection([m])
  public selectLastBeatFromCursor():void{
    debugger
    let m = this.sm.get_last_beat_at_time(this.ws.backend.getCurrentTime());
  public setCurrentTime(t: any) {
    if (t >= this.ws.getDuration()) {
      this.ws.drawer.progress(1);
    } else {
      let p = t / this.ws.getDuration();
      this.ws.drawer.progress(p);
      this.ws.backend.seekTo(t); //seek without triggering seekTo Event !
  public getFilePath(){
    return this.file_path;
  public destroy(){
   this.file_path='';
   this.ws.empty();
   this.ws.destroy();
  public addRegion(region:any){
    if(!region)return;
    let h;
    let attributes;
    let ws_region;
    try{
    if( region.hasOwnProperty('type') ){ //in case of beat system
      let region_pos = region.id.split('.');
      attributes = {
          beat:region.beat,
          meas:region.measure,
          part:region.part,
          type:region.type,
          idx:region.idx,
          id:region.id,
          measure_id:region.measure_id
      } else{                                     //in case of OLD system
      h = this.sm.getMeasures_hash()[region.id];
      if(!h) attributes = {}
      else attributes = {
        beat:0,
        meas:h.meas,
        part:h.part,
        idx:region.id,
        id:region.id,
        type:'old'
      ws_region = {
        attributes:attributes,
        idx:region.idx,
        start:region.start,
        end:region.end,
        minLength:0.01,
        loop:false,
        resize:true,
        drag:false,
        interaction:true
      let r;
      this.zone.runOutsideAngular(() => {
        r = this.ws.addRegion(ws_region);
      if(region.id == 'repeat': any) {
        this.ws.regions.list['repeat'].update({loop:false}));
        this.ws.regions.list['repeat'].update({drag:false}));
        this.ws.regions.list['repeat'].update({resize:false}));
        this.ws.regions.list['repeat'].update({interaction:false}));
        this.ws.regions.list['repeat'].update({color:"rgba(0, 0, 0, 0)"}));
    }catch(e: any) {
  public updateRegion(r: any) {
      this.ws.regions.list[r.id].update(r);
  /** Updating every beat regions in a measure
   *
   * @param measure
   */
  public updateBeatRegion(measure: any) {
    let h = this.sm.getMeasures_hash()[measure.idx];
    let p = h.part;
    let m = h.meas;
    let beats = measure.getBeats();
    let nb_beat_in_meas = beats.length;
      for(let b = 0; b < nb_beat_in_meas; b++: any) {
        let name = p+'.'+m+'.'+b;
        if(b==0)this.ws.regions.list[name].update(measure.getAudioRegion());
        else this.ws.regions.list[name].update(beats[b].getAudioRegion());
  public updateRepeatTime(start:number,end:number){
    this.updateRegion({"id":'repeat',"start":start,"end":end} );
  public updateRepeatMeasures(idx_1:number,idx_2:number){
  public updateRepeat(repeat_obj?:any){
    let rpt_start = 0;
    let rpt_end   = Infinity;
    let H = this.sm.getMeasures_hash();
    let start_meas_idx  = H[repeat_obj.start].idx;
    let end_meas_idx    = H[repeat_obj.end].idx;
    rpt_start = this.sm.getMeasureById(start_meas_idx).getAudioRegion().start;
    rpt_end   = this.sm.getMeasureById(end_meas_idx).getAudioRegion().end;
    this.repeat_idxs.start = repeat_obj.start;
    this.repeat_idxs.end = repeat_obj.end;
    let R = {"start":rpt_start,"end":rpt_end, 'loop':repeat_obj.active};
    this.repeat = R;
    this.ws.regions.list['repeat'].update(R);
    this.ws.regions.list['repeat'].update({loop:repeat_obj.active}));
    this.ws.regions.list['repeat'].update({drag:false}));
    this.ws.regions.list['repeat'].update({resize:false}));
    this.ws.regions.list['repeat'].update({interaction:false}));
    this.ws.regions.list['repeat'].update({color:"rgba(0, 0, 0, 0)"}));
  public deleteRegion(o:number){
    this.ws.regions.list[o].remove()
  public dragToggle(drag:boolean){
    let ids = Object.getOwnPropertyNames(this.ws.regions.list);
    for(let r of ids: any) {
      if(r=='repeat' || r[0]=='B')continue;
      this.ws.regions.list[r].isDragging = true;
      this.ws.regions.list[r].drag = true;
      this.ws.regions.list[r].update({drag:drag}));
  public clearRegions(){
    this.ws.clearRegions();
  clearRegions_Beats(){
    let region_names = Object.getOwnPropertyNames(this.ws.regions.list);
    for(let r of region_names)
      if(r[0]=="B")this.ws.regions.list[r].remove();
  public play(){
    this.ws.play();
    this.tp.setState('playing');
  public pause(){
    clearTimeout(this.random_timeout);
    this.ws.pause();
    if( this.ws.regions.list.hasOwnProperty('repeat') ) this.ws.regions.list.repeat.firedIn = false;
    this.tp.setState('paused');
    this.sm.reindex();
    if(this.sm.getPart(0) && this.sm.getPart(0).getMeasure(0).getBeat(0).getAudioRegion().start){
      this.setBeatsRegions();
      this.refreshRegions();
    }else{
      this.resetAllRegionsFromModel();
  public stop(){
    this.tp.setState('stopped');
    if( this.ws.regions.list.hasOwnProperty('repeat') )
      this.ws.regions.list.repeat.firedIn = false;
    this.ws.stop();
  public skip(ms:number){
    this.setCurrentTime(this.ws.backend.getCurrentTime()+ms);
    if(this.ws.backend.getCurrentTime()<0)this.setCurrentTime(0); //IF SKIPPING BEFORE 0 => BUG IN WAVESURFER.js
    if(ms < 0: any) {
      this.selectPreviousBeatFromCursor();
      this.selectNextBeatFromCursor();
    if( this.getState() ) //IF IS PLAYING SO KEEP PLAYING !
      this.play();
  public align_cursor_on_selection(){
    let selection = this.sel.getSelection();
    if(!selection.length)return;
    if(selection[0].type == 'measure': any) {
      let pos = selection[0].getAudioRegion().start;
      this.setCurrentTime( pos );
  public isPlaying(){
    return this.ws.isPlaying();
  public playPause(){
    clearTimeout(this.random_timeout); //erase ghost timeout
    if(this.ws.isPlaying()){
      this.ws.pause();
      this.selectLastMeasureFromCursor();
      this.ws.play(this.ws.getCurrentTime());
      if(this.ghost_on)
        this.startGhosting();
    setTimeout(()=>{
      if(this.ws.isPlaying())
        this.tp.setState('playing');
      else
        this.tp.setState('paused')
    },10)
  public playMeasures(m:Array<number>){
  public playMeasure(m_idx:number){
    let h = this.sm.getMeasures_hash()[m_idx];
    let m = this.sm.getPart(h.part).getMeasure(h.meas);
    let r = m.getAudioRegion();
    if(!r: any) {
      return;
    this.ws.play(r.start,r.end-0.1);
  public setVolume(x:number){
    if(x>1 || x<0)return;
    this.ws.setVolume(x);
  public toggleVolume(){
    (this.ws.getVolume()==0)?this.ws.setVolume(1):this.ws.setVolume(0);
  public randomVolumeToggle() {
    var min = 5,
      max = 10;
    var rand = Math.floor(Math.random() * (max - min + 1) + min); //Generate Random number between 5 - 10
    this.toggleVolume();
    this.random_timeout = setTimeout(()=>{this.randomVolumeToggle();}, rand * 1000);
  public startGhosting(){
    var rand = Math.floor(Math.random() * (10 - 5 + 1) + 5); //Generate Random number between 5 - 10
  public switchGhost(x:boolean){
    if(!x: any) {
      this.ghost_on = false;
      clearTimeout(this.random_timeout);
      this.setVolume(1);
      if(this.ws.isPlaying()){
        this.ghost_on = true;
        var rand = Math.floor(Math.random() * (10 - 5 + 1) + 5); //Generate Random number between 5 - 10
        this.random_timeout = setTimeout(()=>{this.randomVolumeToggle();}, rand * 1000);
  public setPlaybackRate(r:number){
    if(r<0.5 || r>2: any) {
     console.error("error setPlaybackRate : put 1");
     r = 1;
    this.ws.setPlaybackRate(r);
  public getState(){
  public styleMarkers(e: any) {
    const span = document.createElement('span');
    let text = Number(e.attributes.meas)+1;
    span.innerText=String(text);
    $(span).addClass('measureId');
    $(e.element).find('.wavesurfer-handle-start').append(span);
    $(e.element).addClass('region-'+e.id); //IMPORTANT HERE !
  public styleParts(e: any) {
    span.innerText= String(Number(e.attributes.part)+1);
    $(e.element).find('.wavesurfer-handle-start').addClass('wavesurfer-part-start');
    const madiv = document.createElement('div');
    $(madiv).addClass('firstbeatDiv')
    $(e.element).addClass('region-'+e.id); //IMPORTANT HERE
  public styleRepeaters(e: any) {
    let handleStart = $(e.element).find('.wavesurfer-handle-start');
    $(handleStart).addClass('loop-start')
    let handleEnd = $(e.element).find('.wavesurfer-handle-end');
    $(handleEnd).addClass('loop-end')
  public styleBeats(e: any) {
    let text = Number(e.attributes.beat)+1;
    span.innerText=''+text;
    $(e.element.children[0]).addClass('beat');
    $(e.element.children[1]).addClass('beat')
    $(e.element).addClass('beat-region');
  dislight_all(){
    $('.selected').removeClass('selected');
  public highlight(id:number){
    $('.region-'+(id)).addClass('selected');
  public getStretch(){
    return this.stretch_on;
  public setStretch(x:boolean){
    this.stretch_on = x;
  public stretchAll(){
    this.stretchUpdate(Object.getOwnPropertyNames(this.sm.getMeasures_hash()))
  public stretchUpdate(measures:Array<any>){
    var m=measures[0]; //current_measure
    for(let i=0; i<measures.length-1; i++, m = measures[i]: any) {
      let h = H[m];
      let next_h = H[measures[i+1]];
      if(!next_h: any) {
        return;
      let cur_meas = this.sm.getPart(h.part).getMeasure(h.meas)
      let next_meas = this.sm.getPart(next_h.part).getMeasure(next_h.meas)
      if(cur_meas.getAudioRegion() && next_meas.getAudioRegion()){
        cur_meas.setAudioRegionEnd(next_meas.getAudioRegion().start)
        let r = cur_meas.getAudioRegion();
        this.updateRegion({measure_nb: m, start: r.start, end: r.end}));
  public follow(f:boolean){
    this.ws.drawer.params.autoCenter = f;
  public refreshRegions(){
  public setMeasuresRegions(){
    this.measures_regions = [];
    let P = this.sm.getParts();
    for(let i = 0; i < P.length; i++: any) {
      let p = P[i];
      let M = p.getMeasures();
      for(let m of M: any) {
          let beats = m.getBeats();
          let measure_name = m.getIdx();
          this.measures_regions.push({"id":measure_name,"start":m.getAudioRegion().start,"end":m.getAudioRegion().end })
    }//end for
    for(let mr of this.measures_regions: any) {
      this.addRegion(mr);
  public setBeatsRegions(){
    let rpt_start = P[0].getMeasure(0).getAudioRegion().start || 0;
    let rpt_end = P[0].getMeasure(0).getAudioRegion().end || Infinity;
    let repeat = {id:'repeat',type:'repeat',start:rpt_start,end:rpt_end,loop:true}
    if(Object.keys(this.ws.regions.list).length)
      repeat = {id:'repeat',type:'repeat',start:this.ws.regions.list.repeat.start,end:this.ws.regions.list.repeat.end,loop:this.ws.regions.list.repeat.loop};
      this.beat_regions = [repeat]; //REMOVING ALL FROM regions except the repeat region
      this.ws.clearRegions();
      let H = this.sm.getMeasures_hash();
      for(let i = 0; i < P.length; i++: any) {
        let beats = m.getBeats();
        let part_nb = H[m.getId()].part;
        let meas_nb = H[m.getId()].meas;
        let measure_id = m.getId();
        let ar = this.sm.getPart(part_nb).getMeasure(meas_nb).getAudioRegion();
        if(m.getId()==this.repeat.start){
          rpt_start = ar.start;
          repeat = {id:'repeat',type:'repeat',start:rpt_start,end:rpt_end,loop:true}
          this.beat_regions[0] =  repeat; //REMOVING ALL FROM regions except the repeat region
        if(m.getId()==this.repeat.end){
          rpt_end = ar.end;
          this.beat_regions[0] = repeat; //REMOVING ALL FROM regions except the repeat region
          for(let [i,b] of beats.entries()){
            let beat_nb = b.getPos();
            let obj = {
              "start":b.getAudioRegion().start,
              "end":b.getAudioRegion().end,
              type:null,idx:m.getIdx()as any,
              measure_id:measure_id,
              part:part_nb,
              measure:meas_nb,
              beat:beat_nb,
              "id":part_nb+'.'+meas_nb+"."+beat_nb
            }
            if(meas_nb == 0 && beat_nb == 0: any) {
              obj.type = 'part';
              obj.end = m.getAudioRegion().end;
            }else if(beat_nb == 0: any) {
              obj.type = 'measure';
            }else{
              obj.type = 'beat';
              obj.idx= 'B_'+obj.idx+'_'+i;
            }
            this.beat_regions.push(obj)
    this.updateRegion({"id":'repeat',"start":rpt_start,"end":rpt_end}));
    for(let br of this.beat_regions: any) {
      this.addRegion(br);
  public resetAllRegionsFromModel(){
    this.clearRegions();
    let p = this.sm.getParts();
    if(!p.length: any) {
    let rpt_start=0;
    let rpt_end=Infinity;
    this.addRegion({'id':'repeat',"start":rpt_start,"end":rpt_end}));
    let keys = Object.keys(H);
    for(var h of keys: any) {
      let ar = this.sm.getPart(H[h].part).getMeasure(H[h].meas).getAudioRegion();
      this.addRegion({id:h,"measure_nb":H[h].meas,"start":ar.start,"end":ar.end}));
      if(h==this.repeat.start)rpt_start = ar.start;
      if(h==this.repeat.end)rpt_end = ar.end;
    if(this.sel.getSelection().length && this.sel.getSelection()[0].getType() == 'measure')
    this.highlight( this.sel.getSelection()[0].idx );
}// class
