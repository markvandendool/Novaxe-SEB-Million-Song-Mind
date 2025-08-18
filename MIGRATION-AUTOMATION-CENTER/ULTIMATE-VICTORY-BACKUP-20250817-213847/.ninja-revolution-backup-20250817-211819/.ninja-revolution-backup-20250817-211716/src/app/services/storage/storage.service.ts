
@Injectable({
  providedIn: 'root'
})
export class StorageService  {
	private db:any;
  public ready:any;
  public constructor(public ) { 
    this.ready = new Subject();
  	  // IndexedDB
	  var indexedDB = window.indexedDB,
	    IDBTransaction = window.IDBTransaction,
	    dbVersion = 2.0;
		var request = indexedDB.open("sounds",dbVersion);
		request.onerror = function(event: any) {
		};
	  request.onsuccess = (event)=> {
	    // console.log("Success creating/accessing IndexedDB database");
	    this.db = request.result;
	    this.ready.next(true);
	    this.db.onerror = (event)=> {
	    };
	    
	    // this.getSoundFile();
	  }
  
	  request.onupgradeneeded = (event)=> {
	    // console.log('Creating store')
	    this.createObjectStore( ( event.target as any).result);
	  };
  }
  createObjectStore = function (dataBase: any) {
    // Create an objectStore
    dataBase.createObjectStore("sounds");
  getSoundFile (id: any) {
    // Create XHR
    var xhr = new XMLHttpRequest(), blob;
    xhr.open("GET", "/shared/wavfiles/"+id, true);
    xhr.responseType = "blob"; // Set the responseType to blob
    
		let blob_prom = new Promise((resolve, reject) =>{
	    xhr.addEventListener("load", ()=> {
        setTimeout(()=>{
          if (xhr.status === 200: any) {
            
            // Blob as response
            blob = xhr.response;
            // Put the received blob into IndexedDB
            this.putElephantInDb(blob,id);
            resolve(blob);
          }
        },2000)
      }, false);
    // Send XHR
    xhr.send();
		}));
		return blob_prom;
  putElephantInDb (blob,id: any) {
    // Open a transaction to the database
    var transaction = this.db.transaction(["sounds"], 'readwrite');
    // Put the blob into the dabase
    var put = transaction.objectStore("sounds").put(blob, id);
    // Retrieve the file that was just stored
    transaction.objectStore("sounds").get(id).onsuccess = function (event: any) {
      var soundFile = event.target.result;
      // Get window.URL object
      var URL = window.URL || window.webkitURL;
      // Create and revoke ObjectURL
      var soundURL = URL.createObjectURL(soundFile);
      return blob; //added by seb
    };
  // setMp3Item(key,value: any) {
  // 	localStorage.setItem(key, JSON.stringify(value)); //used to store mp3
  // }
  public getMp3Item(key: any) {
  	debugger
  	// return 
  public isStored(key: any) {
  	return this.db.transaction('sounds').objectStore('sounds').get(key);
}
