import { Injectable } from '@angular/core';
import { Songmodel } from '@models/songmodel/songmodel';
import { Measure } from '@models/songmodel/measure';
import { Beat } from '@models/songmodel/beat';
import { Part } from '@models/songmodel/part';

@Injectable({
  providedIn: 'root'
})
export class MinimalRenderService {

  public lineNb = 0;

  constructor(private sm:Songmodel) { }


  public render(id:string){

    if( !$('#'+id).length)throw "error MinimalRenderService => bad id"

    let container = document.getElementById(id);
    container.innerHTML = "";
    // container.style.all="revert"
    container.style.height = "";
    container.style.overflow = "hidden";
    container.style.position = "absolute";

    let songTitle = document.createElement('span');
    songTitle.innerHTML = this.sm.getTitle();
    container.appendChild( songTitle );

    songTitle.style.fontSize = "25px";
    songTitle.style.marginLeft = "20px";

    let songArtist = document.createElement('span');
    songArtist.innerHTML = (this.sm.getArtist()!='unknown'||this.sm.getArtist()=='')?' by <strong>'+this.sm.getArtist()+'</strong>':'';
    container.appendChild( songArtist );

    songArtist.style.fontSize = "25px";

    let songKey = document.createElementNS("http://www.w3.org/1999/xhtml","div");
    songKey.innerHTML = this.sm.getTonality()!=''?'Key: '+this.sm.getTonality():'';
    container.appendChild( songKey );

    songKey.style.fontSize = "20px";
    songKey.style.marginLeft = "20px";
    songKey.style.marginBottom = "20px";

    container = this.styliseContainer(container);


    let newdiv = document.createElementNS("http://www.w3.org/1999/xhtml","div");

    // let txtnode = document.createTextNode("This is text that was constructed dynamically with createElementNS and createTextNode then inserted into the document using appendChild.");

    this.lineNb = 0;

    let parts = this.sm.getParts();
    for (const [i, part] of parts.entries()) {
      // console.log(i, part)
      let partNode = this.getPartNode(part);

      container.appendChild(partNode);
    }
  }



  public getPartNode( part: Part ):any{
    
    let out = [];
    let measureNb = 0;

    let table = document.createElement('table');

    let partTitle = document.createElement('tr');
    partTitle.innerHTML = '['+part.getTitle()+']';
    table.appendChild(partTitle);

    let partSignature = document.createElement('span');
    partSignature.innerHTML = '('+part.getMeter()+')';
    table.appendChild(partSignature);

    let partKey = document.createElement('span');
    partKey.innerHTML = part.getTonality()!=''?'Key: '+part.getTonality():'';
    table.appendChild(partKey);

    partKey.style.marginLeft = "20px";

    let measures = part.getMeasures();
    let lineNode = document.createElement('tr');
    lineNode.classList.add('abcjs-clef');
    lineNode.classList.add('abcjs-l'+this.lineNb);

    for (const [i, m] of measures.entries()) {

      if(m.getEol()){
        table.appendChild(lineNode);
        lineNode = document.createElement('tr');
        this.lineNb++;
        lineNode.classList.add('abcjs-clef');
        lineNode.classList.add('abcjs-l'+this.lineNb);
        measureNb = 0;
      }

      let measureNode = this.getMeasureNode(m,this.lineNb,measureNb);
      for(let n of measureNode){
        lineNode.appendChild(n);
        measureNb++;
      }
    }

    table.appendChild(lineNode);

    table.style.marginBottom = '20px';
    table.style.borderSpacing = '7px';
    table.style.borderCollapse = 'separate';
    table.style.marginLeft = '10px';
    table.style.fontFamily = 'sans-serif';
    this.lineNb++;

    return table;
  }


  public getMeasureNode( measure: Measure, lineNb:number, measureNb:number ):any{
    
    let out = [];
    let chord_line = measure.getChordsLine();
    let analysis_line = measure.getAnalysisLine();
    let chords = chord_line.split(' ');
    let analysis = analysis_line.split(' ');

    let measureNode = document.createElement('td');
    measureNode.style.borderLeft = '2px solid';

    // let wrapper = document.createElement('span');
    // wrapper.style.display = 'inline-flex';

    for(let c of chords){
     let chordNode = document.createElement('span');
     chordNode.innerHTML = c;
     chordNode.style.marginLeft = "10px";
     chordNode.style.marginRight = "10px";
     chordNode.classList.add('abcjs-chord');
     chordNode.classList.add('abcjs-m'+(measureNb));
     chordNode.classList.add('abcjs-l'+lineNb);
     measureNode.appendChild( chordNode );
    }
    for(let a of analysis){
     let analysisNode = document.createElement('span');
     analysisNode.innerHTML = a;
     analysisNode.style.marginLeft = "10px";
     analysisNode.style.marginRight = "10px";
     analysisNode.classList.add('abcjs-annotation');
     analysisNode.classList.add('abcjs-m'+(measureNb));
     analysisNode.classList.add('abcjs-l'+lineNb);
     measureNode.appendChild( analysisNode );
    }

    measureNode.style.fontFamily ="sans-serif";
    measureNode.style.fontSize ="1em";

    // measureNode.appendChild( chordNode );

    out.push(measureNode);
    return out;
  }


  public styliseContainer( container:any ):any{
    container.style.height = "100%";
    container.style.width = "100%";
    container.style.top = "0px";
    container.style.position = "absolute";
    container.style.overflow = "scroll";
    container.style.paddingBottom ="370px";
    container.style.paddingTop ="100px";
    return container;
  }
}
