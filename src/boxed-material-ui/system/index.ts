import { BackgroundProps } from 'boxed-material-ui/system/background';
import { BorderProps } from 'boxed-material-ui/system/border';
import { ColorProps } from 'boxed-material-ui/system/color';
import { FlexProps } from 'boxed-material-ui/system/flex';
import { GridProps } from 'boxed-material-ui/system/grid';
import { LayoutProps } from 'boxed-material-ui/system/layout';
import { MarginProps } from 'boxed-material-ui/system/margin';
import { PaddingProps } from 'boxed-material-ui/system/padding';
import { PositionProps } from 'boxed-material-ui/system/position';
import { ShadowProps } from 'boxed-material-ui/system/shadow';
import { TypographyProps } from 'boxed-material-ui/system/typography';
import { Pseudos } from 'csstype';

export * from 'boxed-material-ui/system/background';
export * from 'boxed-material-ui/system/border';
export * from 'boxed-material-ui/system/color';
export * from 'boxed-material-ui/system/flex';
export * from 'boxed-material-ui/system/grid';
export * from 'boxed-material-ui/system/layout';
export * from 'boxed-material-ui/system/margin';
export * from 'boxed-material-ui/system/padding';
export * from 'boxed-material-ui/system/position';
export * from 'boxed-material-ui/system/shadow';
export * from 'boxed-material-ui/system/typography';

export interface CssProperties<TLength = string | number>
    extends BackgroundProps<TLength>,
        BorderProps<TLength>,
        ColorProps,
        FlexProps,
        GridProps<TLength>,
        LayoutProps<TLength>,
        MarginProps<TLength>,
        PaddingProps<TLength>,
        PositionProps,
        ShadowProps,
        TypographyProps {}

export type PseudoProps = {
    [Pseudo in Pseudos]?: CssProperties;
};
