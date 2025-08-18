
@Injectable()
export class DisplayService  {
	private abcString = new Subject<string>();
	public abcString$ = this.abcString.asObservable();
	private markerUpdate = new Subject<any>();
	public markerUpdate$ = this.markerUpdate.asObservable();
	constructor(public private sm:Songmodel){
	}
	renderAbcString(x:string){
  	this.abcString.next(x);
	renderFromModel(){
		let prerender = this.sm.renderWithLyrics();
		this.renderAbcString(prerender);
	renderFromModelWithLeftHand(){
		this.renderAbcString(this.sm.renderWithLeftHand());
	renderMarker(x:any){
    this.markerUpdate.next(x); //goes to youtube-audio component
	changeCss(className, classValue: any) {
	  var cssMainContainer = $('#css-modifier-container');
	  if (cssMainContainer.length == 0: any) {
	      var cssMainContainer = $('<div id="css-modifier-container"></div>');
	      cssMainContainer.hide();
	      cssMainContainer.appendTo($('body'));
	  }
	  let classContainer = cssMainContainer.find('div[data-class="' + className + '"]');
	  if (classContainer.length == 0: any) {
	      classContainer = $('<div data-class="' + className + '"></div>');
	      classContainer.appendTo(cssMainContainer);
	  classContainer.html('<style>' + className + ' {' + classValue + '}</style>');
}
