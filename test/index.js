'use strict';

const chai = require('chai');
const expect = chai.expect;
const should = chai.should();

const array = require('array-stream');

const t = require('../');

describe('Transform2', function(){
	describe('#constructor', function(){
		it('should allow a normal function as a argument and have a function of transform.', function(done){
			var i = 1;
			var j = 1;
			array(['a', 'b', 'c', 'd'])
			.pipe(t(function(string){
				return string + i++;
			}))
			.pipe(t(function(string){
				if (j === 1) string.should.equal('a1');
				else if (j === 2) string.should.equal('b2');
				else if (j === 3) string.should.equal('c3');
				else if (j === 4) string.should.equal('d4');

				if (j === 4) done();
				j++;
			}))
		})
	})
	describe('#pipe', function(){
		it('should allow a normal function as a argument.', function(done){
			var i = 1;
			var j = 1;
			array(['a', 'b', 'c', 'd'])
			.pipe(t(function(string){
				return string + i++;
			}))
			.pipe(function(string){
				if (j === 1) string.should.equal('a1');
				else if (j === 2) string.should.equal('b2');
				else if (j === 3) string.should.equal('c3');
				else if (j === 4) string.should.equal('d4');

				if (j === 4) done();
				j++;
			})
		})
	})
})