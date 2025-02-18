import React, { ComponentPropsWithRef, forwardRef, Fragment, useEffect, useRef, useState } from 'react';

import Overlay from 'boxed-material-ui/modules/Overlay/Overlay';
import { Selected, SelectOption, SelectProps } from './Select.types';

import { Styled } from 'boxed-material-ui/styles';
import { useFocus, useHover, useMergeRefs, useSanitizeProp } from '../../utils';
import { clsx } from 'clsx';
import { conditionalStyle, pseudo } from '../../css-in-jss/Styled/Styled';
import { Divider } from 'modules';
import useGenerateClassNames from '../../styles/useGenerateClassNames/useGenerateClassNames';

const ROOT = Styled.div<ComponentPropsWithRef<'div'> & SelectProps & { hovered?: boolean }>(({ size, hovered }) => {
    return {
        width: `var(--select-width-${size})`,
        position: `relative`,
        userSelect: `none`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: `var(--content-default-soft)`,
        transition: `color 150ms ease-in-out 0ms`,
        conditionals: [
            conditionalStyle('hovered', true, {
                color: `var(--content-default)`
            })
        ]
    };
});

const LABEL = Styled.label<ComponentPropsWithRef<'label'> & SelectProps>({
    fontFamily: `var(--font-family-stack-san-serif)`,
    fontWeight: `var(--font-weight-regular)`,
    fontSize: `var(--font-size-3x-small)`,
    alignSelf: 'start',
    display: `flex`,
    alignItems: `center`,
    height: `12px`,
    marginBottom: `var(--spacing-xs)`
});

const SELECT_CONTAINER = Styled.div<SelectProps>(({ size, opened }) => {
    return {
        width: '100%',
        height: `var(--select-height-${size})`,
        position: `relative`,
        fontFamily: `var(--font-family-stack-san-serif)`,
        fontWeight: `var(--font-weight-regular)`,
        fontSize: `var(--select-font-size-${size})`,
        padding: `0 var(--select-padding-left-right-${size})`,
        cursor: `pointer`,
        textAlign: `start`,
        borderRadius: `var(--border-radius-sm)`,
        border: `2px solid currentColor`,
        boxSizing: `border-box`,
        display: `flex`,
        alignItems: `center`,
        background: `var(--background-default)`,
        pseudos: [
            pseudo(':after', true, {
                content: `''`,
                position: `absolute`,
                right: `var(--spacing-${size})`,
                pointerEvents: `none`,
                transition: `border 150ms ease-in-out 0ms`,
                conditionals: [
                    conditionalStyle('opened', true, {
                        borderLeft: `0.3rem solid transparent`,
                        borderRight: `0.3rem solid transparent`,
                        borderBottom: `0.3rem solid currentColor`
                    }),
                    conditionalStyle('opened', false, {
                        borderLeft: `0.3rem solid transparent`,
                        borderRight: `0.3rem solid transparent`,
                        borderTop: `0.3rem solid currentColor`
                    })
                ]
            })
        ]
    };
});

const SELECTED_OPTION = Styled.span<ComponentPropsWithRef<'span'> & SelectProps>({
    whiteSpace: `nowrap`,
    textOverflow: `ellipsis`,
    overflow: `hidden`
});

const SELECT_OPTION_ROOT = Styled.div<ComponentPropsWithRef<'div'>>({
    background: 'var(--background-default)',
    overflow: 'scroll',
    boxShadow: `var(--elevation-resting-m)`,
    borderRadius: `var(--border-radius-sm)`,
    paddingTop: `var(--spacing-xs)`,
    paddingBottom: `var(--spacing-xs)`,
    fontFamily: `var(--font-family-stack-san-serif)`,
    fontWeight: `var(--font-weight-regular)`,
    fontSize: `var(--font-size-3x-small-rem)`
});

const SELECT_OPTION_CONTAINER = Styled.div<ComponentPropsWithRef<'div'> & SelectProps & Selected>(
    ({ size, selected }) => {
        return {
            display: `flex`,
            justifyContent: `center`,
            alignItems: `center`,
            background: `white`,
            minHeight: `var(--select-option-height-${size})`,
            padding: `var(--select-padding-top-bottom-${size}) var(--select-padding-left-right-${size})`,
            textAlign: `center`,
            verticalAlign: `middle`,
            cursor: `pointer`,
            userSelect: `none`,
            conditionals: [
                conditionalStyle('selected', true, {
                    backgroundColor: `var(--background-active)`
                })
            ],
            pseudos: [
                pseudo('hover', !selected, {
                    backgroundColor: `var(--background-hover)`
                })
            ]
        };
    }
);

const Select = forwardRef<HTMLDivElement, SelectProps>(function Select(inProps, ref) {
    const [focusedRef, isFocused] = useFocus<HTMLDivElement>();
    const [hoveredRef, isHovered] = useHover<HTMLDivElement>();
    const selectRef = useMergeRefs<HTMLDivElement>([focusedRef, hoveredRef]);
    const {
        label,
        showLabel = true,
        options = [],
        spotClasses,
        spotStyles,
        selectedOption,
        className,
        placeholder = '-- Select --',
        loading,
        size = 'md',
        disabled = false,
        opened = false,
        onSelectionChange,
        ...props
    } = inProps;
    const virtualElement = useRef<HTMLDivElement>(null);
    const [optionVisible, setOptionVisible] = React.useState(opened && !disabled);
    const [selected, setSelected] = useState<string>();
    const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);
    const {
        root: rootClass,
        label: labelClass,
        container: containerClass,
        optionRoot: optionRootClass,
        optionContainer: optionContainerClass
    } = useSanitizeProp(spotClasses, {
        root: '',
        label: '',
        container: '',
        optionRoot: '',
        optionContainer: ''
    });

    useEffect(() => {
        if (!loading) {
            const label = options.find((option) => selectedOption === option.value)?.label;
            setSelected(label ?? placeholder);
            setSelectOptions(options);
        }
    }, [loading, options]);

    const rootClassNames = useGenerateClassNames('select', [
        'root',
        size && `size-${size}`,
        disabled ? `disabled` : undefined,
        isFocused && !disabled ? `focused` : undefined,
        isHovered && !disabled ? `hovered` : undefined,
        optionVisible && !disabled ? `option-visible` : undefined
    ]);
    const labelClassNames = useGenerateClassNames('select', ['label']);
    const containerClassNames = useGenerateClassNames('select', ['container']);
    const optionRootClassNames = useGenerateClassNames('select', ['option-root']);
    const optionContainerClassNames = useGenerateClassNames('select', ['option-container']);

    return (
        <ROOT
            className={clsx(rootClassNames, className, rootClass)}
            hovered={isHovered || optionVisible || isFocused}
            size={size}
        >
            {showLabel && <LABEL className={clsx(labelClassNames, labelClass)}>{label}</LABEL>}
            <SELECT_CONTAINER
                ref={selectRef}
                size={size}
                className={clsx(containerClassNames, containerClass)}
                onClick={(event) => {
                    event.stopPropagation();
                    setOptionVisible(true);
                }}
                opened={optionVisible}
                {...props}
            >
                <SELECTED_OPTION>{selected}</SELECTED_OPTION>
            </SELECT_CONTAINER>
            {
                <Overlay
                    anchorElement={focusedRef.current}
                    open={optionVisible}
                    parent={document.getElementsByTagName('body')[0]}
                    onBackdrop={() => setOptionVisible(false)}
                >
                    <SELECT_OPTION_ROOT
                        ref={virtualElement}
                        className={clsx(optionRootClassNames, optionRootClass)}
                        style={{
                            width: `${focusedRef.current ? focusedRef.current.offsetWidth - 0.5 : 0}px`,
                            maxHeight: `${virtualElement.current ? virtualElement.current.offsetHeight : 350}px`
                        }}
                    >
                        {selectOptions.map((option, index) => {
                            return (
                                <Fragment>
                                    <SELECT_OPTION_CONTAINER
                                        size={size}
                                        defaultValue={option.value}
                                        id={option.value}
                                        className={clsx(optionContainerClassNames, optionContainerClass)}
                                        selected={selectedOption === option.value}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setOptionVisible(false);
                                            setSelected(option.label);
                                            if (onSelectionChange) {
                                                onSelectionChange(option);
                                            }
                                        }}
                                    >
                                        {option.label}
                                    </SELECT_OPTION_CONTAINER>
                                    {index < options.length - 1 && <Divider width={1}></Divider>}
                                </Fragment>
                            );
                        })}
                    </SELECT_OPTION_ROOT>
                </Overlay>
            }
        </ROOT>
    );
});

export default Select;
