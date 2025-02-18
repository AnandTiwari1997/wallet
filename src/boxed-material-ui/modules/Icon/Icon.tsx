import { forwardRef, useEffect } from 'react';
import { IconProps } from './Icon.types';
import { Styled } from '../../css-in-jss/Styled';
import useGenerateClassNames from '../../styles/useGenerateClassNames/useGenerateClassNames';
import { clsx } from 'clsx';

const ROOT = Styled.svg<IconProps>({
    display: `inline-flex`,
    alignItems: `center`,
    opacity: 1,
    width: `inherit`,
    height: `inherit`,
    fontStyle: `normal`,
    fontWeight: `400`,
    textDecoration: `inherit`,
    textAlign: `center`,
    backfaceVisibility: `hidden`
});

const Icon = forwardRef<SVGElement, IconProps>(function Icon(inProps, ref) {
    const { icon, className, children, ...others } = inProps;
    useEffect(() => {
        if (icon) {
            return;
        }
    }, []);

    const classNames = useGenerateClassNames('icon', ['root']);

    return (
        <ROOT
            icon={icon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${icon.width} ${icon.height}`}
            fill={`currentColor`}
            className={clsx(classNames, className)}
            {...others}
        >
            {Array.isArray(icon.path) ? (
                icon.path.map((path) => {
                    return <path d={path} />;
                })
            ) : (
                <path d={icon.path} />
            )}
        </ROOT>
    );
});

export default Icon;
