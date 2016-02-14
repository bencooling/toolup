require('babel-register');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const sinon = require('sinon');
const test = require('tape');
const events = require('events');

const core = require('./../lib/core')({
  fs,
  child_process,
  path,
  process: require('process'),
});

const writeBabelrc = (t, setup, presets) => {
  const babelrc = sinon.stub(fs, 'writeFileSync');
  setup.writeBabelrc();
  const babelrcArgs = babelrc.args[0];
  t.same(babelrcArgs[1], JSON.stringify({ presets }, null, 2),
    'babelrc squashes duplicate stages to the latest stage & content is 2 spaced prettified');
  babelrc.restore();
};


const installDependencies = (t, setup, dependencies) => {
  const install = sinon.stub(child_process, 'spawn').returns(new events.EventEmitter());
  setup.installDependencies();
  t.same(install.args[0][1], ['i', '-D'].concat(dependencies), 'installing dependencies');
  install.restore();
};

const writeNpmRunScripts = (t, setup, script) => {
  const writeFile = sinon.stub(fs, 'writeFileSync');
  setup.writeNpmRunScripts();
  t.equal(JSON.parse(writeFile.args[0][1]).scripts[script[0]], script[1], 'write npm run scripts');
  writeFile.restore();
};

const writeConfigFiles = (t, setup, expectedFiles) => {
  const writeFile = sinon.stub(fs, 'writeFileSync');
  setup.writeConfigFiles();
  const actualFiles = writeFile.args.map(arg => arg[0].replace(`${process.cwd()}/`, ''));
  t.same(actualFiles, expectedFiles, 'write npm run scripts');
  writeFile.restore();
};

test('checking for a package.json file', t => {
  t.plan(2);
  process.chdir(__dirname);
  t.equal(core.checkProjectJson(), false,
    'when no package.json file found, return false ');
  process.chdir(path.join(__dirname, '../'));
  t.equal(core.checkProjectJson(), true,
    'when package.json file found, return true');
});

test('plain setup', t => {
  t.plan(4);
  const answers = { presets: ['es2015', 'stage-0', 'stage-1'], bundler: 'no' };
  const plain = core.createSetup(answers);
  installDependencies(t, plain, ['babel-cli', 'babel-preset-es2015', 'babel-preset-stage-0',
  'babel-register']);
  writeNpmRunScripts(t, plain, ['start', 'babel-node index.js']);
  writeConfigFiles(t, plain, ['index.js']);
  writeBabelrc(t, plain, ['es2015', 'stage-0']);
});

test('react setup', t => {
  t.plan(4);
  const answers = { presets: ['es2015', 'stage-0', 'react'], bundler: 'no' };
  const react = core.createSetup(answers);
  installDependencies(t, react, ['babel-cli', 'babel-preset-es2015', 'babel-preset-react',
    'babel-preset-stage-0', 'babel-register', 'react', 'react-dom']);
  writeNpmRunScripts(t, react, []);
  writeConfigFiles(t, react, ['index.js']);
  writeBabelrc(t, react, ['es2015', 'react', 'stage-0']);
});

test('webpack setup', t => {
  t.plan(4);
  const answers = { presets: ['es2015'], bundler: 'webpack' };
  const webpack = core.createSetup(answers);
  installDependencies(t, webpack, ['babel-cli', 'babel-loader', 'babel-preset-es2015',
  'babel-register', 'webpack']);
  writeNpmRunScripts(t, webpack, ['start', 'webpack']);
  writeConfigFiles(t, webpack, ['index.js', 'webpack.config.js']);
  writeBabelrc(t, webpack, ['es2015']);
});

test('webpack-dev-server setup', t => {
  t.plan(4);
  const answers = { presets: ['es2015', 'react'], bundler: 'webpack + webpack-dev-server' };
  const server = core.createSetup(answers);
  installDependencies(t, server, ['babel-cli', 'babel-loader', 'babel-preset-es2015',
  'babel-preset-react', 'babel-register', 'react', 'react-dom', 'webpack', 'webpack-dev-server']);
  writeNpmRunScripts(t, server, ['start', 'webpack-dev-server --port 3000 --no-info --progress']);
  writeConfigFiles(t, server, ['index.html', 'index.js', 'webpack.config.js']);
  writeBabelrc(t, server, ['es2015', 'react']);
});
