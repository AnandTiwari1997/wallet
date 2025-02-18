import React, { ReactElement } from 'react';
import { IComponentStyle } from '../_Styled/_Styled';

export function componentStyleImplementation(tag: string, staticStyles: any = {}, dynamicStyles: any = {}) {
    return React.createElement(tag);
}

export function filter(styles: TemplateStringsArray | { [key: string]: any }) {}

export function componentStyle(tag: keyof JSX.IntrinsicElements): IComponentStyle {
    const componentStyle = (templateLiterals: TemplateStringsArray, ...interpolations: any[]): ReactElement => {
        // filter out static and dynamic styles from string template
        return componentStyleImplementation(tag, {}, {});
    };
    componentStyle.styles = (styles: { [key: string]: any }) => {
        // filter out static and dynamic styles from styles object
        return componentStyleImplementation(tag, {}, {});
    };
    return componentStyle;
}
