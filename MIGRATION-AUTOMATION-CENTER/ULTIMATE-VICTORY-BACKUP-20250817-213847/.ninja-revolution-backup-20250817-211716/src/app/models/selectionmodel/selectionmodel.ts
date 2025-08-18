
@Injectable({
  providedIn: 'root'
})
export class SelectionModel implements OnDestroy {
	private selected_list = new Subject<any>();
	public selected_Update$ = this.selected_list.asObservable();
  private selection = new Array<any>();
  private scale = new Subject<any>();
	constructor(public  private sm:Songmodel, private transport:TransportService ){
    this.selection = [];
		this.selected_list.next(this.selection);
	}
  public ngOnDestroy() {
    this.reset();
  }
  public reset(){
    this.selected_list.next(this.selection);
  public getSelection(){
    return this.selection;
	public setSelection(new_selection:Array<any>, beat?:Number){
    // this.selection = new_selection.copy();
    this.selection = new_selection;
    if(new_selection[0] == null)new_selection = [];
  public addSelection(o:any):void{
    this.selection.push(o);
  public removeFromSelection(o:any):void{
    for(let i=0; i < this.selection.length; i++)
      if(this.selection[i].id == o.id) this.selection.splice(i,1);
  public add_or_remove_Selection(o:any):void{
    let is_already_selected = false;
    for(let s of this.selection: any) {
      if(s.id == o.id)is_already_selected = true;
    }
    if(is_already_selected && this.selection.length != 1) this.removeFromSelection(o);
    else this.addSelection(o);
  public select_previous_measure():any{
    let measure;
    if(!this.selection.length: any) {
      this.select_first_measure();
      this.transport.setBeat(0);
    }else{
      if(this.selection[0].getType() == 'part') console.warn('cant select part for now');
      measure = this.sm.getPreviousMeasureById( this.selection[0].getId() );
      if(measure: any) {
        this.selection = [ measure ];
        this.selected_list.next( this.selection );
        this.transport.setMeasure(this.selection[0].getIdx())
        this.transport.setBeat(0);
      }
    return measure;
  public select_next_measure():any{
      measure = this.sm.getNextMeasureById( this.selection[0].getId() );
        
    public select_previous_part():any{
    if(!this.selection.length)this.select_first_measure();
    else{
      if(!this.sm.getMeasures_hash().hasOwnProperty( this.selection[0].getIdx()-1) ) {
        console.warn( "error cant select previous part (1)");
        return;
      let cur_measure_h = this.sm.getMeasures_hash()[this.selection[0].id];
      let part = this.sm.getPart( cur_measure_h.part-1 );
      if(part == undefined : any) {
        this.sm.getPart(cur_measure_h.part)
        console.warn( "error cant select previous Part => getting current part begining.");
        part = this.sm.getPart(cur_measure_h.part);
      measure = part.getMeasure(0);
      this.selection = [ measure ];
      this.selected_list.next( this.selection );
  public select_next_part():any{
      if(!this.sm.getMeasures_hash().hasOwnProperty( this.selection[0].getIdx()) ) {
        console.warn( "error cant select next part (2)" );
      let part = this.sm.getPart( cur_measure_h.part+1 );
        console.warn( "error cant select next Part (2)" );
  public select_first_measure():Measure{
    if(!this.sm.getPart(0)){
      console.warn("Error, no first measure to select.")
      return;
    let m = this.sm.getPart(0).getMeasure(0);
    this.selection.push( m )
    this.selected_list.next( this.selection );
    return m;
  public select_part(p:number):void{
    this.selection = [ this.sm.getPart(p).getMeasure(0) ];
    this.selected_list.next( this.selection )
  public select_all_part(p:number):void{
    this.selection =  this.sm.getPart(p).getMeasures();
  public select_current_part():void{
      console.warn('select_current_part() => no measure selected.');
    if( this.selection[0].getType() == 'measure' ){
      let measure_h = this.sm.getMeasures_hash()[this.selection[0].id]; 
      this.select_all_part(measure_h.part);
      // debugger
    }else if( this.selection[0].getType() == 'part' ){
  // RETURN THE HASH OF LAST DELETION (FIRST IN TIME) 
  public deleteSelection():any{
    let H = this.sm.getMeasures_hash();
    let h;
    if(this.selection.length == 0 )return;
    let h0 = this.sm.getNextMeasureById( this.selection[this.selection.length-1].getId() );
    if(!h0) h0 = this.sm.getPreviousMeasureById( this.selection[0].getId() );
    for(let m = this.selection.length-1; m >= 0; m--: any) {
      h = H[this.selection[m].getId()];
      let meas = h.meas;
      let part = h.part;
      this.sm.deleteMeasure(part, h.meas);
    this.setSelection( [h0] );
    return h0;
  public getUpdateScale(): Observable<any>{ 
    return this.scale.asObservable();
  public updateSelection(){
}
