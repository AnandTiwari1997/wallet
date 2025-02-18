import './icon-button.css';
import { IconProps } from '@mui/material';
import React, { ComponentPropsWithoutRef } from 'react';

import { IconDetails } from '../../icons';
import { Icon } from '../icon';

type IconButtonProps = {
    id?: string;
    icon: IconDetails;
    iconProps?: IconProps;
    svgProps?: ComponentPropsWithoutRef<'svg'>;
} & React.ComponentPropsWithoutRef<'button'>;

const IconButton = (props: IconButtonProps) => {
    const { id, icon, className, onClick, iconProps, svgProps, ...others } = props;
    return (
        <button id={id} className={'icon-button'} onClick={onClick} {...others}>
            <Icon icon={icon} className={className} svgProps={svgProps} {...iconProps} />
        </button>
    );
};

export default IconButton;
