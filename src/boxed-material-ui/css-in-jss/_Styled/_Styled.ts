import { ReactElement } from 'react';
import domElements from '../Utils/domElements';
import { componentStyle } from '../core/componentStyle';

export interface IComponentStyle {
    styles: (styles: { [key: string]: any }) => ReactElement;

    (templateLiterals: TemplateStringsArray, ...interpolations: any[]): ReactElement;
}

const _BaseStyled = (tag: keyof JSX.IntrinsicElements): IComponentStyle => {
    return componentStyle(tag);
};

const _Styled = _BaseStyled as typeof _BaseStyled & {
    [K in keyof JSX.IntrinsicElements]: IComponentStyle;
};

domElements.forEach((element: string) => {
    _Styled[element] = _Styled(element as keyof JSX.IntrinsicElements);
});

const s = _Styled('a');
s`color: red;`;
s.styles({});

const _s = _Styled.span;
_s``;
_s.styles({});
