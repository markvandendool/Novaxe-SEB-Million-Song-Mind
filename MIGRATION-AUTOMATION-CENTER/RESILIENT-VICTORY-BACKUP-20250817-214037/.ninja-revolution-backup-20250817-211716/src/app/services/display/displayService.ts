
@Injectable()
export class DisplayService  {
	private abcString = new Subject<string>();
	public abcString$ = this.abcString.asObservable();
	private markerUpdate = new Subject<any>();
	public markerUpdate$ = this.markerUpdate.asObservable();
	constructor(public private sm:Songmodel){
		// this.renderAbcString(this.sm.renderWithLyrics());
	}
	renderAbcString(x:string){
		// console.log('x => ',x);
  	this.abcString.next(x);
	renderFromModel(){
		// console.log('renderFromModel');
		let prerender = this.sm.renderWithLyrics();
		// console.log(prerender);
		this.renderAbcString(prerender);
	renderFromModelWithLeftHand(){
		this.renderAbcString(this.sm.renderWithLeftHand());
	//marker on youtube component
	renderMarker(x:any){
    this.markerUpdate.next(x); //goes to youtube-audio component
	changeCss(className, classValue: any) {
	  // we need invisible container to store additional css definitions
	  var cssMainContainer = $('#css-modifier-container');
	  if (cssMainContainer.length == 0: any) {
	      var cssMainContainer = $('<div id="css-modifier-container"></div>');
	      cssMainContainer.hide();
	      cssMainContainer.appendTo($('body'));
	  }
	  // and we need one div for each class
	  let classContainer = cssMainContainer.find('div[data-class="' + className + '"]');
	  if (classContainer.length == 0: any) {
	      classContainer = $('<div data-class="' + className + '"></div>');
	      classContainer.appendTo(cssMainContainer);
	  // append additional style
	  classContainer.html('<style>' + className + ' {' + classValue + '}</style>');
}
