import { CardBodyProps } from 'boxed-material-ui/modules/Card/Card.types';
import { Styled } from 'boxed-material-ui/styles';
import useGenerateClassNames from 'boxed-material-ui/styles/useGenerateClassNames/useGenerateClassNames';
import { clsx } from 'clsx';
import { FC, forwardRef } from 'react';

const ROOT = Styled<CardBodyProps>('div')({
    padding: `16px`
});

const CardBody: FC<CardBodyProps> = forwardRef(function CardBody(inProps, ref) {
    const { children, className, ...bodyProps } = inProps;
    const rootClassNames = useGenerateClassNames('card', ['bosy-root']);
    return (
        <ROOT className={clsx(rootClassNames, className)} {...bodyProps}>
            {children}
        </ROOT>
    );
});
export default CardBody;
