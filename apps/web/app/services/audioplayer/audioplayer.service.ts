import { Injectable, OnDestroy, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment'
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { Songmodel } from '@models/songmodel/songmodel';
import { SelectionModel } from '@models/selectionmodel/selectionmodel';
import { RegionObject } from '@models/songmodel/songmodel';
import { DisplayService } from '@services/display/displayService';
import { Measure } from '@models/songmodel/measure';
import { Part } from '@models/songmodel/part';

import { StorageService } from '@services/storage/storage.service';

import { TransportService } from '@services/transport/transport.service';

import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';
import RegionPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import WaveSurfer from 'wavesurfer.js';

import { SoundTouch, SimpleFilter, getWebAudioNode } from 'soundtouchjs/dist/soundtouch.js';

@Injectable({
  providedIn: 'root'
})
export class AudioPlayer {

	public ws:any;
	public waveform_containerId:string='#waveform';
	public timeline_containerId:string='#waveform';
	public file_path:string='';
  public zoom_coef:number;

  public last_visited_region:number=1;

  //placeholder function
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

  constructor( private _http:HttpClient, 
                public sm:Songmodel, 
                private storage:StorageService,
                private sel:SelectionModel, 
                private zone:NgZone, 
                private tp:TransportService, 
                private dm:DisplayService ,
                ) { 

    this.init();
  }

  init(){
    // console.log("constructor AudioPlayer");
    this.downloaded = new Subject();
    this.ready = new Subject();
    this.db_ready = new Subject();
    this.db_ready_sub = this.storage.ready.subscribe((data)=>{
      this.db_ready_val = true;
      this.db_ready.next(this.db_ready_val);
    });

    //highlight subscription
    this.selectionUpdate$ = this.sel.selected_Update$.subscribe(data=>{

      // if(this.ws.isPlaying()) return;

      this.selection = data;
      this.dislight_all();

      if(!data || !data[0])return;

      for(let i=0; i < data.length; i++) {
        // if it's not a part but a measure that is selected
        if(data[i].hasOwnProperty('type') && data[i].type == 'measure') {

          this.highlight(data[i].id);
          let h = this.sm.getMeasures_hash( )[data[i].id];
          if( h==undefined ) throw "error audioplayer.service : init() => cant find measure hash";

          let m = this.sm.getPart( h.part ).getMeasure( h.meas );
          if( m==undefined ) throw "error audioplayer.service : init() => cant find measure";
          if(!m.getAudioRegion()){
            console.warn('No region to select, is there any region left ?');
            return;
          }

          // let pos = m.getAudioRegion().start;
          // this.setCurrentTime( pos );

        }//end if is measure
      }

      // let a_Reg = this.sm.getPart(data[0].part-1).getMeasure(data[0].meas).getAudioRegion();
      // if(a_Reg) this.setCurrentTime(a_Reg.start);
    });
  }

  createFromHtmlElements(containerElementId:string='',timelineElementId:string=''){
    // console.log("createFromHtmlElements");

  	if(containerElementId == ''|| timelineElementId=='')return;
  	this.waveform_containerId = containerElementId;
  	this.timeline_containerId = timelineElementId;

    // console.log("creating wavesurfer-----------");
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
    });


    this.ws.on('ready', ()=> {

      //bind click on wavesurfer
      console.log("waveSurfer ready : -------!")
      this.zoom_coef = 20;
      this.ws.zoom(this.zoom_coef);
	    this.ready.next(true);

      /////////////STRETCHER

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
          extract: function(target, numFrames, position) {
              if (seekingPos != null) {
                  seekingDiff = seekingPos - position;
                  seekingPos = null;
              }

              position += seekingDiff;

              for (var i = 0; i < numFrames; i++) {
                  target[i * 2] = l[i + position];
                  target[i * 2 + 1] = r[i + position];
              }

              return Math.min(numFrames, length - position);
          }
      };

      var soundtouchNode;

      



      this.ws.on('play', ()=> {
          seekingPos = ~~(this.ws.backend.getPlayedPercents() * length);
          st.tempo = this.ws.getPlaybackRate();

          if (st.tempo === 1) {
              this.ws.backend.disconnectFilters();
          } else {
              if (!soundtouchNode) {
                  var filter = new SimpleFilter(source, st);
                  soundtouchNode = getWebAudioNode(
                      this.ws.backend.ac,
                      filter
                  );
              }
              this.ws.backend.setFilter(soundtouchNode);
          }
      });

      


      this.ws.on('pause', function() {
          soundtouchNode && soundtouchNode.disconnect();
      });





      this.ws.on('seek', ()=> {
        console.log('seek');
        // if(!this.ws.regions.getCurrentRegion() || !this.ws.regions.getCurrentRegion().hasOwnProperty('id') || this.ws.regions.getCurrentRegion().id == 'repeat'){
        //   console.warn('Warning : cant find region on seek.')
        //   return;
        // }

       // this.zone.run(()=>{ //necessary here ..... bad design...??
          // let id = this.ws.regions.getCurrentRegion().id;
          // this.tp.setMeasure( Number(id)-1 );
          // let sel = this.sm.getPart(this.sm.getMeasures_hash()[id].part -1).getMeasure(this.sm.getMeasures_hash()[id].meas);
          // this.sel.setSelection([ sel ]);

        // });

        

        // this.selectLastMeasureFromCursor();
        // this.selectLastBeatFromCursor();
        


        // let seekingPos = ~~(this.ws.backend.getPlayedPercents() * length);
        // let time = seekingPos/this.ws.backend.buffer.sampleRate;
        // let m = this.sm.get_last_measure_at_time(time);
        // console.log('m => ',m);
        // this.sel.setSelection([m])

 

      });
      ///////////////////////////END OF STRETCHER

    });





  this.ws.on('region-in',(e)=>{
      console.log('region '+e.id+' entered');
      //return when repeat region is clicked
    if(e.id == 'repeat' ){
      // console.log('%c===== REGION repeat : ','color:red')

      }else{
        
        var p = e.attributes.part;
        var m = e.attributes.meas;
        var b = e.attributes.beat;
        
        switch(e.attributes.type){
          
          case "beat":
  
            // console.log('%c===== REGION-IN beat : ','color:red', e)
            // let reg = /B_([0-9]*)/gm;
            // let pos = reg.exec(e.attributes.idx);
            // let idx = pos[1];
  
            // reg = /([0-9]*).([0-9]*).([0-9]*)/gm;
            // pos = reg.exec(e.id);
            // p = Number(pos[1]);
            // m = Number(pos[2]);
            // b = Number(pos[3]);
            
            m = this.sm.getMeasureById( e.attributes.measure_id );
            this.sel.setSelection([ m ]);
            
            this.tp.setMeasure( m.getIdx() );
            this.tp.setBeat( b, false ) 
          
          break;
  
          case "part":
            
            // console.log('%c===== REGION-IN part :','color:red',e)
            m = this.sm.getMeasureById( e.attributes.measure_id );
            this.sel.setSelection([ m ]);
  
            this.tp.setMeasure( m.getIdx() );
            this.tp.setBeat( 0, true) 
            
            break;
            
          case "measure":
            
            // console.log('%c===== REGION-IN measure  : ','color:red',e)
            
            m = this.sm.getMeasureById( e.attributes.measure_id );
            this.sel.setSelection([ m ]);
  
            this.tp.setMeasure( m.getIdx() ) 
            this.tp.setBeat( b, true) 
          break;
          
          case "old":
            // console.log('%c===== REGION-IN non-beat measure  : ','color:red',e)
            m = this.sm.getMeasureById( Number(e.attributes.id));
            this.sel.setSelection([ m ]);
  
            this.tp.setMeasure( m.getIdx() ) 
            this.tp.setBeat( 0, true) 
            break;
          default:
            debugger;
            break;
          }

        }//else

    });




    this.ws.on('region-out',function(e){

        if(e.id == 'repeat') console.log('REPEAT REGION EXIT !!!!!!!!!!!!!!!!!!!');
      // this.bindRepeat(e.id,e);
    });

    
    
    

    //bind region update on wavesurfer
    this.ws.on('region-update-end', (e,E,b,c)=> {
      if(e.id == 'repeat')debugger

      let pos = this.sm.getMeasures_hash()[e.attributes.idx];
      let p = this.sm.getPart( pos.part );
      let m = p.getMeasure( pos.meas );
      let d = m.getAudioRegion().start;
      let delta = e.start - d;

      // console.log("region updated-------!")

      let r = {start:e.start, end:e.end};
      this.sm.updateAudioRegion(e.attributes.idx,r);
      this.updateBeatRegion(m);
      
      
      // move all other selected measures
      if(E.ctrlKey ){

        for(let r of this.selection){
          if( r.getType() != 'measure') continue;
          if( r.getIdx() == e.attributes.idx)continue;
          
          // let p = this.sm.getPart( r.part-1 );
          // let m = p.getMeasure( r.meas );
          let start = r.getAudioRegion().start + delta;
          let end = r.getAudioRegion().end + delta;
          
          let n = {start:start, end:end};
          this.sm.updateAudioRegion(r.getIdx(),n);
          this.ws.regions.list[r.getIdx()].onDrag(delta);
        }
      }
      // this.stretchAll();
      
      // if(pos.idx-1 >=0) this.stretchUpdate([pos.idx-1,pos.idx]);
      // this.stretchUpdate([pos.idx,pos.idx+1]);
      
      this.repeat_idxs.active = this.repeat.active;
      this.updateRepeat(this.repeat_idxs);
      // this.stretchUpdate([(pos.idx+1).toString(),(pos.idx+2).toString()]);
      // this.computeTempoRegion_measure(p,m);



    });




    this.ws.on('region-created', (e)=> {
      // console.log('e region created => ',e);

      //bind region update on wavesurfer
      // console.log("region created-------!")
      // console.log(e);
      // if(e.attributes.idx[0] == 'B'){
      //  console.log('time marker :',e); 
      //  return;
      // }

      if(e.id == 'repeat'){
        this.styleRepeaters(e);
        return
      }
      // else if(e.id[0] == 'B'){
      //   this.styleBeats(e);
      // }
      

        if(e.attributes.type == 'part'){
          this.styleParts(e); 
          return;
        } else if(e.attributes.type == 'measure'){
          this.styleMarkers(e); 
          return;
        } else if(e.attributes.type == 'beat'){
          this.styleBeats(e);
          return;
        }else if(e.attributes.type == 'old'){

          if(e.attributes.meas == 0 && e.attributes.beat == 0){
            this.styleParts(e); 
            return;
          } else if(e.attributes.meas != 0 && e.attributes.beat == 0){
            this.styleMarkers(e); 
            return;
          } else if(e.attributes.beat != 0){
            this.styleBeats(e);
            return;
          }
      }

    });





    this.ws.on('region-mouseenter', (e,E,b,c)=> {
      // console.log('region-mouseenter');

      if(e.id == 'repeat' || (e.attributes.idx && e.attributes.idx[0] == 'B'))return;
      if(this.ws.isPlaying())return;
      //bind region update on wavesurfer
      // console.log("region entered-------!")
      // this.sel.setSelection([ this.sm.getMeasures_hash()[e.id] ]);
    });




    this.ws.on('region-click', (e,E,b,c)=> {
       
      console.log("e.attributes =>", e.attributes)
      // console.log('%c region-click','font-size:20px;color:blue');
      //bind region update on wavesurfer

      // SEEK TO
      // let length = (this.ws.backend.buffer.length/this.ws.backend.buffer.sampleRate);
      // let time = e.wavesurfer.drawer.handleEvent(E, true)
      // this.setCurrentTime(time*length);
      // if(this.getState())this.play();

      if(e.id == 'repeat')return; 

      if(e.attributes.type == 'old'){


        let H = this.sm.getMeasures_hash();
        let p = H[e.attributes.id].part;
        let m = H[e.attributes.id].meas;
        
        let sel = this.sm.getPart(p).getMeasure(m);
        
        if(E.ctrlKey){
          this.sel.add_or_remove_Selection( sel );
          return;
        }
        // this.selectLastMeasureFromCursor();
        // this.ws.drawer.progress(p);
        // e.wavesurfer.seekTo(e.wavesurfer.drawer.handleEvent(E, true))
        this.sel.setSelection([ sel ]);
        // let idx = this.sm.getMeasureIdxById( sel.getId() );
        let idx = sel.getIdx();
  
        this.zone.run(()=>{
          // if(Number(e.attributes.idx)-1 == -1)debugger
          this.tp.setMeasure( idx );
          this.tp.setBeat( 0 );
        });
        
      }else{
        // let reg = /B_([0-9]*)/gm;
        // let pos = reg.exec(e.attributes.idx);
        // let idx = pos[1];
        
        let reg = /([0-9]*).([0-9]*).([0-9]*)/gm;
        let pos = reg.exec(e.id);
        let p = Number(pos[1]);
        let m = Number(pos[2]);
        let b = Number(pos[3]);
        

        if(Number(e.attributes.id)-1 == -1)debugger
        
        let sel = this.sm.getPart(p).getMeasure(m);
        this.sel.setSelection([ sel ]);
        let idx = sel.getIdx();
        this.tp.setMeasure( idx );
        this.tp.setBeat( b );
      }


      //send a click event to wavesurfer at this place to click through
    });






    this.ws.on('region-mouseleave', (e)=> {

      if(e.id == 'repeat' || e.attributes.idx[0] == 'B')return;
      // console.log("region leaved-------!")
      //Make selection go back to transport position on mouse leave the measure out
      // this.sel.setSelection([ this.sm.getMeasures_hash()[this.tp.getMeasure()+1] ]);
    });


    $('#global-waveform').on('mousewheel',(e)=>{
      e.preventDefault();
      let delta = (<any>e.originalEvent).wheelDeltaY;
      
      let val = (delta > 0)?this.zoom_coef*0.05:-this.zoom_coef*0.05;

      // if(this.zoom_coef + delta/500 < 6) return;
      if(this.zoom_coef +val < 2) return;
      else this.zoom_coef+=val;

      // console.log('this.zoom_coef => ',this.zoom_coef);
      this.ws.zoom(this.zoom_coef);
    });


  }

  // bindRepeat(id:number,e:any){}

  bindClick(callback){
    this.ws.on('seek', (percent)=> {
      // console.log('ws.onSeek');
      if(this.ws.regions.list.hasOwnProperty('repeat')) this.ws.regions.list["repeat"].firedIn = false;
    	callback(percent);
    });
  }

  load(file_path:string=''){

    if(file_path=='')return;

    this.file_path = file_path;
    this.ws.load(this.file_path);
  }

  load_blob(blob:any,file_path:string=''){

    this.file_path = file_path; 
    this.ws.loadBlob(blob);
  }

  getMp3(link){

    if(link=='' || link == null)return;

    let id = (new URL(link)).searchParams.get('v');

    if(id == '') throw "waveForm Service : getMp3() => no v parameter in url !";

    this.storage.isStored(id+'.mp3').onsuccess = (res)=>{
      if(res.target.result == undefined){
        console.warn('Did not cached the file : retrieving it');
        this.getAudioFromYoutube(link);
      }else{
        console.warn('Already cached the file : loading it !')
        let file_path = '/shared/wavfiles/'+(new URL(link)).searchParams.get('v')+'.mp3'
        this.load_blob(res.target.result,file_path);
      }
    }
  }

  getAudioFromYoutube(link){
  	// console.log("getAudioFromYoutube : "+link);

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

    const headers = new HttpHeaders({ 'Content-Type': 'application/json'});  

    this._http.post(environment.apigetWavFromYoutube, obj,{responseType: 'text', headers})
        .map(res => {

          res = res.replace(/\n/g,'');
          let blob = this.storage.getSoundFile(res).then((data)=>{
            this.load_blob(data);
            this.downloaded.next(true);
          });
        })
        .subscribe(
          data => {/*console.log('data  : '+data)*/},
          err => console.log(err),
          () => { console.log('Got the wav file '); }
        );
  }


  getCurrentTime(){
	  return this.ws.getCurrentTime()
  }

  getCurrentRegion(){

    // return this.ws.regions.getCurrentRegion();
    let t = this.getCurrentTime();
    for( let r in this.ws.regions.list){
      if(this.ws.regions.list[r].start<= t  && this.ws.regions.list[r].end>t && this.ws.regions.list[r].id != 'repeat'){
        return this.ws.regions.list[r];
      }
    }
    return null;
  }

  selectNextBeatFromCursor():void{
    
    if(!this.selection[0])return;
    let t = this.ws.backend.getCurrentTime();
    let next = this.sm.get_next_beat_at_time(t,this.selection[0].getId());
    console.log("next =>", next.measure.getIdx(),' beat=>',next.beat)
    this.sel.setSelection([next.measure]);
    this.tp.setMeasure( next.measure.getIdx() );
    this.tp.setBeat( next.beat );
  }

  selectPreviousBeatFromCursor():void{
    
    if(!this.selection[0])return;
    let t = this.ws.backend.getCurrentTime();
    let prev = this.sm.get_previous_beat_at_time(t,this.selection[0].getId());
    console.log("prev =>", prev.measure.getIdx(),' beat=>',prev.beat)
    this.sel.setSelection([prev.measure]);
    this.tp.setMeasure( prev.measure.getIdx() );
    this.tp.setBeat( prev.beat );
  }

  selectLastMeasureFromCursor():void{
    // let seekingPos = ~~(this.ws.backend.getPlayedPercents() * length);
    // let time = seekingPos/this.ws.backend.buffer.sampleRate;
    let m = this.sm.get_last_measure_at_time(this.ws.backend.getCurrentTime());
    // console.log('selectLastMeasureFromCursor :' ,m);
    if(!m)return;
    this.tp.setMeasure( Number(m.getIdx())-1 );
    this.sel.setSelection([m])

  }

  selectLastBeatFromCursor():void{

    debugger
    // let seekingPos = ~~(this.ws.backend.getPlayedPercents() * length);
    // let time = seekingPos/this.ws.backend.buffer.sampleRate;
    let m = this.sm.get_last_beat_at_time(this.ws.backend.getCurrentTime());
    // console.log('selectLastMeasureFromCursor :' ,m);
    if(!m)return;
    this.tp.setMeasure( Number(m.getIdx())-1 );
    this.sel.setSelection([m])

  }

  setCurrentTime(t){
    if (t >= this.ws.getDuration()) {
      this.ws.drawer.progress(1);
      // this.ws.seekTo(1);
    } else {
      let p = t / this.ws.getDuration();
      this.ws.drawer.progress(p);
      this.ws.backend.seekTo(t); //seek without triggering seekTo Event !
      // this.ws.seekTo(p); //SEEK WITH TRIGGERING SEEKTO EVENT.


    }
  }

  getFilePath(){
    return this.file_path;
  }

  destroy(){
    console.log('%c AudioPlayer : destroy()','color:red; font-size:20px;');
   this.file_path='';
   this.ws.empty();
   this.ws.destroy();
  }

  addRegion(region:any){
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
        }
        
        
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
      }

    }


      ws_region = {
        // id:region.measure_nb,
        attributes:attributes,
        id:region.id,
        idx:region.idx,
        start:region.start,
        end:region.end,
        minLength:0.01,
        loop:false,
        resize:true,
        drag:false,
        interaction:true
      }
      
      let r;
      this.zone.runOutsideAngular(() => {
        r = this.ws.addRegion(ws_region);
      });
  
      if(region.id == 'repeat'){
        this.ws.regions.list['repeat'].update({loop:false});
        this.ws.regions.list['repeat'].update({drag:false});
        this.ws.regions.list['repeat'].update({resize:false});
        this.ws.regions.list['repeat'].update({interaction:false});
        this.ws.regions.list['repeat'].update({color:"rgba(0, 0, 0, 0)"});
      }

    }catch(e){
      console.log(this.measures_regions)
      console.log(this.ws.regions.list)
      // console.log(r);
    }

  }

  public updateRegion(r){
    console.log('Updating regions  with => ',r);
    try{
      this.ws.regions.list[r.id].update(r);

    }catch(e){

    console.log(this.measures_regions)
    console.log(this.ws.regions.list)
    console.log(r);
    }
  }

  /** Updating every beat regions in a measure
   * 
   * @param measure 
   */
  public updateBeatRegion(measure){
    // console.log('Updating beat regions  with => ',m);
    
    let h = this.sm.getMeasures_hash()[measure.idx];
    let p = h.part;
    let m = h.meas;

    let beats = measure.getBeats();
    let nb_beat_in_meas = beats.length;

    try{

      for(let b = 0; b < nb_beat_in_meas; b++){
        let name = p+'.'+m+'.'+b;
        if(b==0)this.ws.regions.list[name].update(measure.getAudioRegion());
        else this.ws.regions.list[name].update(beats[b].getAudioRegion());

      }
    }catch(e){
      console.warn('audioplayer service => cant update beats of this region !')
    }
  }

  updateRepeatTime(start:number,end:number){
    this.updateRegion({"id":'repeat',"start":start,"end":end} );
  }

  updateRepeatMeasures(idx_1:number,idx_2:number){
    // to implement
  }
  // {active:false,start:1, end:1}
  updateRepeat(repeat_obj?:any){
    // console.log('updateRepeat');
    
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

    
    
    console.log('updateRegion', R);
    this.ws.regions.list['repeat'].update(R);
    this.ws.regions.list['repeat'].update({loop:repeat_obj.active});
    this.ws.regions.list['repeat'].update({drag:false});
    this.ws.regions.list['repeat'].update({resize:false});
    this.ws.regions.list['repeat'].update({interaction:false});
    this.ws.regions.list['repeat'].update({color:"rgba(0, 0, 0, 0)"});
    // this.updateRegion(R);
  }

  deleteRegion(o:number){
    console.log("waveForm deleteRegion => ",o);
    this.ws.regions.list[o].remove()
  }

  dragToggle(drag:boolean){
    
    let ids = Object.getOwnPropertyNames(this.ws.regions.list);
    for(let r of ids){
      if(r=='repeat' || r[0]=='B')continue;
      this.ws.regions.list[r].isDragging = true;
      this.ws.regions.list[r].drag = true;
      this.ws.regions.list[r].update({drag:drag});
      // this.ws.regions.list[r].update({resize:drag});
    }
  }

  clearRegions(){
    this.ws.clearRegions();
  }

  clearRegions_Beats(){
    let region_names = Object.getOwnPropertyNames(this.ws.regions.list);
    for(let r of region_names)
      if(r[0]=="B")this.ws.regions.list[r].remove();
  }

  play(){
    console.warn('play');
    this.ws.play();
    this.tp.setState('playing');
  }

  pause(){
    console.warn('pause');
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
    }
    
    // this.selectLastMeasurefromCursor();
  }

  stop(){
    console.warn('stop');
    clearTimeout(this.random_timeout);
    this.tp.setState('stopped');
    if( this.ws.regions.list.hasOwnProperty('repeat') ) 
      this.ws.regions.list.repeat.firedIn = false;
    this.ws.stop();
  }
  skip(ms:number){
    // console.log('skip');
    // let length = (this.ws.backend.buffer.length/this.ws.backend.buffer.sampleRate);
    // let time = e.wavesurfer.drawer.handleEvent(E, true)
    this.setCurrentTime(this.ws.backend.getCurrentTime()+ms);

    if(this.ws.backend.getCurrentTime()<0)this.setCurrentTime(0); //IF SKIPPING BEFORE 0 => BUG IN WAVESURFER.js

    // this.selectLastMeasureFromCursor();
    if(ms < 0){
      this.selectPreviousBeatFromCursor();
    }else{
      this.selectNextBeatFromCursor();
    }
    if( this.getState() ) //IF IS PLAYING SO KEEP PLAYING !
      this.play();
    // this.ws.skip(ms); //TRIGGERS A SEEK EVENT
  }

  // public align_selection_on_cursor(){
  //   console.log('align_cursor_on_selection');

  //   if(!this.ws.regions.getCurrentRegion() || !this.ws.regions.getCurrentRegion().hasOwnProperty('id') || this.ws.regions.getCurrentRegion().id == 'repeat'){
  //     console.warn('Warning : cant find region on skip.')
  //     return;
  //   }
  //   let id = this.ws.regions.getCurrentRegion().id;
  //   this.tp.setMeasure( Number(id)-1 );
  //   let sel = this.sm.getPart(this.sm.getMeasures_hash()[id].part -1).getMeasure(this.sm.getMeasures_hash()[id].meas);
  //   this.sel.setSelection([ sel ]);
  // }

  public align_cursor_on_selection(){
    let selection = this.sel.getSelection();

    if(!selection.length)return;
    if(selection[0].type == 'measure'){
      let pos = selection[0].getAudioRegion().start;
      this.setCurrentTime( pos );
    }


  }

  isPlaying(){
    return this.ws.isPlaying();
  }

  playPause(){

    console.log('%c Player : playPause()','color:green; font-size:20px;');

    clearTimeout(this.random_timeout); //erase ghost timeout

    if(this.ws.isPlaying()){

      this.ws.pause();
      this.selectLastMeasureFromCursor();

    }else{
      this.ws.play(this.ws.getCurrentTime());
      if(this.ghost_on)
        this.startGhosting();
    }

    setTimeout(()=>{
      if(this.ws.isPlaying())
        this.tp.setState('playing');
      else
        this.tp.setState('paused')
    },10)
  }

  playMeasures(m:Array<number>){

    // this.
    // this.playPause();
  }

  playMeasure(m_idx:number){
    let h = this.sm.getMeasures_hash()[m_idx];
    let m = this.sm.getPart(h.part).getMeasure(h.meas);
    let r = m.getAudioRegion();
    if(!r){
      console.warn('Region undefined...');
      return;
    }
    this.ws.play(r.start,r.end-0.1);
  }

  setVolume(x:number){
    if(x>1 || x<0)return;

    this.ws.setVolume(x); 
  }

  toggleVolume(){
    (this.ws.getVolume()==0)?this.ws.setVolume(1):this.ws.setVolume(0); 
  }

  randomVolumeToggle() {
    var min = 5,
      max = 10;
    var rand = Math.floor(Math.random() * (max - min + 1) + min); //Generate Random number between 5 - 10
    this.toggleVolume();
    this.random_timeout = setTimeout(()=>{this.randomVolumeToggle();}, rand * 1000);
  }

  startGhosting(){
    var rand = Math.floor(Math.random() * (10 - 5 + 1) + 5); //Generate Random number between 5 - 10
    this.random_timeout = setTimeout(()=>{this.randomVolumeToggle();}, rand * 1000);
  }

  switchGhost(x:boolean){
    if(!x){
      this.ghost_on = false;
      clearTimeout(this.random_timeout);
      this.setVolume(1);
    }else{
      if(this.ws.isPlaying()){
        this.ghost_on = true;
        var rand = Math.floor(Math.random() * (10 - 5 + 1) + 5); //Generate Random number between 5 - 10
        this.random_timeout = setTimeout(()=>{this.randomVolumeToggle();}, rand * 1000);
      }else{
        this.ghost_on = true;
      }
    }
  }

  setPlaybackRate(r:number){
    if(r<0.5 || r>2){
     console.error("error setPlaybackRate : put 1");
     r = 1;
    }

    this.ws.setPlaybackRate(r);
  }

  getState(){
    return this.ws.isPlaying();
  }



  styleMarkers(e){
    const span = document.createElement('span');

    // let text = this.sm.getMeasures_hash()[e.id].meas+1
    
    let text = Number(e.attributes.meas)+1;
    // let text = e.attributes.meas+1+'.'+(e.attributes.beat +1||1); // for beats !!
    span.innerText=String(text);

    $(span).addClass('measureId');
    $(e.element).find('.wavesurfer-handle-start').append(span);

    $(e.element).addClass('region-'+e.id); //IMPORTANT HERE !
  }

  styleParts(e){
    const span = document.createElement('span');

    span.innerText= String(Number(e.attributes.part)+1);
    $(span).addClass('measureId');
    $(e.element).find('.wavesurfer-handle-start').addClass('wavesurfer-part-start');
    $(e.element).find('.wavesurfer-handle-start').append(span);

    // const span2 = document.createElement('span');
    // span2.innerText= '1';
    // $(span2).addClass('firstbeatSpan');
    // madiv.style.height = '100%';
    const madiv = document.createElement('div');
    $(madiv).addClass('firstbeatDiv')

    // $(madiv).append(span2);
    // $(e.element).find('.wavesurfer-handle-start').append(madiv);
    // $(e.element.children[2]).addClass('beat');

    $(e.element).addClass('region-'+e.id); //IMPORTANT HERE
  }

  styleRepeaters(e){

    let handleStart = $(e.element).find('.wavesurfer-handle-start');
    $(handleStart).addClass('loop-start')

    let handleEnd = $(e.element).find('.wavesurfer-handle-end');
    $(handleEnd).addClass('loop-end')

  }

  styleBeats(e){
    const span = document.createElement('span');
    let text = Number(e.attributes.beat)+1; 
    span.innerText=''+text;
    console.log(text);
    $(e.element).find('.wavesurfer-handle-start').append(span);

    $(e.element.children[0]).addClass('beat');
    $(e.element.children[1]).addClass('beat')
    $(e.element).addClass('beat-region');
  }

  dislight_all(){
    // console.log('dislight_all');
    $('.selected').removeClass('selected');
  }

  highlight(id:number){
    $('.region-'+(id)).addClass('selected');
  }

  //measures (regions) stretching to next measure
  getStretch(){
    return this.stretch_on;
  }

  setStretch(x:boolean){
    this.stretch_on = x;
  }

  stretchAll(){
    this.stretchUpdate(Object.getOwnPropertyNames(this.sm.getMeasures_hash()))
  }

  stretchUpdate(measures:Array<any>){
    console.log('%c stretch','color:red;font-size:20px;')
    console.log('measures => ',measures);

    let H = this.sm.getMeasures_hash();

    var m=measures[0]; //current_measure
    for(let i=0; i<measures.length-1; i++, m = measures[i]){

      let h = H[m];
      let next_h = H[measures[i+1]];
      if(!next_h){
        console.warn('Error, no next measure to stretch to... Is there a next measure ?');
        return;
      }

      let cur_meas = this.sm.getPart(h.part).getMeasure(h.meas)
      let next_meas = this.sm.getPart(next_h.part).getMeasure(next_h.meas)

      if(cur_meas.getAudioRegion() && next_meas.getAudioRegion()){
        cur_meas.setAudioRegionEnd(next_meas.getAudioRegion().start)
        let r = cur_meas.getAudioRegion();

        console.log('{measure_nb: m, start: r.start, end: r.end} => ',{measure_nb: m, start: r.start, end: r.end});
        this.updateRegion({measure_nb: m, start: r.start, end: r.end});
      }
    }

  }

  follow(f:boolean){
    this.ws.drawer.params.autoCenter = f;
  }

  // computeTempoRegion_song(){
  //   let P = this.sm.getParts();
  //   for(let p = 0; p < P.length ;p++){
  //     let M = P[p].getMeasures();
  //     for(let m = 0; m < M.length; m++ ){
  //       this.computeTempoRegion_measure(P[p],M[m]);
  //     }
  //   }
  // }

  // computeTempoRegion_measure(p:Part, m:Measure){
  //   console.log("computeTempoRegion_measure ")

  //   let region_names = Object.getOwnPropertyNames(this.ws.regions.list);
  //   for(let r of region_names)
  //     if(r[0]=="B" && Number(r[2])==m.getIdx())this.ws.regions.list[r].remove();


  //   let r = m.getAudioRegion();
  //   if(r == null) return;

  //   var meter = (m.getMeter() == undefined)? p.getMeter():m.getMeter();
  //   let nb_beats =  Number( meter.split("/")[0] );

  //   var m_dur = m.getAudioDuration();
  //   var b_dur = m_dur/nb_beats;

  //   for(let b=0; b < nb_beats; b++){

  //     let b_pos = r.start + (b_dur*b);
  //     let beat_name = "B_"+m.getIdx()+"_"+(b+1);
  //     console.log('beat_name => ',beat_name);
  //     console.log('b_pos => ',b_pos);
  //     console.log('b_dur => ',b_dur);
      
  //   this.addRegion({"measure_nb":beat_name,"start":b_pos,"end":b_pos+b_dur});
  // }

  // }

  public refreshRegions(){
    // this.addRegion({"measure_nb":beat_name,"start":b_pos,"end":b_pos+b_dur});
  }




  public setMeasuresRegions(){
    
    // this.clearRegions_Beats();    

    this.ws.clearRegions();
    
    this.measures_regions = [];

    let P = this.sm.getParts();
    for(let i = 0; i < P.length; i++){
      let p = P[i];

      let M = p.getMeasures();
      for(let m of M){
          let beats = m.getBeats();
          
          let measure_name = m.getIdx();
          console.log("beat_name =>", measure_name);
          this.measures_regions.push({"id":measure_name,"start":m.getAudioRegion().start,"end":m.getAudioRegion().end })
        }
    }//end for


    for(let mr of this.measures_regions){
      this.addRegion(mr);
    }
  }


    
  public setBeatsRegions(){
    
    // this.clearRegions_Beats();    
    // let repeat_region = {}
    let P = this.sm.getParts();
    
    let rpt_start = P[0].getMeasure(0).getAudioRegion().start || 0;
    let rpt_end = P[0].getMeasure(0).getAudioRegion().end || Infinity;
    
    let repeat = {id:'repeat',type:'repeat',start:rpt_start,end:rpt_end,loop:true}
    if(Object.keys(this.ws.regions.list).length)
      repeat = {id:'repeat',type:'repeat',start:this.ws.regions.list.repeat.start,end:this.ws.regions.list.repeat.end,loop:this.ws.regions.list.repeat.loop};

      this.beat_regions = [repeat]; //REMOVING ALL FROM regions except the repeat region
      this.ws.clearRegions();
      
      // debugger
      let H = this.sm.getMeasures_hash();
      
      for(let i = 0; i < P.length; i++){
      let p = P[i];

      let M = p.getMeasures();
      
      // FOR EACH MEASURES
      for(let m of M){
        let beats = m.getBeats();
        
        let part_nb = H[m.getId()].part;
        let meas_nb = H[m.getId()].meas;
        let measure_id = m.getId();

        let ar = this.sm.getPart(part_nb).getMeasure(meas_nb).getAudioRegion();
        if(m.getId()==this.repeat.start){
          rpt_start = ar.start;
          repeat = {id:'repeat',type:'repeat',start:rpt_start,end:rpt_end,loop:true}
          this.beat_regions[0] =  repeat; //REMOVING ALL FROM regions except the repeat region
        }
        if(m.getId()==this.repeat.end){
          rpt_end = ar.end;
          repeat = {id:'repeat',type:'repeat',start:rpt_start,end:rpt_end,loop:true}
          this.beat_regions[0] = repeat; //REMOVING ALL FROM regions except the repeat region
        }
        
          // FOR EACH BEATS
          for(let [i,b] of beats.entries()){
            // SET THE NAME
            let beat_nb = b.getPos();
            
            
            // let obj = {"id":beat_name,"start":b.getAudioRegion().start,"end":b.getAudioRegion().end, type:null,idx:m.getIdx()as any}
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
            
            if(meas_nb == 0 && beat_nb == 0){
              obj.type = 'part';
              obj.end = m.getAudioRegion().end;
            }else if(beat_nb == 0){
              obj.type = 'measure';
              obj.end = m.getAudioRegion().end;
            }else{
              obj.type = 'beat';
              obj.idx= 'B_'+obj.idx+'_'+i;
            }        
            
            
            // console.log("pushing beat =>", obj);
            // this.beat_regions.push({"id":beat_name,"start":b.getAudioRegion().start,"end":b.getAudioRegion().end, type:"beat"})
            this.beat_regions.push(obj)
          }
        }
    }//end for

    this.updateRegion({"id":'repeat',"start":rpt_start,"end":rpt_end});
    for(let br of this.beat_regions){
      console.log("br =>", br)
      this.addRegion(br);
    }
  }

  public resetAllRegionsFromModel(){
    console.log('resetAllRegionsFromModel');
    this.clearRegions();
    let p = this.sm.getParts();
    if(!p.length){
      console.warn('resetAllRegionsFromModel() no regions left');
      return;
    }
    let rpt_start=0;
    let rpt_end=Infinity;

    //add REPEAT region first
    this.addRegion({'id':'repeat',"start":rpt_start,"end":rpt_end});

    let H = this.sm.getMeasures_hash();
    let keys = Object.keys(H);
    for(var h of keys){
      let ar = this.sm.getPart(H[h].part).getMeasure(H[h].meas).getAudioRegion();
      this.addRegion({id:h,"measure_nb":H[h].meas,"start":ar.start,"end":ar.end});
      if(h==this.repeat.start)rpt_start = ar.start;
      if(h==this.repeat.end)rpt_end = ar.end;
    }

    this.updateRegion({"id":'repeat',"start":rpt_start,"end":rpt_end});
    if(this.sel.getSelection().length && this.sel.getSelection()[0].getType() == 'measure')
    this.highlight( this.sel.getSelection()[0].idx );


      // debugger
  }

}// class
