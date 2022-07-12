import { JSX, Component } from 'solid-js';
export interface HTMLStencilElement extends HTMLElement {
    componentOnReady(): Promise<this>;
}
interface StencilSolidInternalProps<ElementType> extends JSX.DOMAttributes<ElementType> {
}
export declare const createSolidComponent: <PropType, ElementType extends HTMLStencilElement, ExpandedPropsTypes = {}>(tagName: string, manipulatePropsFunction?: (originalProps: StencilSolidInternalProps<ElementType>) => ExpandedPropsTypes, defineCustomElement?: () => void) => Component<PropType & JSX.DOMAttributes<ElementType>>;
export {};
