'use strict';

const Stream = require('stream');
const Transform = Stream.Transform;
const util = require('util');

const promisify = require('es6-promisify');

/**

Transform2
==========

*/
module.exports = Transform2;

const defaults = {
	objectMode: true,
	thunk: false
};

function Transform2(options){
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
	if (typeof stream !== 'function' && !(stream instanceof Stream)) throw new TypeError('1st argument should be a function or Stream.');

	// If not Transform2 and Transform, wrap a function with Transform2.
	if (!(stream instanceof Transform2) && !(stream instanceof Transform)) stream = new Transform2(stream);

	pipe.call(this, stream);
	stream.on('throw', this.switchThrown.bind(this));
};
