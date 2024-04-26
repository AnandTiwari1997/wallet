import TextBox from '../text-box/text-box';
import DatePicker, { DateRange } from '../date-picker/date-picker';
import React, { useRef, useState } from 'react';
import { OnCalenderPickerChange } from '../calender-picker/calender-picker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { calender } from '../../icons/icons';
import './date-input.css';
import { format } from 'date-fns';
import Button from '../button/button';
import Overlay from '../overlay/overlay';

type DateInputProps = {} & React.ComponentPropsWithoutRef<'input'>;

const DateInput = ({ value, ...props }: DateInputProps) => {
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
        <>
            <div
                ref={dataFieldReference}
                style={{
                    display: 'flex',
                    flexDirection: 'row'
                }}
            >
                <TextBox
                    value={pickerValue}
                    placeholder={'dd-MM-yyyy'}
                    {...props}
                    onChange={(event) => {
                        setPickerValue(event.target.value);
                        if (props['onChange']) {
                            props['onChange'](event);
                        }
                    }}
                />
                <div
                    style={{
                        position: 'relative',
                        alignItems: 'center',
                        display: 'flex'
                    }}
                >
                    <i
                        aria-hidden="true"
                        id={'calender-id'}
                        className="calender-picker-icon icon arrow-container"
                        onClick={() => setShowDatePicker(!showDatePicker)}
                    >
                        <FontAwesomeIcon icon={calender} />
                    </i>
                </div>
            </div>
            {showDatePicker && (
                <Overlay
                    open={showDatePicker}
                    parent={document.getElementsByTagName('body')[0]}
                    onBackdrop={() => setShowDatePicker(false)}
                    trigger={dataFieldReference.current}
                >
                    <div
                        className="date-picker-container"
                        style={{
                            width: `${
                                dataFieldReference.current && dataFieldReference.current.offsetWidth > 300
                                    ? dataFieldReference.current.offsetWidth - 2
                                    : 300
                            }px`
                        }}
                    >
                        <DatePicker
                            range={state}
                            onSelectionChange={(dateRange) => setState(dateRange)}
                            enableSelection={false}
                        />
                        <div className="custom-date-range-apply-button-container">
                            <Button
                                tabIndex={-1}
                                type="button"
                                role="tab"
                                aria-selected="false"
                                onClick={(event) => {
                                    setPickerValue(format(state.startDate, 'dd-MM-yyyy'));
                                    setShowDatePicker(false);
                                }}
                            >
                                Apply
                                <span className="MuiTouchRipple-root css-8je8zh-MuiTouchRipple-root"></span>
                            </Button>
                        </div>
                    </div>
                </Overlay>
            )}
        </>
    );
};

export default DateInput;
