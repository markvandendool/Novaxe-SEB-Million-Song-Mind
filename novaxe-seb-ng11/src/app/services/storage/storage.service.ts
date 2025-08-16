import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

	private db:any;

  public ready:any;

  constructor() { 

    this.ready = new Subject();

  	  // IndexedDB
	  var indexedDB = window.indexedDB,
	    IDBTransaction = window.IDBTransaction,
	    dbVersion = 2.0;

		var request = indexedDB.open("sounds",dbVersion);

		request.onerror = function(event) {
		  console.log("Why didn't you allow my web app to use IndexedDB?!");
		};

	  request.onsuccess = (event)=> {
	    // console.log("Success creating/accessing IndexedDB database");
	    this.db = request.result;
	    this.ready.next(true);


	    this.db.onerror = (event)=> {
	      console.log("Error creating/accessing IndexedDB database");
	    };
	    
	    // this.getSoundFile();
	  }
  
	  request.onupgradeneeded = (event)=> {
	    // console.log('Creating store')
	    this.createObjectStore( ( event.target as any).result);
	  };

  }

  createObjectStore = function (dataBase) {
    // Create an objectStore
    console.log("Creating objectStore")
    dataBase.createObjectStore("sounds");
  }

  getSoundFile (id) {
    // Create XHR
  	console.log('\ngetSoundFile-------------------\n'+id);
    var xhr = new XMLHttpRequest(), blob;
    xhr.open("GET", "/shared/wavfiles/"+id, true);
    xhr.responseType = "blob"; // Set the responseType to blob

    console.log('opening : \n'+ '/shared/wavfiles/'+id);
    
    
		let blob_prom = new Promise((resolve, reject) =>{

	    xhr.addEventListener("load", ()=> {
        setTimeout(()=>{
          if (xhr.status === 200) {
            console.log("Sound retrieved");
            
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
		});

		return blob_prom;
  }

  putElephantInDb (blob,id) {
    console.log("Putting elephants in IndexedDB");

    // Open a transaction to the database
    var transaction = this.db.transaction(["sounds"], 'readwrite');

    // Put the blob into the dabase
    var put = transaction.objectStore("sounds").put(blob, id);

    // Retrieve the file that was just stored
    transaction.objectStore("sounds").get(id).onsuccess = function (event) {
      var soundFile = event.target.result;
      console.log(soundFile);

      // Get window.URL object
      var URL = window.URL || window.webkitURL;

      // Create and revoke ObjectURL
      var soundURL = URL.createObjectURL(soundFile);
      console.log('soundURL => ',soundURL);

      return blob; //added by seb
    };
  }

  // setMp3Item(key,value){
  // 	localStorage.setItem(key, JSON.stringify(value)); //used to store mp3
  // }

  getMp3Item(key){
  	debugger
  	// return 
  }

  isStored(key){
  	return this.db.transaction('sounds').objectStore('sounds').get(key);
  }
}
