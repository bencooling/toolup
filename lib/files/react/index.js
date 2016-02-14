var React = require('react');
var ReactDOM = require('react-dom');

var App = function(){
  return <h1>It works with React!</h1>;
};

var root = document.getElementById('root');
ReactDOM.render(<App />, root);
