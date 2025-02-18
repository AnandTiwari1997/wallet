// import lodash from 'lodash/merge';

export function isPseudoProperty(propName: string): boolean {
    return propName.startsWith(':');
}

//
// function filterNonCSSProps(props: { [key: string]: any }) {
//     const styles: { [key: string]: any } = {};
//     Object.keys(props).forEach((prop) => {
//         if (isPseudoProperty(prop)) {
//             styles[prop] = extendCSS(props[prop]);
//         } else {
//             if (CSS.supports(lodash.kebabCase(prop), props[prop])) {
//                 styles[prop] = props[prop];
//             }
//         }
//     });
//     return styles;
// }
//
// export function extendCSS(props: { [key: string]: any }) {
//     const { css, ...others } = props;
//     const mergedProps = lodash.merge(others, css);
//     return filterNonCSSProps(mergedProps);
// }
