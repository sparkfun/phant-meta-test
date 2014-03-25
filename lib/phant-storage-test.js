/**
 * phant-storage-test
 * https://github.com/sparkfun/phant-storage-test
 *
 * Copyright (c) 2014 SparkFun Electronics
 * Licensed under the GPL v3 license.
 */

'use strict';

/**** Module dependencies ****/
var _ = require('underscore'),
    events = require('events');

/**** PhantStorage prototype ****/
var app = {};

/**** Expose PhantStorage ****/
exports = module.exports = PhantStorage;

/**** Initialize a new PhantStorage ****/
function PhantStorage(config) {

  var storage = {};

  config = config || {};

  _.extend(storage, app);
  _.extend(storage, events.EventEmitter.prototype);
  _.extend(storage, config);

  return storage;

}

function randomId() {
  return Math.floor(Math.random() * 16777215).toString(16);
}

app.name = 'phant test storage';
app.streams = [
  { id: '111aaa', title: 'Test Stream 1', description: 'Test 1 description', fields: ['wind', 'temp'], tags: ['test'], date: Date.now() },
  { id: '222bbb', title: 'Test Stream 2', description: 'Test 2 description', fields: ['weight'], tags: ['test'], date: Date.now() }
];
app.data = {
  '111aaa': [{ wind: 30, temp: 98.6 }, { wind: 31, temp: 98.6 }],
  '222bbb': [{ weight: 100 }]
};

app.list = function(callback) {
  callback('', this.streams);
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

  data.id = randomId();
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

  this.streams = _.reject(this.streams, function(stream) {
    stream.id == id;
  });

  callback('', true);

};

app.validateFields = function(id, data, callback) {

  var stream = _.findWhere(this.streams, { id: id }),
      err = '';

  if(! stream) {
    callback('stream not found', false);
    return;
  }

  // make sure all keys are valid
  for(var key in data) {

    if(! data.hasOwnProperty(key)) {
      continue;
    }

    if(stream.fields.indexOf(key) === -1) {

      err = key + " is not a valid field for this stream. \n\n";
      err += 'expecting: ' + stream.fields.join(', ');

      return callback(err, false);

    }

  }

  // make sure all fields exist in data
  for(var i=0; i < stream.fields.length; i++) {

    if(! data.hasOwnProperty(stream.fields[i])) {

      err = stream.fields[i] + " missing from sent data. \n\n";
      err += 'expecting: ' + stream.fields.join(', ');

      return callback(err, false);

    }

  }

  callback('', true);

};

app.getRecords = function(id, callback) {

  if(! this.data.hasOwnProperty(id)) {
    return callback('stream not found', false);
  }

  callback('', this.data[id]);

};

app.receive = function(id, data) {

  var self = this;

  this.addRecord(id, data, function(err, success) {

    if(! success) {
      self.emit('error', err);
    }

  });

};

app.addRecord = function(id, data, callback) {

  var stream = _.findWhere(this.streams, { id: id });

  if(! stream) {
    callback('stream not found', false);
    return;
  }

  if(! this.data[id]) {
    this.data[id] = [data];
  } else {
    this.data[id].push(data);
  }

  callback('', true);

};
