import { ButtonLabelProps, ButtonProps } from 'boxed-material-ui/modules';
import { Ripple } from 'boxed-material-ui/modules/Ripple';
import { Styled } from 'boxed-material-ui/styles';
import useGenerateClassNames from 'boxed-material-ui/styles/useGenerateClassNames/useGenerateClassNames';
import clsx from 'clsx';
import React, { forwardRef, useRef } from 'react';
import { useFocus, useHover, useMergeRefs, useSanitizeProp } from 'boxed-material-ui/utils';
import { conditionalStyle, pseudo } from '../../css-in-jss/Styled/Styled';
import { RippleRef } from '../Ripple/Ripple';

const ROOT = Styled.button<ButtonProps>(({ color = 'primary', size = 'sm', disabled }) => {
    return {
        '--button-width-xs': `80px`,
        '--button-width-sm': `100px`,
        '--button-width-md': `120px`,
        '--button-width-lg': `140px`,
        '--button-width-xl': `160px`,
        '--button-height-xs': `32px`,
        '--button-height-sm': `40px`,
        '--button-height-md': `48px`,
        '--button-height-lg': `56px`,
        '--button-height-xl': `64px`,
        '--button-border-radius-xs': `var(--border-radius-small)`,
        '--button-border-radius-sm': `var(--border-radius-small)`,
        '--button-border-radius-md': `var(--border-radius-medium)`,
        '--button-border-radius-lg': `var(--border-radius-large)`,
        '--button-border-radius-xl': `var(--border-radius-large)`,
        '--background-default': `var(--background-inverted)`,
        '--background-default-hover': `var(--background-inverted-hover)`,
        '--background-default-active': `var(--background-inverted-active)`,
        '--background-default-soft': `var(--background-soft)`,
        '--background-default-soft-hover': `var(--background-soft-hover)`,
        '--background-default-soft-active': `var(--background-soft-active)`,
        '--background-default-disabled': `var(--background-disabled)`,
        display: `flex`,
        alignItems: `center`,
        justifyContent: `center`,
        minHeight: `var(--button-height-${size})`,
        minWidth: `var(--button-width-${size})`,
        padding: `var(--spacing-${size})`,
        margin: `0`,
        outline: `none`,
        border: `none`,
        transition: `background-color 150ms ease-in 0ms, 
                     box-shadow 150ms ease-in 0ms, 
                     color 150ms ease-in 0ms`,
        textDecoration: `none`,
        borderRadius: `var(--button-border-radius-${size})`,
        cursor: `pointer`,
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

const ICON = Styled.span<ButtonProps>(({ size }) => {
    return {
        '--button-icon-size-xs': `10px`,
        '--button-icon-size-sm': `12px`,
        '--button-icon-size-md': `14px`,
        '--button-icon-size-lg': `16px`,
        '--button-icon-size-xl': `18px`,
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: `var(--button-icon-size-${size})`,
        width: `var(--button-icon-size-${size})`
    };
});

const LABEL = Styled.span<ButtonLabelProps>(({ size }) => {
    return {
        '--button-label-font-size-xs': `var(--font-size-4x-small)`,
        '--button-label-font-size-sm': `var(--font-size-3x-small)`,
        '--button-label-font-size-md': `var(--font-size-2x-small)`,
        '--button-label-font-size-lg': `var(--font-size-x-small)`,
        '--button-label-font-size-xl': `var(--font-size-small)`,
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: `var(--font-family-stack-san-serif)`,
        paddingLeft: `var(--spacing-${size})`,
        paddingRight: `var(--spacing-${size})`,
        fontSize: `var(--button-label-font-size-${size})`,
        fontWeight: `var(--font-weight-regular)`,
        textTransform: `capitalize`
    };
});

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(inProps, ref: React.Ref<HTMLButtonElement>) {
    const [focusedRef, isFocused] = useFocus<HTMLButtonElement>();
    const [hoveredRef, isHovered] = useHover<HTMLButtonElement>();
    const buttonRef = useMergeRefs<HTMLButtonElement>([focusedRef, hoveredRef]);

    const rippleRef = useRef<RippleRef>(null);

    const {
        children,
        className,
        color = 'primary',
        appearance = 'ghost',
        size = 'sm',
        childProps,
        childClasses,
        text,
        startIcon,
        endIcon,
        disabled = false,
        clickEffect = 'none',
        onMouseDown,
        onKeyDown,
        ...rootProps
    } = inProps;

    const { label: labelProps } = useSanitizeProp(childProps, { label: {} });
    const { label: labelClass } = useSanitizeProp(childClasses, { label: '' });

    const classNames = useGenerateClassNames('button', [
        'root',
        size && `size-${size}`,
        color && `color-${color}`,
        appearance && `appearance-${appearance}`,
        disabled ? `disabled` : undefined,
        isFocused && !disabled ? `focused` : undefined,
        isHovered && !disabled ? `hovered` : undefined
    ]);

    const startIconChild = startIcon ? <ICON size={size}>{startIcon}</ICON> : <></>;
    const endIconChild = endIcon ? <ICON size={size}>{endIcon}</ICON> : <></>;
    const labelChild = (
        <LABEL className={clsx(classNames, labelClass)} size={size} {...labelProps}>
            {children ? children : text}
        </LABEL>
    );

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
            {...rootProps}
        >
            {startIconChild}
            {labelChild}
            {endIconChild}
            {clickEffect !== 'none' && (
                <Ripple
                    ref={rippleRef}
                    duration={600}
                    type={clickEffect}
                    style={{
                        color: `var(--background-${color})`,
                        borderRadius: `var(--button-border-radius-${size})`
                    }}
                />
            )}
        </ROOT>
    );
});

export default Button;
