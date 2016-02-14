#!/usr/bin/env node

require('babel-register');

const inquirer = require('inquirer');
const shell = require('./shell');

// Assumes npm project, check for ./package.json
if (!shell.checkProjectJson()) {
  process.stderr.write('no package.json file found, run npm init. \n');
  process.exit(1);
}

inquirer.prompt([{
  type: 'checkbox',
  name: 'presets',
  message: 'Babel Presets?',
  choices: ['es2015', 'react', 'stage-0', 'stage-1', 'stage-2', 'stage-3'],
}, {
  type: 'list',
  name: 'bundler',
  message: 'Module bundler?',
  choices: ['webpack', 'webpack + webpack-dev-server', 'no'],
}], answers => {
  const setup = shell.createSetup(answers);
  setup.writeBabelrc();
  process.stdout.write('installing dependencies, please wait. \n');
  setup.installDependencies()
    .on('close', () => process.stdout.write('dependencies installed. \n'));
  setup.writeConfigFiles();
  setup.writeNpmRunScripts();
});
