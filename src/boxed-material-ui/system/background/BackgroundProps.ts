import { Property } from 'csstype';

interface BackgroundProps<TLength = string | number> {
    background?: Property.Background<TLength>;
    backgroundImage?: Property.BackgroundImage;
    backgroundSize?: Property.BackgroundSize<TLength>;
    backgroundPosition?: Property.BackgroundPosition<TLength>;
    backgroundRepeat?: Property.BackgroundRepeat;
}

export default BackgroundProps;
