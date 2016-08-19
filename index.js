'use strict';

const stream = require('stream');
const Transform = stream.Transform;
const util = require('util');

const promisify = require('lib/promisify');

/**

Transform2
==========

Usage
-----

```js
const fs = require('fs');
const t = require('transform2');
const YAML = require('yamljs');
const stringify = YAML.stringify.bind(YAML);

fs.readFile('/path/to/file')

// normal functions are available as transform.
.pipe(t(String))
.pipe(t(YAML.parse))

.pipe(t(function(data){
	// If some problem occurs, throw error.
	throw new TypeError('type error.');

	// or return rejected Promise.
	return Promise.reject(new TypeError('type error.'));

	// or execute 'throw' with it.
	this.throw(new TypeError('type error.'));


	// return transformed data.
	return transformed;

	// or return resolved Promise.
	return Promise.resolve(transformed);

	// or push it.
	this.push(transformed);


	// If return undefined, not push data.
	return;
}))

// transform function shorthand.
.pipe(stringify)
.pipe(Buffer)

// If some error occurs in a Transform2's transform function,
//
//
// ex) If TypeError, log errors and continue.
.catch(TypeError, function(e){
	log(e)
})
// ex) if other errors, send mail to 'shishidosoichiro@gmail.com'.
.catch(mailTo('shishidosoichiro@gmail.com'))

// Node.js Stream is available.
.pipe(fs.writeFile.bind(fs, '/other/path/to/file'))

```

Constructor
-----------

```js
new Transform(Object options | Function transform);
Transform(Object options | Function transform);
```

* Object options
	* thunk: If true, `options.transform` is a thunkified function. default is `false`.

* Function transform
	transform function.
	* return value: transformed value.


Methods
-------

### `transform.throw(Error|String)`

### `transform.catch(Function(Error|String))`


*/
module.exports = Transform2;

const defaults = {
	objectMode: true,
	thunk: false
};

function Transform2(){
	if (!(this instanceof Transform2)) return new Transform2(options);

	Object.assign(options, defaults);
	Transform.call(this, options);

	if (typeof options === 'function') options = {transform: options};
	if (options.thunk) options.transform = promisify(options.transform);
	this.options = options;
}
util.inherits(Transform2, Transform);


Transform2.prototype._transform = function(chunk, encoding, done){
	const transform = this.options.transform;

	var res;
	try {
		res = transform.call(this, chunk);
	}
	catch(e) {
		this.throw(e);
		return done();
	}

	if (res === undefined) return done();
	else if (res instanceof Promise){
		const push = this.push.bind(this);
		const raise = this.throw.bind(this);
		return res
		.then(push)
		.catch(raise)
		.then(done);
	}

	this.push(res);
	done();
};
Transform2.prototype.throw = function(thrown){
	this.switchThrown(thrown);
	return this;
};
Transform2.prototype.catch = function(catcher){
	this.catcher = catcher;
	return this;
};
Transform2.prototype.switchThrown = function(thrown){
	if (!this.catcher) return this.emit('throw', thrown);

	try {
		const res = this.catcher(thrown);
		if (res instanceof Promise)
			res
			.then(this.push.bind(this))
			.catch(this.emit.bind(this, 'throw'));
	}
	catch (e) {
		this.emit('throw', thrown);
	}
};

const pipe = Transform.prototype.pipe;
Transform2.prototype.pipe = function(stream){
	if (typeof stream !== 'function') throw new TypeError('1st argument should be a function.');

	// If not Transform2 and Transform, wrap a function with Transform2.
	if (!(stream instanceof Transform2) && !(stream instanceof Transform)) stream = new Transform2(stream);

	pipe.call(this, stream);
	stream.on('throw', this.switchThrown.bind(this));
	}
};
