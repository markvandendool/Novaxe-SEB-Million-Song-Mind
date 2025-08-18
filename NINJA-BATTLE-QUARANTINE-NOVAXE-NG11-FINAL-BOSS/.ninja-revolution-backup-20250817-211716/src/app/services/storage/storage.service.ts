
@Injectable({
  providedIn: 'root'
})
export class StorageService  {
	private db:any;
  public ready:any;
  public constructor(public ) {
    this.ready = new Subject();
	  var indexedDB = window.indexedDB,
	    IDBTransaction = window.IDBTransaction,
	    dbVersion = 2.0;
		var request = indexedDB.open("sounds",dbVersion);
		request.onerror = function(event: any) {
		};
	  request.onsuccess = (event)=> {
	    this.db = request.result;
	    this.ready.next(true);
	    this.db.onerror = (event)=> {
	    };

	  }

	  request.onupgradeneeded = (event)=> {
	    this.createObjectStore( ( event.target as any).result);
	  };
  }
  createObjectStore = function (dataBase: any) {
    dataBase.createObjectStore("sounds");
  getSoundFile (id: any) {
    var xhr = new XMLHttpRequest(), blob;
    xhr.open("GET", "/shared/wavfiles/"+id, true);
    xhr.responseType = "blob"; // Set the responseType to blob

		let blob_prom = new Promise((resolve, reject) =>{
	    xhr.addEventListener("load", ()=> {
        setTimeout(()=>{
          if (xhr.status === 200: any) {

            blob = xhr.response;
            this.putElephantInDb(blob,id);
            resolve(blob);
          }
        },2000)
      }, false);
    xhr.send();
		}));
		return blob_prom;
  putElephantInDb (blob,id: any) {
    var transaction = this.db.transaction(["sounds"], 'readwrite');
    var put = transaction.objectStore("sounds").put(blob, id);
    transaction.objectStore("sounds").get(id).onsuccess = function (event: any) {
      var soundFile = event.target.result;
      var URL = window.URL || window.webkitURL;
      var soundURL = URL.createObjectURL(soundFile);
      return blob; //added by seb
    };
  public getMp3Item(key: any) {
  	debugger
  public isStored(key: any) {
  	return this.db.transaction('sounds').objectStore('sounds').get(key);
}
