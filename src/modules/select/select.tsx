import './select.css';
import React, { Fragment, useRef } from 'react';

import Divider from '../divider/divider';
import Overlay from '../overlay/overlay';

export interface SelectOption {
    value: any;
    label: string;
}

type SelectProps = {
    options: SelectOption[];
    selectedOption: any;
    onSelectionChange: (selectedOption: SelectOption) => void;
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> &
    React.DetailsHTMLAttributes<HTMLDivElement>;

const Select: React.FC<SelectProps> = ({ options, selectedOption, className, onSelectionChange, ...props }) => {
    const referenceElement = useRef<HTMLDivElement>(null);
    const virtualElement = useRef<HTMLDivElement>(null);
    const [optionVisible, setOptionVisible] = React.useState(false);
    return (
        <Fragment>
            <div className={['select-container', className].join(' ')}>
                <div
                    ref={referenceElement}
                    className={'select'}
                    onClick={(event) => {
                        event.stopPropagation();
                        setOptionVisible(true);
                    }}
                    {...props}
                >
                    {options.find((option) => selectedOption === option.value)?.label}
                </div>
                {
                    <Overlay
                        trigger={referenceElement.current}
                        open={optionVisible}
                        parent={document.getElementsByTagName('body')[0]}
                        onBackdrop={() => setOptionVisible(false)}
                    >
                        <div
                            ref={virtualElement}
                            style={{
                                width: `${referenceElement.current ? referenceElement.current.offsetWidth - 2 : 0}px`,
                                border: `1px solid black`,
                                maxHeight: `${virtualElement.current ? virtualElement.current.offsetHeight : 350}px`,
                                overflow: 'scroll'
                            }}
                        >
                            {options.map((option, index) => {
                                const classList = ['select-option'];
                                if (option.value === selectedOption) {
                                    classList.push('selected');
                                }
                                return (
                                    <Fragment>
                                        <div
                                            defaultValue={option.value}
                                            id={option.value}
                                            className={classList.join(' ')}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setOptionVisible(false);
                                                onSelectionChange(option);
                                            }}
                                        >
                                            {option.label}
                                        </div>
                                        {index < options.length - 1 && <Divider width={1}></Divider>}
                                    </Fragment>
                                );
                            })}
                        </div>
                    </Overlay>
                }
            </div>
        </Fragment>
    );
};

export default Select;
