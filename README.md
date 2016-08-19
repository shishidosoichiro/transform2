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


