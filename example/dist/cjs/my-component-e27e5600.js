'use strict';

const index = require('./index-68698cdd.js');

const myComponentCss = ":host{display:block}";

const MyComponent = class {
  constructor(hostRef) {
    index.registerInstance(this, hostRef);
  }
  render() {
    return (index.h("div", null, "Hello, World!"));
  }
};
MyComponent.style = myComponentCss;

exports.MyComponent = MyComponent;
