import { wallet } from 'icons/icons';
import { Icon } from 'modules';
import * as React from 'react';
import { ComponentPropsWithoutRef } from 'react';

const WalletLogo = (props: ComponentPropsWithoutRef<'svg'>) => {
    return <Icon icon={wallet} svgProps={props} />;
};

export default WalletLogo;
