
// ## Scenarios
// How to elegantly composes these without nested and distributed conditional statements?

// - webpack-dev-server (webpack.config.js, npm run serve, entry.js)
// - webpack-dev-server + react (webpack.config.js, npm run serve, entry-react.js)
// - webpack (webpack.config.js, entry.js)
// - no webpack (index.js)
// - no webpack + react (entry-react)

const core = () => {
  // remove duplicates
  const _squashDuplicatePresets = presets => {
    const num = str => Number(str.replace('stage-', ''));
    presets
      .filter(preset => (preset.indexOf('stage') !== -1))
      .reduce((latest, preset) =>
        (((!latest.length) || (num(latest[0]) > num(preset))) ? [preset] : latest), [])
      .concat(presets.filter(preset => (preset.indexOf('stage') !== -1)));
  };

  // configuration files
  const fileByType = type => {
    const plain = { 'index.js': 'index.js' };
    const react = { 'index.js': 'react/index.js' };
    const webpack = { 'index.js': 'webpack/index.js',
      'webpack.config.js': 'webpack/webpack.config.js' };
    const reactWebpack = Object.assign({}, webpack, react);
    const serverWebpack = Object.assign({}, webpack, { 'index.html': 'webpack/index.html' });
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
  const depByType = (presets, type) => {
    const plain = (p => {
      _squashDuplicatePresets(p)
        .map(preset => `babel-preset-${preset}`)
        .concat('babel-cli', 'babel-register');
    })(presets);
    const react = plain.concat(['react', 'react-dom']);
    const webpack = plain.concat(['webpack']);
    const reactServer = react.concat(webpack);
    const serverWebpack = webpack.concat(['webpack-dev-server']);
    const reactServerWebpack = react.concat(webpack);
    return {
      react,
      webpack,
      reactServer,
      serverWebpack,
      reactServerWebpack,
    }[type] || plain;
  };

  // npm run scripts
  const scriptsByType = type => {
    const plain = { start: 'webpack' };
    const serverWebpack = { serve: 'webpack-dev-server --port 3000 --no-info --progress' };
    return {
      serverWebpack,
    }[type] || plain;
  };

  return {
    scriptsByType,
    depByType,
    fileByType,
  };

  // const allAnswers = answers.presets.concat(answers.bundler);
  // const type = (allAnswers.indexOf('No') && (allAnswers.indexOf('react') === -1)) ?
  //   'plain' :
  //   allAnswers
  //     .reduce((types, choice) => {
  //       const subTypes = ['react', 'webpack', 'server'];
  //       if (subTypes.indexOf(choice) !== -1) {
  //         types.push(subTypes.replace('webpack + ', ''));
  //       }
  //       return types;
  //     }, [])
  //     .sort()
  //     .reduce((str, subType) => str + subType[0].toUpperCase() + subType.slice(1));

  // depByType(answers.presets, type);
  // fileByType(type);
  // scriptsByType(type);
};

module.exports = core;

// Reduce modules, return [webpack react server], sort alphabetically for unique key
// choices: ['es2015', 'react', 'stage-0', 'stage-1', 'stage-2', 'stage-3', 'webpack', 'webpack + webpack-dev-server' 'No']
