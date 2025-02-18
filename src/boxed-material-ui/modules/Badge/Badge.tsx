import { BadgeLabelProps, BadgeProps } from 'boxed-material-ui/modules';
import { Styled } from 'boxed-material-ui/styles';
import useGenerateClassNames from 'boxed-material-ui/styles/useGenerateClassNames/useGenerateClassNames';
import { clsx } from 'clsx';
import React, { forwardRef } from 'react';
import { useSanitizeProp } from '../../utils';

const ROOT = Styled<any>('span')({
    position: `relative`,
    display: `inline-flex`,
    verticalAlign: `middle`,
    flexShrink: `0`,
    justifyContent: `center`,
    alignItems: `center`
});

const LABEL = Styled<BadgeLabelProps>('span')(
    ({
        anchorOrigin: anchorOrigin = {
            vertical: 'center',
            horizontal: 'center'
        },
        theme,
        ...props
    }) => {
        const verticalPos = anchorOrigin.vertical;
        const horizontalPos = anchorOrigin.horizontal;
        const translateMap = {
            left: -1,
            right: 1,
            bottom: 1,
            top: -1,
            center: 0
        };
        return {
            display: `flex`,
            flexDirection: `row`,
            flexWrap: `wrap`,
            justifyContent: `center`,
            alignContent: `center`,
            alignItems: `center`,
            boxSizing: `border-box`,
            minWidth: `20px`,
            lineHeight: `1`,
            padding: `0 6px`,
            height: `20px`,
            borderRadius: `10px`,
            zIndex: `1`,
            transition: `transform 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms`,
            backgroundColor: theme!.colors!.main,
            color: theme!.colors!.mainText,
            transformOrigin: `100% 0%`,
            position: 'absolute',
            transform: `scale(1) translate(${translateMap[verticalPos] * 50}%, ${translateMap[horizontalPos] * 50}%)`,
            ...(verticalPos === 'top' && { top: 0 }),
            ...(verticalPos === 'bottom' && { bottom: 0 }),
            ...(horizontalPos === 'left' && { left: 0 }),
            ...(horizontalPos === 'right' && { right: 0 }),
            ...(verticalPos === 'center' && { top: 0, bottom: 0 })
        };
    }
);

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(inProps, ref) {
    const {
        children,
        badgeContent,
        className,
        anchorOrigin = {
            vertical: 'center',
            horizontal: 'center'
        },
        childProps,
        childClasses,
        ...others
    } = inProps;
    const { label: labelProps } = useSanitizeProp(childProps, { label: {} });
    const { label: labelClassName } = useSanitizeProp(childClasses, { label: '' });
    const classNames = useGenerateClassNames('badge', ['root']);
    const labelClassNames = useGenerateClassNames('badge', [
        'label',
        anchorOrigin && `position-${anchorOrigin.vertical}-${anchorOrigin.horizontal}`
    ]);

    return (
        <ROOT className={clsx(classNames, className)} {...others}>
            {children}
            <LABEL className={clsx(labelClassNames, labelClassName)} anchorOrigin={anchorOrigin} {...labelProps}>
                {badgeContent}
            </LABEL>
        </ROOT>
    );
});

export default Badge;
