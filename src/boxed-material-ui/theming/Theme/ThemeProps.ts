import { Theme } from '@emotion/react';
import { Colors, Shadows, Sizes } from 'boxed-material-ui/theming';

export interface ThemeProps extends Theme {
    colors?: typeof Colors;
    sizes?: typeof Sizes;
    shadows?: typeof Shadows;
}
