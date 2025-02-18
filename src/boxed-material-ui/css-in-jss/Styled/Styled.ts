import { Colors, Shadows, Sizes } from 'boxed-material-ui/theming';
import { ThemeProps } from 'boxed-material-ui/theming/Theme/ThemeProps';
import styled, { StyledComponent } from '@emotion/styled';
import domElements from './domElements';
import { CSS, StyleParams } from './index';

export function conditionalStyle<T>(key: string, value: T, style: CSS) {
    return (props: any): CSS => {
        if (props && props.hasOwnProperty(key) && props[key] === value) {
            return resolveStyle(style, props);
        }
        return {};
    };
}

export function pseudo(action: string, inject: boolean = true, style: CSS) {
    return (props: any): CSS => {
        const result = {};
        if (inject) {
            result[`&:${action}`] = resolveStyle(style, props);
        }
        return result;
    };
}

function resolveStyle(styles, props) {
    let result = {};
    const { conditionals, pseudos, ...otherStyles } = styles;

    for (const key in otherStyles) {
        if (typeof styles[key] === 'object') {
            result[key] = resolveStyle(styles[key], props);
        } else {
            result[key] = styles[key];
        }
    }

    if (conditionals && Array.isArray(conditionals)) {
        conditionals.forEach((condition: (props: any) => any) => {
            result = {
                ...result,
                ...condition(props)
            };
        });
    }
    if (pseudos && Array.isArray(pseudos)) {
        pseudos.forEach((pseudo: (props: any) => any) => {
            result = {
                ...result,
                ...pseudo(props)
            };
        });
    }
    return result;
}

function createBoxedStyled<T extends {}>(tag: keyof JSX.IntrinsicElements) {
    const styledFunction = styled(tag, {})<T>;

    function styledInner(style: CSS | ((styles: StyleParams<T> & JSX.IntrinsicElements[typeof tag]) => CSS)) {
        return styledFunction((props) => {
            if (typeof style === 'function') {
                let theme: ThemeProps = props.theme;
                if (Object.keys(theme).length === 0) {
                    theme = {
                        colors: Colors,
                        sizes: Sizes,
                        shadows: Shadows
                    };
                }
                // @ts-ignore
                const styles = style({
                    ...props,
                    ...{ theme: theme }
                });
                // @ts-ignore
                return resolveStyle(styles, props);
            } else {
                // @ts-ignore
                return resolveStyle(style, props);
            }
        });
    }

    return styledInner;
}

const baseStyled = <T extends {}>(tag: keyof JSX.IntrinsicElements) => createBoxedStyled<T>(tag);

const Styled = baseStyled as typeof baseStyled & {
    [E in keyof JSX.IntrinsicElements]: <T extends {}>(
        style: CSS | ((styles: StyleParams<T> & JSX.IntrinsicElements[E]) => CSS)
    ) => StyledComponent<T>;
};

domElements.forEach((domElement) => {
    Styled[domElement] = baseStyled<typeof domElement>(domElement as keyof JSX.IntrinsicElements);
});

export default Styled;
