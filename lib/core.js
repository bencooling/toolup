const core = ({ fs, path, child_process }) => {
  // remove duplicates
  const _squashDuplicatePresets = presets => {
    const num = str => Number(str.replace('stage-', ''));
    return presets
      .filter(preset => (preset.indexOf('stage') !== -1))
      .reduce((latest, preset) =>
        (((!latest.length) || (num(latest[0]) > num(preset))) ? [preset] : latest), [])
      .concat(presets.filter(preset => (preset.indexOf('stage') === -1)))
      .sort();
  };

  // concat without duplicates, lodash equiv. _.union
  const _union = (a, b) => a.concat(b.filter(item => a.indexOf(item) < 0));

  // given all answers, return a valid type for *ByType methods to work with
  const _getType = allAnswers => {
    const subTypes = ['react', 'webpack', 'server']; // TODO: add es2015 and stage-* support
    const camelCase = arr =>
      arr.reduce((str, subType) => str + subType[0].toUpperCase() + subType.slice(1));
    const chosenSubTypes =
      allAnswers
        .reduce((acc, answer) => {
          const str = 'webpack + webpack-dev-';
          const a = (answer.indexOf(str) === -1) ? answer : [answer.replace(str, ''), 'webpack'];
          return acc.concat(a);
        }, [])
        .filter(answer => subTypes.indexOf(answer) !== -1);
    return (!chosenSubTypes.length) ? 'plain' : camelCase(chosenSubTypes.sort());
  };

  // configuration files
  const _filesByType = type => {
    const plain = { 'index.js': 'files/index.js' };
    const react = { 'index.js': 'files/react/index.js' };
    const webpack = { 'index.js': 'files/webpack/index.js',
      'webpack.config.js': 'files/webpack/webpack.config.js' };
    const reactWebpack = Object.assign({}, webpack, react);
    const serverWebpack = Object.assign({}, webpack, { 'index.html': 'files/webpack/index.html' });
    const reactServerWebpack = Object.assign({}, serverWebpack, react);
    return {
      react,
      webpack,
      reactWebpack,
      serverWebpack,
      reactServerWebpack,
    }[type] || plain;
  };

  // dependencies
  const _depsByType = (type, presets) => {
    const plain = _squashDuplicatePresets(presets)
      .map(preset => `babel-preset-${preset}`)
      .concat('babel-cli', 'babel-register');
    const react = _union(plain, ['react', 'react-dom']);
    const webpack = _union(plain, ['webpack', 'babel-loader']);
    const reactWebpack = _union(react, webpack);
    const serverWebpack = _union(webpack, ['webpack-dev-server']);
    const reactServerWebpack = _union(react, serverWebpack);
    return {
      react,
      webpack,
      reactWebpack,
      serverWebpack,
      reactServerWebpack,
    }[type] || plain;
  };

  // npm run scripts
  const _scriptsByType = type => {
    const plain = { start: 'babel-node index.js' };
    const react = {};
    const webpack = { start: 'webpack' };
    const reactWebpack = webpack;
    const serverWebpack = { start: 'webpack-dev-server --port 3000 --no-info --progress' };
    const reactServerWebpack = serverWebpack;
    return {
      react,
      webpack,
      reactWebpack,
      serverWebpack,
      reactServerWebpack,
    }[type] || plain;
  };

  const checkProjectJson = () => {
    try {
      fs.statSync(path.join(process.cwd(), 'package.json'));
      return true;
    } catch (e) {
      return false;
    }
  };

  // All side effects performed in this module
  const createSetup = answers => {
    const type = _getType(answers.presets.concat(answers.bundler));
    // write to fs .babelrc
    const writeBabelrc = () => {
      const content = { presets: _squashDuplicatePresets(answers.presets) };
      fs.writeFileSync(path.join(process.cwd(), '.babelrc'), JSON.stringify(content, null, 2));
    };
    // write to fs config files
    const writeConfigFiles = () => {
      const files = _filesByType(type);
      return Object.keys(files).sort().map(file =>
        fs.writeFileSync(path.join(process.cwd(), file),
          fs.readFileSync(path.join(__dirname, files[file]), 'utf8')));
    };
    // write scripts to package.json
    const writeNpmRunScripts = () => {
      const scripts = _scriptsByType(type);
      const filename = path.join(process.cwd(), 'package.json');
      const content = JSON.parse(fs.readFileSync(filename));
      Object.keys(scripts).map(script => {
        content.scripts[script] = scripts[script];
      });
      fs.writeFileSync(filename, JSON.stringify(content, null, 2));
    };
    // npm install
    const installDependencies = () => {
      const deps = _depsByType(type, answers.presets);
      return child_process.spawn('npm', ['i', '-D'].concat(deps.sort()));
    };
    return {
      installDependencies,
      writeNpmRunScripts,
      writeConfigFiles,
      writeBabelrc,
    };
  };

  // core public api
  return {
    createSetup,
    checkProjectJson,
  };
};

module.exports = core;
