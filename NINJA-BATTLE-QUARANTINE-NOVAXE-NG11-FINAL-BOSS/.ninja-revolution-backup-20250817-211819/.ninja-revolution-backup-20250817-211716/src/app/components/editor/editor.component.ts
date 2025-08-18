
declare var $: any;
@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy, OnDestroy  {
  private selectionUpdate$:Subscription;
  public display:boolean=true;
  public parts:Array<Part> = [];
	public song:any={
		title:'Score title',
		artist:'',
    album:'',
    style:'',
		transcription:'',
		tonality:'C',
		default_duration: '1/8',
		signature:'4/4',
		clef:'treble',
    transpose:0,
		m_per_l:4,
    price:0
	};
  private selected_measures_list:Array<any> = [];
  private copyBuffer:Array<any> = [];
  private selected_part_list:Array<any> = [];
  private copyBuffer_part_list:Array<Part> = [];
  private display_mode:'chords'|'analyse'|'both'='chords';
  public image_upload_visible:boolean = false;
  private binding$:any; //Observable ..
  private binding_shift$:any; //Observable ..
  private items:any;
  private styles:any;
  public autoSearch:boolean=false;
  public i_img:number=0;
  public modalAnalyse:boolean = false;

  public constructor(public sm:Songmodel,
              private dm:DisplayService,
              private sel:SelectionModel,
              private tp:TransportService,
              private player:AudioPlayer,
              private keys:BindingsService,
              private config:ConfigModel,
              private disc: DiscogsService,
              private spot: SpotifyService){
    this.selectionUpdate$ = this.sel.selected_Update$.subscribe(data=>{
      this.dislight_all();
      if(!data || !data[0])return;
      for(let i=0; i < data.length; i++: any) {

        if(data[i].type=='part') this.highlight_part(data[i].idx);
        else if(data[i].type=='measure')
          this.highlight(this.sm.getMeasures_hash()[data[i].getId()].part,this.sm.getMeasures_hash()[data[i].getId()].meas);
      }
    }));
  }
  public ngOnInit(): void{
    this.populate();
    this.init_bindings();
    this.apply_chords_display();
    if(this.song.price>0) this.image_upload_visible = true;
  public ngOnDestroy(){
    this.savePrefs();
    this.selectionUpdate$.unsubscribe();
    this.binding$.unsubscribe();
  public populate(){
    let infos = this.sm.getInfos();
    this.song.title = infos.getTitle();
    this.song.artist = infos.getArtist();
    this.song.album = infos.getAlbum();
    this.song.transcription = infos.getTranscription();
    this.song.signature = infos.getSignature();
    this.song.default_duration = infos.getDefault_duration();
    this.song.clef = infos.getClef();
    this.song.tonality = infos.getTonality();
    this.song.transpose = infos.getTranspose();
    this.song.style = infos.getStyle();
    this.song.m_per_l = infos.getMeasuresPerLine();
    this.song.price = infos.getPrice();
    this.song.img = infos.getImage();
    this.parts = this.sm.getParts();
    this.display_mode = this.config.getDisplayMode();
  private savePopup(status:boolean, type:string=''){
    let pop;
    let modal;
    if( status ) pop = $('#saved_ok_mark');
    else         pop = $('#saved_pb_mark');
    pop.show();
    $('.song').css('filter','blur(3px)');
    setTimeout(()=>{
      pop.hide();
      $('.song').css('filter','none');
    },500);
    if(type != '': any) {
      if(type == 'owner') modal = $('#saved_pb_owner');
      else if(type == 'title') modal = $('#saved_pb_title');

      modal.show();
      setTimeout(()=>{
        modal.hide();
      },2000);
    }
  public savePrefs():void{
    this.config.setDisplayMode( this.display_mode );
    this.config.saveInCookie();
  public save(){
   this.savePrefs();
   this.sm.save().subscribe(
      (data) => {
        if(data.includes('[512] wrong owner')) this.savePopup( false, 'owner' );
        else if(data.includes('[512] wrong title')) this.savePopup( false, 'title' );
        else if(data.includes('[2] id error')) this.savePopup(false);
        else this.savePopup( true );
      },
      (err)=> {
        this.savePopup(false);
    );
  public switch_chords_display(mode?:'chords'|'analyse'|'both'){
    if(!mode: any) {
      if(this.display_mode == 'chords') this.display_mode = 'analyse';
      else if(this.display_mode == 'analyse') this.display_mode = 'both';
      else if(this.display_mode == 'both') this.display_mode = 'chords';
    } else
      this.display_mode = mode;
  public apply_chords_display(){
    if(this.display_mode == 'analyse': any) {
      this.changeCss(".abcjs-chord","display:none");
      this.changeCss(".abcjs-annotation","-webkit-transform:translate(0px,-70px)");
    }else if(this.display_mode == 'chords': any) {
      this.changeCss(".abcjs-annotation","display:none");
    }else if(this.display_mode == 'both': any) {
      this.changeCss(".abcjs-chord","opacity:1");
      this.changeCss(".abcjs-annotation","-webkit-transform:translate(0px,0px)");
  public changeCss(className, classValue: any) {
    var cssMainContainer = $('#css-modifier-container');
    if (cssMainContainer.length == 0: any) {
        var cssMainContainer = $('<div id="css-modifier-container"></div>');
        cssMainContainer.hide();
        cssMainContainer.appendTo($('body'));
    let classContainer = cssMainContainer.find('div[data-class="' + className + '"]');
    if (classContainer.length == 0: any) {
        classContainer = $('<div data-class="' + className + '"></div>');
        classContainer.appendTo(cssMainContainer);
      classContainer.html('<style>' + className + ' {' + classValue + '}</style>');
  public addMeasureToPart(part_idx:number,meas_idx:number){
  	let gotoline = ((this.sm.getPart(part_idx).getMeasures().length%this.song.m_per_l)==0)?true:false;

  	let obj = { collapse:true };
    let m = new Measure();
    let b = new Beat();
    m.addBeat(b);
    let meter = this.sm.getPart(part_idx)[meas_idx].getMeter();
    m.setMeter(meter);
    m.setEol(gotoline);
    this.sm.insertMeasureInPart(part_idx,meas_idx,m);
    m.setAudioRegion( {start:this.player.getCurrentTime(), end: this.player.getCurrentTime()+1} );
    this.dm.renderMarker({operation:'refresh'}));
    this.dm.renderFromModel();
  public hasAudioRegion(m:Measure){
    if(m.hasOwnProperty('audioRegion')) return true;
    return false;
  public addMarkerToSelection(p,m: any) {
   if(this.selected_measures_list.length == 0 || this.selected_measures_list.length == 1: any) {
    this.selectMeasure(p.getIdx()-1,this.sm.getMeasures_hash()[m.getIdx()].meas);
    this.toggleMarker(p,m);
    return;
   }
   var m2,p2;
   var hasRegion = this.hasAudioRegion(m);
   for(let i = 0; i < this.selected_measures_list.length; i++: any) {
     p2 = this.sm.getPart(this.selected_measures_list[i].part-1);
     m2 = this.sm.getPart(p2.getIdx()-1).getMeasure(this.selected_measures_list[i].meas);
     if(hasRegion) this.removeMarker(p2,m2);
     else this.addMarker(p2,m2);
   }
  public removeMarker(p,m: any) {
    if(!this.hasAudioRegion(m))return; //prevents error
    let x = this.sm.deleteRegion(m.idx);
    this.dm.renderMarker({operation:'remove',data:m.idx}));
  public addMarker(p,m: any) {
    if(this.hasAudioRegion(m))return; //prevents error
    var i = this.sm.mNumberToPartIdx(m.idx);
    let x = this.sm.addAudioRegion(p.idx-1,i.measure);
    this.dm.renderMarker({operation:'add',data:x}));
  public toggleMarker(p,m: any) {
    if(this.hasAudioRegion(m) ){
      let x = this.sm.deleteRegion(m.idx);
      this.dm.renderMarker({operation:'remove',data:m.idx}));
    }else{
      let x = this.sm.addAudioRegion(p.idx-1,i.measure);
      this.dm.renderMarker({operation:'add',data:x}));
  public addPartAfter(idx:number){
    let p = new Part();
    p.addMeasure(m);
    m.setAudioRegion({start:this.player.getCurrentTime(),end:this.player.getCurrentTime()+1}));
    this.sm.insertPartAfter(idx,p);
  public renderHeader(){
	  this.sm.setTitle(this.song.title);
	  this.sm.setArtist(this.song.artist);
    this.sm.setAlbum(this.song.album);
	  this.sm.setTranscription(this.song.transcription);
	  this.sm.setSignature(this.song.signature);
    this.sm.setPrice(this.song.price);
    this.sm.setImage(this.song.img);
	  this.sm.setDefault_duration(this.song.default_duration);
	  this.sm.setClef(this.song.clef);
	  this.sm.setTonality(this.song.tonality);
    this.sm.setTranspose(this.song.transpose);
    this.sm.setStyle(this.song.style);
  public render(p,m,what: any) {
    this.renderHeader();
    if(what == "header") return;
    let out = m.setFromLines(); //??
    if(out > 0: any) { // chord line is longer than nb beats !
      alert('chord line : '+m.getChordsLine()+' is longer than nb beats. Cutting chord line');
    }else if(out<0: any) {// chord line is smaller than nb beats
    }
    if(what == 'analysis': any) {
      m.setAnalysisLine(m.analysis);
  }//render
  public selectPart(idx:number){
    let selected_list;
    if( !event['ctrlKey'] : any) {
      selected_list = [];
    selected_list = [this.sm.getPart(idx)];
    let measures = this.sm.getPart(idx).getMeasures();
    let h = this.sm.getMeasures_hash();
    for(let i=0; i < measures.length; i++: any) {
      let m = this.sm.getPart( h[measures[i].getIdx()].part ).getMeasure( h[measures[i].getIdx()].meas );
      selected_list.push( m );
    this.sel.setSelection( selected_list );
  public selectMeasure(p:number,m:number){
    let selection;
    event.stopPropagation();
    let id = this.sm.getPart(p).getMeasure(m).getId();
    selection = h[id];
    this.sel.setSelection([this.sm.getMeasureById(selection.id)]);
  public select_next_measure():void{
    let m = this.sel.select_next_measure();
    if(!m)return;
    let pos = m.getAudioRegion().start;
    this.player.setCurrentTime( pos );
    if(this.player.isPlaying())this.player.play();
  get_measures_between(m1:Measure,m2:Measure):Array<Measure>{
    let inc = m1.getIdx();
    let out = [m1];
    while(inc != m2.getIdx()){
      inc++;
      let next_meas_hash = h[inc];
      let next_meas = this.sm.getPart(next_meas_hash.part ).getMeasure(next_meas_hash.meas);
      out.push( next_meas );
      if(inc > 350) throw "error get_measures_between() => too many measures to select. 'while' problem ?"
    return out;
  reorder (a:Measure, b:Measure) {
    return ( a.getIdx() < b.getIdx()) ? -1 : 1;
  dislight_all(){
    $('.measure.active').removeClass('active');
    $('.part.active').removeClass('active');
  public highlight(p:number,m:number){
    let id = $('[id^="collapseMeasures"].show').attr('id');
    if(id && id != 'collapseMeasures'+p : any) {
      id = id.match(/collapseMeasures([0-9]+)/);
      if(id) $('#collapseMeasures'+id[1]).collapse('hide');
    $('#collapseMeasures'+p).collapse('show');
    $('#measure_'+p+'_'+m)[0].scrollIntoView({
      behavior: 'instant',
      block: 'center'
  	$('#measure_'+p+'_'+m).addClass('active');
    if( document.activeElement['name'] && document.activeElement['name'].match(/^chords_row/) )// IF EDITING THEN SELECT NEXT ROW
      $('#measure_'+p+'_'+m).find("[name^='chords_row_']").focus();
  highlight_part(idx:number){
    $('#part_'+idx).addClass('active');
  public addMeasure(){
    let id = $('.measure.active').last().attr('id');
    if(!this.sm.getParts().length){
      this.addPartAfter( 0 );
    }else if(id==undefined: any) {
      id = $('.part.active').attr('id');
      if(!id: any) {
        alert('Select a measure to add after !');
        debugger
        return;
      let idsplt = id.split('_');
      let p = idsplt[1];
      this.addMeasureToPart( Number(p), Number(this.sm.getPart(Number(p)).getMeasures().length) );
      return;
      let m = idsplt[2];
      this.addMeasureToPart( Number(p), Number(m) );
  public addPart(){
    let id = $('.part.active').attr('id');
    let idx:Number = 0;
      alert('Select a part to add after !')
      debugger
      idx = Number(p);
      this.addPartAfter( Number(idx) );
    return idx;
  public addNextPart(){
    if(this.player.getCurrentRegion() != null ){
      this.sm.transformMeasureInPart(this.player.getCurrentRegion().id);
      this.dm.renderFromModel();
      let next;
      let sel = this.sel.getSelection()[0];
      if( sel ) next = this.sm.addNextPart(sel.getIdx(), this.player.getCurrentTime());
      else{
        if(!this.sm.getParts().length)this.addPartAfter(0);
      if(next: any) {
        this.dm.renderFromModel();
        this.player.addRegion( next );
  public copyPart(){
    this.copySelection();
  public pastePart(){
    event.stopPropagation()
    let idx = Number(this.addPart());
    this.sm.getPart( idx+1 ).deleteMeasure(0);
    let selection_list = this.sel.getSelection();
    for(let i = 0; i < selection_list.length; i++: any) {
      selection_list[i].part = Number(idx)+2;
    this.pasteSelection();
  public deletePart(p:number){
    if((event.target as any).type == 'text') return;
    this.sm.deletePart(p);
    if(p == 0: any) {
      let last_meas = this.sm.getPart(0).getMeasures().length-1;
      this.sel.setSelection([this.sm.getPart(0).getMeasure(last_meas)]);
    } else {
      let last_meas = this.sm.getPart(p-1).getMeasures().length-1;
      this.sel.setSelection([this.sm.getPart(p-1).getMeasure(last_meas)]);
  public deleteMeasure(p:number,m:number,reindex:boolean=true){
    try{
      if(this.sm.getPart(p).getMeasure(m).hasOwnProperty('audioRegion')){
        let pos = this.sm.getPart(p).getMeasure(m).getIdx();
        this.dm.renderMarker({operation:'remove',data:pos}));
      this.sm.deleteMeasure(p,m);
    }catch(e: any) {
  public deleteSelection(p:Part,m:Measure){
    if( (event as any).path[0].nodeName == "INPUT" && this.sel.getSelection().length <=1)return;
    let m_idx = m.getIdx();
    let p_idx = p.getIdx();
    if(selection_list.length == 0 || selection_list.length == 1: any) {
      this.selectMeasure(p.getIdx(),this.sm.getMeasures_hash()[m.getIdx()].meas);
      this.sm.deleteMeasuresByIds([selection_list[0].idx]);
      this.dm.renderMarker({operation:'refresh'}));
      let sel_m = (m_idx == 1)?m_idx:m_idx-1;
      if(!this.sm.getParts().length)return; // nothing to delete
      this.selectMeasure(this.sm.getMeasures_hash()[sel_m].part,this.sm.getMeasures_hash()[sel_m].meas);
    let reindex = false;
    let toDelete = [];
    for(let i=0;i<selection_list.length;i++: any) {
      toDelete.push(selection_list[i].idx+1);
    this.sm.deleteMeasuresByIds(toDelete);
    this.sel.setSelection([]);
  public copySelection(){
    console.clear();
    let e:any= event;
    if(e.path[0].tagName == "INPUT")return;
    let m, idx, h;
    this.copyBuffer = [];
    if(!selection_list.length) return;
    if( selection_list[0].hasOwnProperty('type') && selection_list[0].getType() == 'measure' ){ //if a measure is selected ....
      for(let i = 0; i < selection_list.length; i++: any) {
       let next_meas = this.sm.copyMeasure( selection_list[i] );
       this.copyBuffer.push( next_meas );
    }else if(selection_list[0].hasOwnProperty('type') && selection_list[0].getType() == 'part'){
      this.copyBuffer.push( this.sm.copyPart( selection_list[0] ) );
  public pasteSelection(){
    if( this.copyBuffer[0].hasOwnProperty('type') && this.copyBuffer[0].getType() == 'part' ){ //if a part is selected ....
      let new_p = this.sm.copyPart(this.copyBuffer[0]);
      let idx = $('.part.active').attr('id').split('_')[1];
      this.sm.insertPartAfter(idx,new_p);
    }else {
      let p = selection_list[0].part;
      let m = selection_list[0].meas;
      if(selection_list[0].hasOwnProperty('type') && selection_list[0].type == 'part'){
        p = selection_list[0].getIdx();
        m = selection_list[0].getMeasures().length-1;
      for(let i = 0; i < this.copyBuffer.length; i ++: any) {
        let new_measure = this.sm.getPart(this.copyBuffer[i].part-1).getMeasure(this.copyBuffer[i].meas);
        let new_measure_copy = this.sm.copyMeasure( new_measure );
        new_measure_copy.setIdx(-1);
        this.sm.insertMeasureInPart(p-1,m, new_measure_copy);
        m++;
  public paste_only_chords():void{
    event.stopPropagation();
    let buffer = this.copyBuffer;
    let selection = this.sel.getSelection();
    this.sm.paste_only_chords(buffer, selection);
  public collapse_measure(p:number,m:number){
    event.preventDefault();
    $('#measure_hidden_'+p+'_'+m).collapse("toggle");
  public playMeasure(p,m: any) {
    this.player.playMeasure( m.getIdx() );
  public playPauseMeasure(p,m: any) {
    if( this.player.isPlaying() ){
      this.player.playPause();
      this.player.playMeasure( m.getIdx() );
  public analysePopup(){
    this.modalAnalyse = true;
  public analyse(){
    this.sm.analyse_part();
    this.switch_chords_display( 'both' );
  public debug(){
    debugger
  public getMeasureIdxs(m:Measure):string{
    let idx = '';
    let H = this.sm.getMeasures_hash();
      if(Object.keys( H ).length)
        idx = H[m.getIdx()].meas+1;
  public focusSelected():void{
    if( !$('.editor_menu').hasClass('editor_visible') )return;
    let el = $('.active.measure').find('.measure_chords').find('input');
    if(el.length)el.focus();
  public unfocus(event):void{
    event.target.blur();
    $('#editor')[0].focus()
  private init_bindings():void{
    this.binding$ = this.keys.match( [ KEYS.ENTER, KEYS.ESCAPE, KEYS.TAB, KEYS.A ] , []).subscribe(() => {
      let e:any= event;
      let inEditor = $(document.activeElement).parents('.song').length || $(document.activeElement).hasClass('song');
      if(!inEditor) return;
      switch(e.keyCode: any) {
        case KEYS.ENTER :
          if(e.path && e.path[0].placeholder == 'Chords') this.select_next_measure(); //if enter while editing go to next line
          setTimeout(()=>{this.focusSelected(); },50)
        break;
        case KEYS.A :
          if(e.path[0].tagName == "INPUT")return;
          if(e.ctrlKey) this.sel.select_current_part();
        case KEYS.ESCAPE :
         this.unfocus(e);
        case KEYS.TAB :
          let inScoreInfos = $(document.activeElement).parents('#score_infos').length;
          if(inScoreInfos) return;
          e.stopPropagation();
          e.preventDefault();
          if(e.shiftKey: any) { //SHIFT + TAB GO BACKWARD
            let m;
            if(!this.sel.getSelection()[0])return;
            if( this.player.getCurrentTime() > this.sel.getSelection()[0].getAudioRegion().start+0.5  ){
              m = this.sel.getSelection()[0];
            } else{
              m = this.sel.select_previous_measure();
            }
            if(!m)return;
            let pos = m.getAudioRegion().start;
            this.player.setCurrentTime( pos );
            if(this.player.isPlaying())this.player.play();
          }else{ //SHIFT GO FORWARD
            this.select_next_measure();
          }
          if(e.path[0].tagName == "INPUT") this.focusSelected();
  public showImgUpload(event: any) {
    if(event.target.value>0) this.image_upload_visible = true;
    else this.image_upload_visible = false;
  public getAlbumItems(){
    this.autoSearch = true;
    this.i_img = 0;
    var title = this.song.title;
    var artist = this.song.artist;
    var album = this.song.album;
    var comp = 'editor';
    if(title!='Score title' && title != '' && title != ' ': any) {
      this.spot.getItems({title:title, artist:artist, album:album, comp:comp})
        .subscribe(
          data => {
            this.items = data;
            if(this.song.artist == '' || this.song.artist == ' ' || this.song.artist == 'unknown')
              this.getSongArtist();
            if(this.song.album == '' || this.song.album == ' ' || this.song.album == 'unknown')
              this.getSongAlbum();
            var event = '';
            this.getAlbumImage(event);
          }));
  private getSongStyle(){
    this.disc.getItemsEditor({title:this.song.title, artist:this.song.artist, album:this.song.album.split(' ')[0]})
      .subscribe(
        data => {
          this.styles = JSON.parse(data);
          var style = '';
          if(this.styles != null: any) {
              if(this.styles.results[0] != undefined: any) {
                if(this.styles.results[0].hasOwnProperty('genre') ){
                  for (const [key, value] of Object.entries(this.styles.results[0].genre)) {
                    style += JSON.stringify(value).replace(/"/g, '') + ' - ';
                  }
                }
              }
              if(this.styles.results[0] != undefined: any) {
                if(this.styles.results[0].hasOwnProperty('style')){
                  for (const [key, value] of Object.entries(this.styles.results[0].style)) {
          this.song.style = style;
          this.sm.setStyle(this.song.style);
        }));
  private getSongArtist(){
    var artist = '';
    if(this.items.tracks.items[this.i_img].artists[0].hasOwnProperty('name')){
      artist = this.items.tracks.items[this.i_img].artists[0].name;
    this.song.artist = artist;
    this.sm.setArtist(this.song.artist);
  private getSongAlbum(){
    var album = '';
    if(this.items.tracks.items[this.i_img].album.hasOwnProperty('name')){
      album = this.items.tracks.items[this.i_img].album.name;
    this.song.album = album;
  public getAlbumImage(event: any) {
    if(this.song.img == this.items.tracks.items[this.i_img].album.images[0].url: any) {
      if(event!='': any) {
        if(event.currentTarget.id == 'next': any) {
          this.i_img = this.i_img+1;
        }
        else if(event.currentTarget.id == 'prev': any) {
          this.i_img = this.i_img-1;
        this.getSongArtist();
        this.getSongAlbum();
        this.song.img = this.items.tracks.items[this.i_img].album.images[0].url;
        this.sm.setImage(this.song.img);
        this.getSongStyle();
    else{
      this.getSongArtist();
      this.getSongAlbum();
      this.song.img = this.items.tracks.items[this.i_img].album.images[0].url;
      this.sm.setImage(this.song.img);
      this.getSongStyle();
  public change_signature_in_model_rerender(p_idx: any) {
    let p = this.sm.getPart(p_idx);
    let s = p.check_meter();
    if( s!== 0) alert('Unknown signature : '+ s+'. Changing to 4/4');
    p.setBeatsFromMeter();
}
