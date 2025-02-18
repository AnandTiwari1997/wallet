import { CardHeaderProps } from 'boxed-material-ui/modules/Card/Card.types';
import { Styled, useGenerateClassNames } from 'boxed-material-ui/styles';
import { clsx } from 'clsx';
import React, { FC, forwardRef } from 'react';
import { useSanitizeProp } from 'boxed-material-ui/utils';

const ROOT = Styled<CardHeaderProps>('div')({
    display: `flex`,
    alignItems: `center`,
    padding: `16px`
});

const CONTAINER = Styled<CardHeaderProps>('div')({
    display: `flex`,
    flexDirection: `row`,
    width: `100%`,
    justifyContent: `space-between`,
    alignItems: `center`
});

const TITLE = Styled<CardHeaderProps>('div')({
    display: `flex`,
    flexDirection: `row`,
    justifyContent: `flex-start`
});

const ACTION = Styled<CardHeaderProps>('div')({
    display: `flex`,
    flexDirection: `row`,
    justifyContent: `flex-start`
});

const CardHeader: FC<CardHeaderProps> = forwardRef(function CardHeader(inProps, ref) {
    const { children, childProps, childClasses, className, components, ...headerProps } = inProps;
    const {
        container: containerProps,
        title: titleProps,
        action: actionProps
    } = useSanitizeProp(childProps, { container: {}, title: {}, action: {} });
    const {
        container: containerClassName,
        title: titleClassName,
        action: actionClassName
    } = useSanitizeProp(childClasses, { container: '', title: '', action: '' });

    const rootClassNames = useGenerateClassNames('card', ['header-root']);
    const containerClassNames = useGenerateClassNames('card', ['header-container']);
    const titleClassNames = useGenerateClassNames('card', ['header-title']);
    const actionClassNames = useGenerateClassNames('card', ['header-action']);
    return (
        <ROOT className={clsx(rootClassNames, className)} {...headerProps}>
            {children ? (
                children
            ) : (
                <CONTAINER className={clsx(containerClassNames, containerClassName)} {...containerProps}>
                    <TITLE className={clsx(titleClassNames, titleClassName)} {...titleProps}>
                        {components!.heading}
                    </TITLE>
                    {components!.action && (
                        <ACTION className={clsx(actionClassNames, actionClassName)} {...actionProps}>
                            {components!.action}
                        </ACTION>
                    )}
                </CONTAINER>
            )}
        </ROOT>
    );
});

export default CardHeader;
