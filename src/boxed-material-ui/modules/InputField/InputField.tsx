import React, { forwardRef, ReactElement } from 'react';
import { InputFieldProps, StateProps } from './InputField.types';
import useGenerateClassNames from '../../styles/useGenerateClassNames/useGenerateClassNames';
import { useFocus, useHover } from '../../utils';
import { Styled } from '../../css-in-jss/Styled';
import clsx from 'clsx';
import { conditionalStyle } from '../../css-in-jss/Styled/Styled';
import useMergeRefs from '../../utils/useMergeRefs/useMergeRefs';

const ROOT = Styled.div<InputFieldProps & StateProps>(({ color, disabled }) => {
    return {
        position: `relative`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: `var(--content-default-soft)`,
        transition: `color 150ms ease-in 0ms`,
        conditionals: [
            conditionalStyle('hovered', !disabled, {
                color: `var(--content-${color})`
            }),
            conditionalStyle('focused', !disabled, {
                color: `var(--content-${color}-strong)`
            }),
            conditionalStyle('disabled', true, {
                color: `var(--content-disabled)`
            })
        ]
    };
});
const LABEL = Styled.label<InputFieldProps & StateProps>({
    fontFamily: `var(--font-family-stack-san-serif)`,
    fontWeight: `var(--font-weight-regular)`,
    fontSize: `var(--font-size-3x-small)`,
    alignSelf: 'start',
    display: `flex`,
    alignItems: `center`,
    height: `12px`,
    marginBottom: `var(--spacing-xs)`
});
const INPUT_CONTAINER = Styled.div<InputFieldProps & StateProps>(({ color }) => {
    return {
        width: `100%`,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: `var(--border-radius-sm)`,
        border: `2px solid currentColor`,
        boxSizing: `border-box`,
        conditionals: [
            conditionalStyle('appearance', 'ghost', {
                border: `none`,
                backgroundColor: `var(--neutral-5)`
            }),
            conditionalStyle('disabled', true, {
                backgroundColor: `var(--background-disabled)`
            })
        ]
    };
});
const INNER_INPUT_CONTAINER = Styled.div<InputFieldProps>({
    height: `100%`,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `var(--spacing-md)`,
    width: `100%`
});
const PREFIXES = Styled.div<InputFieldProps & StateProps>({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: `var(--spacing-sm)`
});
const ITEM = Styled.span<InputFieldProps>({
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: `var(--spacing-xl)`,
    width: `var(--spacing-xl)`,
    color: `var(--content-default-soft)`,
    margin: `0 var(--spacing-xs)`
});
const SUFFIXES = Styled.div<InputFieldProps & StateProps>({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: `var(--spacing-sm)`
});
const INPUT = Styled.input<InputFieldProps>({
    width: `100%`,
    height: `var(--spacing-xl)`,
    border: `none`,
    margin: `0`,
    padding: `0`,
    background: 'inherit',
    fontFamily: `var(--font-family-stack-san-serif)`,
    fontWeight: `var(--font-weight-regular)`,
    fontSize: `var(--font-size-3x-small)`
});
const HINT = Styled.label<InputFieldProps>({
    height: `12px`,
    marginTop: `var(--spacing-2xs)`,
    fontFamily: `var(--font-family-stack-san-serif)`,
    fontWeight: `var(--font-weight-light)`,
    fontSize: `var(--font-size-5x-small)`,
    alignSelf: 'start',
    display: `flex`,
    alignItems: `center`
});

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(inProps, ref) {
    const [focusedRef, isFocused] = useFocus<HTMLInputElement>();
    const [hoveredRef, isHovered] = useHover<HTMLInputElement>();

    const {
        showHint = false,
        showLabel = true,
        label,
        hint,
        className,
        color = 'primary',
        appearance = 'outlined',
        disabled = false,
        prefixes = [],
        suffixes = [],
        ...inputProps
    } = inProps;

    const classNames = useGenerateClassNames('input', [
        'root',
        color && `color-${color}`,
        appearance && `appearance-${appearance}`,
        disabled ? `disabled` : undefined,
        isFocused && !disabled ? `focused` : undefined
    ]);

    return (
        <ROOT
            className={clsx(classNames, className)}
            color={color}
            appearance={appearance}
            focused={isFocused}
            hovered={isHovered}
            disabled={disabled}
        >
            {showLabel && <LABEL>{label}</LABEL>}
            <INPUT_CONTAINER ref={hoveredRef} appearance={appearance} color={color} disabled={disabled}>
                <INNER_INPUT_CONTAINER appearance={appearance} color={color} disabled={disabled}>
                    {prefixes.length > 0 && (
                        <PREFIXES>
                            {prefixes.map((prefix) => (
                                <ITEM>{React.cloneElement(prefix as ReactElement, { disabled: disabled })}</ITEM>
                            ))}
                        </PREFIXES>
                    )}

                    <INPUT ref={useMergeRefs([focusedRef, ref])} disabled={disabled} {...inputProps} />
                    {prefixes.length > 0 && (
                        <SUFFIXES>
                            {suffixes.map((suffix) => (
                                <ITEM>{React.cloneElement(suffix as ReactElement, { disabled: disabled })}</ITEM>
                            ))}
                        </SUFFIXES>
                    )}
                </INNER_INPUT_CONTAINER>
            </INPUT_CONTAINER>
            {showHint && <HINT>{hint}</HINT>}
        </ROOT>
    );
});

export default InputField;
