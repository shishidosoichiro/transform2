'use strict';

const slice = require('./slice');

/**

promisify
=========


*/
module.exports = promisify;

function promisify(f){
	return function(){
		const args = slice(arguments);
		return new Promise(function(resolve, reject){
			const callback = function(err){
				if (err) return reject(err);
				resolve.apply(this, slice(arguments, 1));
			}.bind(this);

			f.apply(this, args.concat(callback));
		}.bind(this));
	};
}
