import TextBox from '../text-box/text-box';
import DatePicker, { DateRange } from '../date-picker/date-picker';
import React, { useState } from 'react';
import { OnCalenderPickerChange } from '../calender-picker/calender-picker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { calender } from '../../icons/icons';
import ReactDOM from 'react-dom';
import './date-input.css';
import { format } from 'date-fns';
import Button from '../button/button';

const DateInput = ({ value, setValue, ...props }: { value: any; [key: string]: any }) => {
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

    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row'
                }}
            >
                <TextBox setValue={setValue} value={value} placeholder={'dd-MM-yyyy'} />
                <div
                    style={{
                        position: 'relative',
                        alignItems: 'center',
                        display: 'flex'
                    }}
                >
                    <i aria-hidden="true" id={'calender-id'} className="calender-picker-icon icon arrow-container" onClick={() => setShowDatePicker(!showDatePicker)}>
                        <FontAwesomeIcon icon={calender} />
                    </i>
                </div>
            </div>
            {showDatePicker &&
                ReactDOM.createPortal(
                    <div className="date-picker-overlay">
                        <div className="overlay-backdrop" onClick={() => setShowDatePicker(false)}></div>
                        <div className="date-picker-overlay-container">
                            <div className="date-picker-container">
                                <DatePicker range={state} onSelectionChange={(dateRange) => setState(dateRange)} enableSelection={false} />
                                <div className="custom-date-range-apply-button-container">
                                    <Button
                                        tabIndex={-1}
                                        type="button"
                                        role="tab"
                                        aria-selected="false"
                                        onClick={(event) => {
                                            setValue(format(state.startDate, 'dd-MM-yyyy'));
                                            setShowDatePicker(false);
                                        }}
                                    >
                                        Apply
                                        <span className="MuiTouchRipple-root css-8je8zh-MuiTouchRipple-root"></span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.getElementsByTagName('body')[0]
                )}
        </>
    );
};

export default DateInput;
