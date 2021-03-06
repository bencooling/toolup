const shell = () => {
  const services = {
    fs: require('fs'),
    path: require('path'),
    process: require('process'),
    child_process: require('child_process'),
  };
  return require('./core')(services);
};

module.exports = shell();
