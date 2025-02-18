import TextBox from '../text-box/text-box';
import DatePicker, { DateRange } from '../date-picker/date-picker';

import React, { FC, forwardRef, Fragment, useRef, useState } from 'react';
import { OnCalenderPickerChange } from 'boxed-material-ui/modules/CalenderPicker';

import { calender } from 'icons/icons';

import './date-input.css';

import Button from 'boxed-material-ui/modules/Button/Button';
import Overlay from 'boxed-material-ui/modules/Overlay/Overlay';
import { Icon } from 'modules/icon';
import { DateInputProps } from 'modules/DateInput/DateInput.types';
import Styled from 'boxed-material-ui/css-in-jss/Styled/Styled';
import { format as formatDate, parse } from 'date-fns';

const ROOT = Styled<DateInputProps>('div')({
    display: 'flex',
    flexDirection: 'row',
    position: 'relative'
});

const DateInput: FC<DateInputProps> = forwardRef(function DateInput(inProps, ref) {
    const { value, format = 'dd-MM-yyyy', onChange, onInputChange, ...rest } = inProps;

    const getRange = (value: OnCalenderPickerChange | undefined) => {
        return value
            ? { startDate: value.rangeStart, endDate: value.rangeEnd }
            : {
                  startDate: new Date(),
                  endDate: new Date()
              };
    };
    const [state, setState] = useState<DateRange>({
        ...getRange(undefined)
    });
    const dataFieldReference = useRef<HTMLDivElement>(null);
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [pickerValue, setPickerValue] = useState<any>(value);

    return (
        <Fragment>
            <ROOT ref={dataFieldReference}>
                <TextBox
                    value={pickerValue}
                    placeholder={format}
                    onChange={(event) => {
                        setPickerValue(event.target.value);
                        onChange && onChange(event);
                        onInputChange && onInputChange(parse(event.target.value, format, new Date()));
                    }}
                    onFocus={(event) => {
                        setShowDatePicker(true);
                    }}
                    {...rest}
                />
                <div
                    style={{
                        position: 'absolute',
                        alignItems: 'center',
                        display: 'flex',
                        right: `0`,
                        top: `0`,
                        bottom: `0`
                    }}
                >
                    <Icon
                        icon={calender}
                        svgProps={{
                            height: '16px',
                            width: '16px'
                        }}
                    />
                </div>
            </ROOT>
            {showDatePicker && (
                <Overlay
                    open={showDatePicker}
                    parent={document.getElementsByTagName('body')[0]}
                    onBackdrop={() => setShowDatePicker(false)}
                    anchorElement={dataFieldReference.current}
                >
                    <div className="date-picker-container">
                        <DatePicker
                            range={state}
                            onSelectionChange={(dateRange) => setState(dateRange)}
                            enableSelection={false}
                        />
                        <div className="custom-date-range-apply-button-container">
                            <Button
                                size={'sm'}
                                onClick={(event) => {
                                    setPickerValue(formatDate(state.startDate, format));
                                    setShowDatePicker(false);
                                }}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </Overlay>
            )}
        </Fragment>
    );
});

export default DateInput;
