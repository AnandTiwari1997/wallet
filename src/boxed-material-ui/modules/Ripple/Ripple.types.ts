import { ComponentPropsWithRef, PropsWithChildren } from 'react';

export type RippleProps = PropsWithChildren & ComponentPropsWithRef<'div'>;

export type WaveProps = {
    duration: number;
    type: 'wave' | 'pulse';
} & ComponentPropsWithRef<'span'>;
