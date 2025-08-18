export class Node  {
	public p:any;
	public level:any;
	public value:any;
	public leaf:any;
	public width:any;
	public offset:any;
	public child_width:any;
	public subscript:any;
	public children:any;

 constructor(public p, level: any) {
    this.p = p;
    this.level = level;
    this.value = '';
    this.leaf = true;
    this.width = 0;
    this.offset = 0;
    this.child_width = 0;
    this.subscript = '';
    this.children = [];
  }
}
