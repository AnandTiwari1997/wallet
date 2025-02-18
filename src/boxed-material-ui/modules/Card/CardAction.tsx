import { CardActionProps } from 'boxed-material-ui/modules/Card/Card.types';
import { Styled } from 'boxed-material-ui/styles';
import useGenerateClassNames from 'boxed-material-ui/styles/useGenerateClassNames/useGenerateClassNames';
import { clsx } from 'clsx';
import { FC, forwardRef } from 'react';

const ROOT = Styled<CardActionProps>('div')({
    display: `flex`,
    alignItems: `center`,
    padding: `8px`
});

const CardAction: FC<CardActionProps> = forwardRef(function CardAction(inProps, ref) {
    const { children, className, ...actionProps } = inProps;
    const rootClasNames = useGenerateClassNames('card', ['action-root']);
    return (
        <ROOT className={clsx(rootClasNames, className)} {...actionProps}>
            {children}
        </ROOT>
    );
});
export default CardAction;
