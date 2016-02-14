'use strict';

var core = function core(_ref) {
  var fs = _ref.fs;
  var path = _ref.path;
  var child_process = _ref.child_process;

  // remove duplicates
  var _squashDuplicatePresets = function _squashDuplicatePresets(presets) {
    var num = function num(str) {
      return Number(str.replace('stage-', ''));
    };
    return presets.filter(function (preset) {
      return preset.indexOf('stage') !== -1;
    }).reduce(function (latest, preset) {
      return !latest.length || num(latest[0]) > num(preset) ? [preset] : latest;
    }, []).concat(presets.filter(function (preset) {
      return preset.indexOf('stage') === -1;
    })).sort();
  };

  // concat without duplicates, lodash equiv. _.union
  var _union = function _union(a, b) {
    return a.concat(b.filter(function (item) {
      return a.indexOf(item) < 0;
    }));
  };

  // given all answers, return a valid type for *ByType methods to work with
  var _getType = function _getType(allAnswers) {
    var subTypes = ['react', 'webpack', 'server']; // TODO: add es2015 and stage-* support
    var camelCase = function camelCase(arr) {
      return arr.reduce(function (str, subType) {
        return str + subType[0].toUpperCase() + subType.slice(1);
      });
    };
    var chosenSubTypes = allAnswers.reduce(function (acc, answer) {
      var str = 'webpack + webpack-dev-';
      var a = answer.indexOf(str) === -1 ? answer : [answer.replace(str, ''), 'webpack'];
      return acc.concat(a);
    }, []).filter(function (answer) {
      return subTypes.indexOf(answer) !== -1;
    });
    return !chosenSubTypes.length ? 'plain' : camelCase(chosenSubTypes.sort());
  };

  // configuration files
  var _filesByType = function _filesByType(type) {
    var plain = { 'index.js': 'files/index.js' };
    var react = { 'index.js': 'files/react/index.js' };
    var webpack = { 'index.js': 'files/webpack/index.js',
      'webpack.config.js': 'files/webpack/webpack.config.js' };
    var reactWebpack = Object.assign({}, webpack, react);
    var serverWebpack = Object.assign({}, webpack, { 'index.html': 'files/webpack/index.html' });
    var reactServerWebpack = Object.assign({}, serverWebpack, react);
    return {
      react: react,
      webpack: webpack,
      reactWebpack: reactWebpack,
      serverWebpack: serverWebpack,
      reactServerWebpack: reactServerWebpack
    }[type] || plain;
  };

  // dependencies
  var _depsByType = function _depsByType(type, presets) {
    var plain = _squashDuplicatePresets(presets).map(function (preset) {
      return 'babel-preset-' + preset;
    }).concat('babel-cli', 'babel-register');
    var react = _union(plain, ['react', 'react-dom']);
    var webpack = _union(plain, ['webpack', 'babel-loader']);
    var reactWebpack = _union(react, webpack);
    var serverWebpack = _union(webpack, ['webpack-dev-server']);
    var reactServerWebpack = _union(react, serverWebpack);
    return {
      react: react,
      webpack: webpack,
      reactWebpack: reactWebpack,
      serverWebpack: serverWebpack,
      reactServerWebpack: reactServerWebpack
    }[type] || plain;
  };

  // npm run scripts
  var _scriptsByType = function _scriptsByType(type) {
    var plain = { start: 'babel-node index.js' };
    var react = {};
    var webpack = { start: 'webpack' };
    var reactWebpack = webpack;
    var serverWebpack = { start: 'webpack-dev-server --port 3000 --no-info --progress' };
    var reactServerWebpack = serverWebpack;
    return {
      react: react,
      webpack: webpack,
      reactWebpack: reactWebpack,
      serverWebpack: serverWebpack,
      reactServerWebpack: reactServerWebpack
    }[type] || plain;
  };

  var checkProjectJson = function checkProjectJson() {
    try {
      fs.statSync(path.join(process.cwd(), 'package.json'));
      return true;
    } catch (e) {
      return false;
    }
  };

  // All side effects performed in this module
  var createSetup = function createSetup(answers) {
    var type = _getType(answers.presets.concat(answers.bundler));
    // write to fs .babelrc
    var writeBabelrc = function writeBabelrc() {
      var content = { presets: _squashDuplicatePresets(answers.presets) };
      fs.writeFileSync(path.join(process.cwd(), '.babelrc'), JSON.stringify(content, null, 2));
    };
    // write to fs config files
    var writeConfigFiles = function writeConfigFiles() {
      var files = _filesByType(type);
      return Object.keys(files).sort().map(function (file) {
        return fs.writeFileSync(path.join(process.cwd(), file), fs.readFileSync(path.join(__dirname, '../', files[file]), 'utf8'));
      });
    };
    // write scripts to package.json
    var writeNpmRunScripts = function writeNpmRunScripts() {
      var scripts = _scriptsByType(type);
      var filename = path.join(process.cwd(), 'package.json');
      var content = JSON.parse(fs.readFileSync(filename));
      Object.keys(scripts).map(function (script) {
        content.scripts[script] = scripts[script];
      });
      fs.writeFileSync(filename, JSON.stringify(content, null, 2));
    };
    // npm install
    var installDependencies = function installDependencies() {
      var deps = _depsByType(type, answers.presets);
      return child_process.spawn('npm', ['i', '-D'].concat(deps.sort()));
    };
    return {
      installDependencies: installDependencies,
      writeNpmRunScripts: writeNpmRunScripts,
      writeConfigFiles: writeConfigFiles,
      writeBabelrc: writeBabelrc
    };
  };

  // core public api
  return {
    createSetup: createSetup,
    checkProjectJson: checkProjectJson
  };
};

module.exports = core;