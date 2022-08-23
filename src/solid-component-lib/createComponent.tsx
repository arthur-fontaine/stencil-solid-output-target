import {JSX, Component} from 'solid-js';
import h from 'solid-js/h';
import {camelToDashCase} from "./utils";

export interface HTMLStencilElement extends HTMLElement {
  componentOnReady(): Promise<this>;
}

interface StencilSolidInternalProps<ElementType> extends JSX.DOMAttributes<ElementType> {
}

// https://harin76.medium.com/generating-solid-js-components-from-json-7cc5ef37c7f4
const createComponent = <ElementType extends HTMLStencilElement>(
  _h: typeof h,
  tagName: string,
  props: StencilSolidInternalProps<ElementType>,
): JSX.Element => {
  let children: JSX.Element[] = [];

  if (props.children) {
    if (Array.isArray(props.children)) {
      children = props.children.map((child: any) => {
        if (typeof child === 'string') {
          return child;
        } else if (typeof child === 'function') {
          return child();
        } else {
          return createComponent(_h, child.tagName, child.props);
        }
      });
    } else if (typeof props.children === 'string') {
      children = [props.children];
    } else if (typeof props.children === 'function') {
      children = [props.children()];
    } else if (typeof props.children === 'object') {
      children = [createComponent(_h, tagName, props.children)];
    }
  }

  return _h(tagName, props, children);
};

export const createSolidComponent = <PropType, ElementType extends HTMLStencilElement, ExpandedPropsTypes = {}>(
  tagName: string,
  manipulatePropsFunction?: (
    originalProps: StencilSolidInternalProps<ElementType>,
  ) => ExpandedPropsTypes,
  defineCustomElement?: () => void,
): Component<PropType & JSX.DOMAttributes<ElementType>> => {
  if (defineCustomElement !== undefined) {
    defineCustomElement();
  }

  function SolidComponentWrapper(props: { children: JSX.Element } & any) {
    Object.entries(Object.getOwnPropertyDescriptors(props)).forEach(([key, descriptor]) => {
      Object.defineProperty(props, camelToDashCase(key), descriptor);
    })

    return createComponent(h, tagName, props);
  }

  return SolidComponentWrapper;
};
