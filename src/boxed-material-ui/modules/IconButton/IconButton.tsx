import React, { forwardRef, useRef } from 'react';
import { IconButtonProps } from './IconButton.types';
import useGenerateClassNames from '../../styles/useGenerateClassNames/useGenerateClassNames';
import { Styled } from '../../css-in-jss/Styled';
import { clsx } from 'clsx';
import { Icon } from '../Icon';
import { useFocus, useHover, useMergeRefs } from '../../utils';
import { RippleRef } from '../Ripple/Ripple';
import { Ripple } from '../Ripple';
import { conditionalStyle, pseudo } from '../../css-in-jss/Styled/Styled';

const ROOT = Styled.button<IconButtonProps>(({ size, color, disabled }) => {
    return {
        '--button-width-xs': `16px`,
        '--button-width-sm': `24px`,
        '--button-width-md': `32px`,
        '--button-width-lg': `40px`,
        '--button-width-xl': `48px`,
        '--button-height-xs': `16px`,
        '--button-height-sm': `24px`,
        '--button-height-md': `32px`,
        '--button-height-lg': `40px`,
        '--button-height-xl': `48px`,
        '--background-default': `var(--background-inverted)`,
        '--background-default-hover': `var(--background-inverted-hover)`,
        '--background-default-active': `var(--background-inverted-active)`,
        '--background-default-soft': `var(--background-soft)`,
        '--background-default-soft-hover': `var(--background-soft-hover)`,
        '--background-default-soft-active': `var(--background-soft-active)`,
        '--background-default-disabled': `var(--background-disabled)`,
        '--button-padding-xs': `2px`,
        '--button-padding-sm': `4px`,
        '--button-padding-md': `8px`,
        '--button-padding-lg': `16px`,
        '--button-padding-xl': `24px`,
        display: `flex`,
        justifyContent: `center`,
        alignItems: `center`,
        margin: `0`,
        background: `none`,
        outline: `none`,
        borderRadius: `50%`,
        border: `none`,
        cursor: `pointer`,
        height: `var(--button-height-${size})`,
        width: `var(--button-width-${size})`,
        padding: `var(--button-padding-${size})`,
        position: `relative`,
        conditionals: [
            conditionalStyle('appearance', 'filled', {
                color: `var(--content-white)`,
                backgroundColor: `var(--background-${color})`,
                boxShadow: `var(--elevation-border)`
            }),
            conditionalStyle('appearance', 'ghost', {
                color: `var(--content-${color}-strong)`,
                backgroundColor: `var(--background-${color}-soft)`
            }),
            conditionalStyle('disabled', true, {
                cursor: 'unset',
                color: `var(--neutral-45)`,
                backgroundColor: `var(--background-${color}-disabled)`,
                boxShadow: `none`
            })
        ],
        pseudos: [
            pseudo('hover', !disabled, {
                conditionals: [
                    conditionalStyle('appearance', 'filled', {
                        backgroundColor: `var(--background-${color}-hover)`,
                        boxShadow: `var(--elevation-floating-xs)`
                    }),
                    conditionalStyle('appearance', 'ghost', {
                        backgroundColor: `var(--background-${color}-soft-hover)`
                    })
                ]
            }),
            pseudo('active', !disabled, {
                conditionals: [
                    conditionalStyle('appearance', 'filled', {
                        backgroundColor: `var(--background-${color}-active)`,
                        boxShadow: `none`
                    }),
                    conditionalStyle('appearance', 'ghost', {
                        backgroundColor: `var(--background-${color}-soft-active)`
                    })
                ]
            })
        ]
    };
});

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(props, ref) {
    const [focusedRef, isFocused] = useFocus<HTMLButtonElement>();
    const [hoveredRef, isHovered] = useHover<HTMLButtonElement>();
    const buttonRef = useMergeRefs<HTMLButtonElement>([focusedRef, hoveredRef]);

    const rippleRef = useRef<RippleRef>(null);

    const {
        appearance = 'filled',
        clickEffect = 'none',
        disabled = false,
        color = 'default',
        className,
        size = 'md',
        iconProps,
        onMouseDown,
        onKeyDown,
        ...others
    } = props;
    const { icon, className: iconClassName, ...restIconProps } = iconProps!;

    const classNames = useGenerateClassNames('icon-button', [
        'root',
        size && `size-${size}`,
        color && `color-${color}`,
        appearance && `appearance-${appearance}`,
        disabled ? `disabled` : undefined,
        isFocused && !disabled ? `focused` : undefined,
        isHovered && !disabled ? `hovered` : undefined
    ]);

    const mouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (rippleRef && rippleRef.current) {
            rippleRef.current.start();
        }
        if (onMouseDown) {
            onMouseDown(event);
        }
    };

    const keyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (rippleRef && rippleRef.current) {
            if (event && (event.code.toUpperCase() === 'SPACE' || event.code.toUpperCase() === 'ENTER')) {
                rippleRef.current.start();
            }
        }
        if (onKeyDown) {
            onKeyDown(event);
        }
    };

    return (
        <ROOT
            ref={buttonRef}
            className={clsx(classNames, className)}
            size={size}
            color={color}
            appearance={appearance}
            disabled={disabled}
            onMouseDown={mouseDown}
            onKeyDown={keyDown}
            {...others}
        >
            <Icon icon={icon} className={iconClassName} {...restIconProps} />
            {clickEffect !== 'none' && (
                <Ripple
                    ref={rippleRef}
                    duration={600}
                    type={clickEffect}
                    style={{
                        color: `var(--background-${color})`,
                        borderRadius: `50%`
                    }}
                />
            )}
        </ROOT>
    );
});

export default IconButton;
