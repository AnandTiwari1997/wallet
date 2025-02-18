import { CardProps } from 'boxed-material-ui/modules/Card/Card.types';
import { Styled } from 'boxed-material-ui/styles';
import useGenerateClassNames from 'boxed-material-ui/styles/useGenerateClassNames/useGenerateClassNames';
import { clsx } from 'clsx';
import { FC, forwardRef } from 'react';

const ROOT = Styled<CardProps>('div')(({ theme }) => {
    return {
        backgroundColor: theme!.colors!.mainText,
        borderRadius: `4px`,
        boxShadow: `0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)`,
        color: theme!.colors!.main,
        overflow: `hidden`,
        maxWidth: `345px`,
        transition: `box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms`
    };
});

const Card: FC<CardProps> = forwardRef(function Card(inProps, ref) {
    const { children, className, ...rootProps } = inProps;
    const classNames = useGenerateClassNames('card', ['root']);
    return (
        <ROOT className={clsx(classNames, className)} {...rootProps}>
            {children}
        </ROOT>
    );
});
export default Card;
