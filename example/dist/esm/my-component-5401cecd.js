import { r as registerInstance, h } from './index-0ec90d92.js';

const myComponentCss = ":host{display:block}";

const MyComponent = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (h("div", null, "Hello, World!"));
  }
};
MyComponent.style = myComponentCss;

export { MyComponent as M };
