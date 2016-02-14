'use strict';

var shell = function shell() {
  var services = {
    fs: require('fs'),
    path: require('path'),
    process: require('process'),
    child_process: require('child_process')
  };
  return require('./core')(services);
};

module.exports = shell();