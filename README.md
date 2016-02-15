# toolup 🛠

[![Build Status](https://travis-ci.org/bencooling/toolup.svg?branch=master)](https://travis-ci.org/bencooling/toolup)
[![Code Climate](https://codeclimate.com/github/bencooling/toolup/badges/gpa.svg)](https://codeclimate.com/github/bencooling/toolup)

> Rapidly setup an es6, es7 or react dev environment

```
$ toolup

? Babel Presets? (Press <space> to select)
❯◯ es2015
 ◯ react
 ◯ stage-0
 ◯ stage-1
 ◯ stage-2
 ◯ stage-3

 ? Webpack? (Use arrow keys)
 ❯ Yes with webpack-dev-server
   Yes
   No

$ npm run start
```

## Installation  
**Install globally**  
`npm i -g toolup`


## What exactly does toolup do?
Kinda like `npm init` or `eslint --init`, toolup:    
1. Installs dependencies (babel presets, loaders, libraries)
2. Creates config files (.babelrc, webpack.config.js)
3. Adds a npm run script


## What should I do next?

You may also want to `eslint --init`!  
