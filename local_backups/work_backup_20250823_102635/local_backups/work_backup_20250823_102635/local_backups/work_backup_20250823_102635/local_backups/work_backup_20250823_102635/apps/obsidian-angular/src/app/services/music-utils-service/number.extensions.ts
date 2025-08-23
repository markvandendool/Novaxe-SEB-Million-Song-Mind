interface Number {
  mod: (n) => string;
}
Object.defineProperty(Number.prototype, 'mod', { value: function(n) {
	return ((this%n)+n)%n;
}
});
Object.defineProperty(Array.prototype, 'contains', { value: function(x) {
	return this.indexOf(x) >-1
}
});
Object.defineProperty(Array.prototype, 'removeDoubles', { value: function() {
	return [...new Set(this)];
}
});
Object.defineProperty(Array.prototype, 'getIntervals', { value: function() {
	let root = this[0];
	let res = this.map((val,i,arr)=>{

		let dist = (val-root);
		let out = dist.mod(12) ;
		if(dist>=12)out+=12;
		return out;
	})
	return res;
}
});

Object.defineProperty(Array.prototype, 'sum', { value: function() {
	let res = this.map((val,i,arr)=>{
		let out = val;
		for(var j = 0; j<i;j++)
			out += arr[j];
		return out;
	})
	return res;
}
});

Object.defineProperty(Array.prototype, 'add', { value: function(nb) {
  let res = this.map((val,i,arr)=>{
    return val+nb;
  })
  return res;
}
});

Object.defineProperty(Array.prototype, 'rotate', { value: function(n) {
  while (this.length && n < 0) n += this.length;
  this.push.apply(this, this.splice(0, n));
  return this;
}
});


interface Array<T> {
  get_rand_in_array(this: any[]): any;
}

Object.defineProperty(Array.prototype, 'get_rand_in_array', { value: function(with_remise=true) {
  if(with_remise)
    return this[Math.floor(Math.random() * this.length)];
  else
    return this.splice(Math.floor(Math.random() * this.length), 1); 
}
});

interface Object {
  get_rand_in_obj(this: any): any;
}
Object.defineProperty(Object.prototype, 'get_rand_in_obj', { value: function() {
  let tab = [];
  for(let k of Object.keys(this))
    if( this[k] == true ) tab.push(k);

  let n = Math.floor( Math.random()*tab.length );

  return tab[n];
}
});

//returns a all true property name of obj.
interface Object {
  get_all_true_in_obj(this: any): any;
}
Object.defineProperty(Object.prototype, 'get_all_true_in_obj', { value: function() {
  let tab = [];
  for(let k of Object.keys(this))
    if( this[k] == true ) tab.push(k);

  return tab;
}
});

//Returns a copy of the object
interface Object {
  copy(this: any): any;
}
Object.defineProperty(Object.prototype, 'copy', { value: function() {
  return JSON.parse(JSON.stringify(this));
}
});

