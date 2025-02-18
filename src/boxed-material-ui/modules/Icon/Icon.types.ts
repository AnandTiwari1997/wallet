import { ComponentPropsWithRef, PropsWithChildren } from 'react';

export type IconDetails = {
    path: string | string[];
    width: number;
    height: number;
};

export type IconProps = {
    icon: IconDetails;
} & PropsWithChildren &
    ComponentPropsWithRef<'svg'>;
