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

function reverseSort(field) {

  return function(a, b) {

    if(a[field] === b[field]) {
      return 0;
    }

    if(! a[field]) {
      return -1;
    }

    if(! b[field]) {
      return 1;
    }

    return b[field] - a[field];

  };

}

app.name = 'Metadata Test';
app.streams = [
  {
    id: '111aaa',
    title: 'Test Weather',
    description: 'Test 1 description',
    fields: ['wind', 'temp'],
    tags: ['weather', 'test'],
    date: Date.now(),
    last_push: Date.now() - 200000,
    hidden: false,
    flagged: false
  },
  {
    id: '222bbb',
    title: 'Test Weight',
    description: 'Test 2 description',
    fields: ['lbs'],
    tags: ['weight', 'test'],
    date: Date.now() - 200000,
    last_push: Date.now(),
    hidden: false,
    flagged: false
  }
];

app.list = function(callback, offset, limit) {

  limit = limit || 20;
  offset = offset || 0;

  var result = _.filter(this.streams, function(stream) {

    return !stream.hidden && !stream.flagged;

  }).sort(reverseSort('date'));

  callback('', result.slice(offset, limit + offset));

};

app.listByTag = function(tag, callback, offset, limit) {

  limit = limit || 20;
  offset = offset || 0;

  var result = _.filter(this.streams, function(stream) {

    return !stream.hidden && !stream.flagged && _.contains(stream.tags, tag);

  }).sort(reverseSort('date'));

  callback('', result.slice(offset, limit + offset));

};

app.listByActivity = function(callback, offset, limit) {

  limit = limit || 20;
  offset = offset || 0;

  var result = _.filter(this.streams, function(stream) {

    return !stream.hidden && !stream.flagged;

  }).sort(reverseSort('last_push'));

  callback('', result.slice(offset, limit + offset));

};

app.get = function(id, callback) {

  var stream = _.find(this.streams, { id: id });

  if(! stream) {
    callback('stream not found', false);
    return;
  }

  callback('', stream);

};

app.create = function(data, callback) {

  var diff = _.difference(_.keys(data), ['title', 'description', 'fields', 'tags', 'hidden']);

  if(diff.length !== 0) {
    callback('saving stream failed', false);
    return;
  }

  data.id = newId();
  data.date = Date.now();
  data.last_push = 0;
  data.flagged = false;

  this.streams.push(data);

  callback('', data);

  return;

};

app.touch = function(id, callback) {

  var stream = _.find(this.streams, { id: id });

  if(! stream) {
    callback('stream not found', false);
    return;
  }

  stream.last_push = Date.now();

  callback('', true);

};

app.flag = function(id, callback) {

  var stream = _.find(this.streams, { id: id });

  if(! stream) {
    callback('stream not found', false);
    return;
  }

  stream.flagged = true;

  callback('', true);

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
