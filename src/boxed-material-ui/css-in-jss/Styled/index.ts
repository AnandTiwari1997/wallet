import { ThemeProps } from 'boxed-material-ui/theming';
import React, { CSSProperties } from 'react';

export { default as Styled } from 'boxed-material-ui/css-in-jss/Styled/Styled';

export type CSS = (CSSProperties & { conditionals?: CSS[]; pseudos?: CSS[] }) | {};
export type StyleParams<T> = {
    theme?: ThemeProps;
    as?: React.ElementType;
} & T;
