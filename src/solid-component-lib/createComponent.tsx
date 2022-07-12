import { JSX, Component } from 'solid-js';
import h from 'solid-js/h';

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
  const { children: cChildren, ...cProps } = props ?? {};

  let children: JSX.Element[] = [];

  if (cChildren) {
    if (Array.isArray(cChildren)) {
      children = cChildren.map((child: any) => {
        if (typeof child === 'string') {
          return child;
        } else if (typeof child === 'function') {
          return child();
        } else {
          return createComponent(_h, child.tagName, child.props);
        }
      });
    } else if (typeof cChildren === 'string') {
      children = [cChildren];
    } else if (typeof cChildren === 'function') {
      children = [cChildren()];
    } else if (typeof cChildren === 'object') {
      children = [createComponent(_h, tagName, cChildren)];
    }
  }

  return _h(tagName, cProps, children);
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

  // const displayName = dashToPascalCase(tagName);

  function SolidComponentWrapper({ children, ...propsToPass }: { children: JSX.Element } & any) {
    return createComponent<ElementType>(h, tagName, { children, ...(manipulatePropsFunction ? manipulatePropsFunction(propsToPass) : propsToPass) });
  }

  return SolidComponentWrapper;
};
