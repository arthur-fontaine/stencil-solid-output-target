var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import h from 'solid-js/h';
// https://harin76.medium.com/generating-solid-js-components-from-json-7cc5ef37c7f4
const createComponent = (_h, tagName, props) => {
    const _a = props !== null && props !== void 0 ? props : {}, { children: cChildren } = _a, cProps = __rest(_a, ["children"]);
    let children = [];
    if (cChildren) {
        if (Array.isArray(cChildren)) {
            children = cChildren.map((child) => {
                if (typeof child === 'string') {
                    return child;
                }
                else if (typeof child === 'function') {
                    return child();
                }
                else {
                    return createComponent(_h, child.tagName, child.props);
                }
            });
        }
        else if (typeof cChildren === 'string') {
            children = [cChildren];
        }
        else if (typeof cChildren === 'function') {
            children = [cChildren()];
        }
        else if (typeof cChildren === 'object') {
            children = [createComponent(_h, tagName, cChildren)];
        }
    }
    return _h(tagName, cProps, children);
};
export const createSolidComponent = (tagName, manipulatePropsFunction, defineCustomElement) => {
    if (defineCustomElement !== undefined) {
        defineCustomElement();
    }
    // const displayName = dashToPascalCase(tagName);
    function SolidComponentWrapper(_a) {
        var { children } = _a, propsToPass = __rest(_a, ["children"]);
        return createComponent(h, tagName, Object.assign({ children }, (manipulatePropsFunction ? manipulatePropsFunction(propsToPass) : propsToPass)));
    }
    return SolidComponentWrapper;
};
