/**
 * phant-meta-test
 * https://github.com/sparkfun/phant-meta-test
 *
 * Copyright (c) 2014 SparkFun Electronics
 * Licensed under the GPL v3 license.
 */

'use strict';

/**** Module dependencies ****/
var _ = require('lodash'),
    events = require('events');

/**** PhantMeta prototype ****/
var app = {};

/**** Expose PhantMeta ****/
exports = module.exports = PhantMeta;

/**** Initialize a new PhantMeta ****/
function PhantMeta(config) {

  var storage = {};

  config = config || {};

  _.extend(storage, app);
  _.extend(storage, events.EventEmitter.prototype);
  _.extend(storage, config);

  return storage;

}

function newId() {
  return Math.floor(Math.random() * 16777215).toString(16);
}

app.name = 'phant test metadata';
app.streams = [
  { id: '111aaa', title: 'Test Stream 1', description: 'Test 1 description', fields: ['wind', 'temp'], tags: ['weather'], date: Date.now() },
  { id: '222bbb', title: 'Test Stream 2', description: 'Test 2 description', fields: ['pounds'], tags: ['weight'], date: Date.now() }
];
app.data = {
  '111aaa': [{ wind: 30, temp: 98.6 }, { wind: 31, temp: 98.6 }],
  '222bbb': [{ weight: 100 }]
};

app.list = function(callback, offset, limit) {

  limit = limit || 20;
  offset = offset || 0;

  callback('', this.streams.slice(offset, limit + offset));

};

app.listByTag = function(tag, callback, offset, limit) {

  limit = limit || 20;
  offset = offset || 0;

  var result = _.filter(this.streams, function(stream) {
    return _.contains(stream.tags, tag);
  });

  callback('', result.slice(offset, limit + offset));

};

app.get = function(id, callback) {

  var stream = _.findWhere(this.streams, { id: id });

  if(! stream) {
    callback('stream not found', false);
    return;
  }

  callback('', stream);

};

app.create = function(data, callback) {

  var diff = _.difference(_.keys(data), ['title', 'description', 'fields', 'tags']);

  if(diff.length !== 0) {
    callback('saving stream failed', false);
    return;
  }

  data.id = newId();
  this.streams.push(data);

  callback('', data);

  return;

};

app.remove = function(id, callback) {

  var record = _.findWhere(this.streams, { id: id });

  if(! record) {
    callback('stream not found', false);
    return;
  }

  this.streams = _.reject(this.streams, {id: id});

  callback('', true);

};
