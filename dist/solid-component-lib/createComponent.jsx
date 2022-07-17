import { createSignal, onMount } from 'solid-js';
import h from 'solid-js/h';
import { camelToDashCase } from "./utils";
// https://harin76.medium.com/generating-solid-js-components-from-json-7cc5ef37c7f4
const createComponent = (_h, tagName, props) => {
    let children = [];
    if (props.children) {
        if (Array.isArray(props.children)) {
            children = props.children.map((child) => {
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
        else if (typeof props.children === 'string') {
            children = [props.children];
        }
        else if (typeof props.children === 'function') {
            children = [props.children()];
        }
        else if (typeof props.children === 'object') {
            children = [createComponent(_h, tagName, props.children)];
        }
    }
    return _h(tagName, props, children);
};
export const createSolidComponent = (tagName, manipulatePropsFunction, defineCustomElement) => {
    if (defineCustomElement !== undefined) {
        defineCustomElement();
    }
    function SolidComponentWrapper(props) {
        const [component, setComponent] = createSignal(createComponent(h, tagName, props));
        onMount(() => {
            Object.entries(Object.getOwnPropertyDescriptors(props)).forEach(([key, descriptor]) => {
                Object.defineProperty(props, camelToDashCase(key), descriptor);
            });
            setComponent(createComponent(h, tagName, props));
        });
        return component;
    }
    return SolidComponentWrapper;
};
