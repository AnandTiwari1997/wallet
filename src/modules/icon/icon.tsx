import './icon.css';
import { ComponentPropsWithoutRef, PropsWithChildren, useEffect } from 'react';

import { IconDetails } from '../../icons';

type IconProps = {
    icon: IconDetails;
    className?: string;
    svgProps?: ComponentPropsWithoutRef<'svg'>;
} & PropsWithChildren &
    ComponentPropsWithoutRef<'i'>;

const Icon = (props: IconProps) => {
    const { icon, className, children, svgProps, ...others } = props;
    useEffect(() => {
        if (icon) {
            return;
        }
    }, []);
    return (
        <i aria-hidden="true" className={['icon', className].join(' ')} {...others}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${icon.width} ${icon.height}`}
                fill={`currentColor`}
                {...svgProps}
            >
                {Array.isArray(icon.path) ? (
                    icon.path.map((path) => {
                        return <path d={path} />;
                    })
                ) : (
                    <path d={icon.path} />
                )}
            </svg>
        </i>
    );
};

export default Icon;
