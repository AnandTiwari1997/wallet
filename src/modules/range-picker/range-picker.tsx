import './range-picker.css';
import Checkbox from '../checkbox/checkbox';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css';
import { startOfMonth, startOfWeek, startOfYear, subDays } from 'date-fns/esm';
import React, { useCallback, useEffect, useState } from 'react';
import { OnCalenderPickerChange } from '../calender-picker/calender-picker';
import { differenceInDays, differenceInMonths, isSameDay, isSameMonth, isSameWeek, isSameYear, subMonths } from 'date-fns';
import DatePicker, { DateRange } from '../date-picker/date-picker';
import Button from '../button/button';

const RangePicker = ({ value, onChange }: { value: OnCalenderPickerChange | undefined; onChange: (change: OnCalenderPickerChange, picker: string) => void }) => {
    const getRangeFromValue = (value: string | undefined): DateRange => {
        switch (value) {
            case '7-days':
                return {
                    startDate: subDays(new Date(), 6),
                    endDate: new Date()
                };
            case '30-days':
                return {
                    startDate: subDays(new Date(), 29),
                    endDate: new Date()
                };
            case '90-days':
                return {
                    startDate: subDays(new Date(), 89),
                    endDate: new Date()
                };
            case '12-months':
                return {
                    startDate: subMonths(new Date(), 12),
                    endDate: new Date()
                };
            case 'week':
                return {
                    startDate: startOfWeek(new Date()),
                    endDate: new Date()
                };
            case 'month':
                return {
                    startDate: startOfMonth(new Date()),
                    endDate: new Date()
                };
            case 'year':
                return {
                    startDate: startOfYear(new Date()),
                    endDate: new Date()
                };
            default:
                return {
                    startDate: new Date(),
                    endDate: new Date()
                };
        }
    };

    const getRange = (value: OnCalenderPickerChange | undefined) => {
        return value
            ? { startDate: value.rangeStart, endDate: value.rangeEnd }
            : {
                  startDate: startOfMonth(new Date()),
                  endDate: new Date()
              };
    };

    const [state, setState] = useState<DateRange>({
        ...getRange(value)
    });
    const [checkOption, setCheckedOption] = useState<{
        diff: number;
        unit: string;
    }>();

    const getCheckedOption = useCallback(
        (diff: number, unit: string) => {
            let start = state.startDate ? state.startDate : new Date();
            let end = state.endDate ? state.endDate : new Date();
            switch (unit) {
                case 'day':
                    return differenceInDays(end, start) === diff;
                case 'month':
                    return (
                        (isSameMonth(end, start) && isSameDay(start, startOfMonth(new Date())) && isSameDay(end, new Date()) && isSameYear(end, start)) ||
                        (diff > 0 && differenceInMonths(end, start) === diff)
                    );
                case 'week':
                    return isSameWeek(end, start) && isSameDay(start, startOfWeek(new Date())) && isSameDay(end, new Date());
                case 'year':
                    return isSameYear(end, start) && isSameDay(start, startOfYear(new Date())) && isSameDay(end, new Date());
            }
        },
        [state]
    );

    useEffect(() => {
        if (!value) {
            setState({ startDate: new Date(), endDate: new Date() });
            setCheckedOption(undefined);
            return;
        }
        const valueList: { diff: number; unit: string }[] = [
            { diff: 0, unit: 'day' },
            { diff: 6, unit: 'day' },
            { diff: 29, unit: 'day' },
            { diff: 89, unit: 'day' },
            { diff: 0, unit: 'week' },
            { diff: 0, unit: 'month' },
            { diff: 12, unit: 'month' },
            { diff: 0, unit: 'year' }
        ];
        const option = valueList.find((currentValue) => {
            return getCheckedOption(currentValue.diff, currentValue.unit);
        });
        setCheckedOption(option);
    }, [value, setCheckedOption]);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const range = getRangeFromValue(e.currentTarget.value);
        onChange(
            {
                rangeStart: range.startDate,
                rangeEnd: range.endDate,
                unit: 'range'
            },
            'range'
        );
    };

    const handleDateSelection = (item: DateRange) => {
        setState(item);
    };

    const handleCustomDateRangeApply = () => {
        onChange(
            {
                rangeStart: state.startDate,
                rangeEnd: state.endDate,
                unit: 'range'
            } as OnCalenderPickerChange,
            'range'
        );
    };

    const isCheckedOption = (diff: number, unit: string) => {
        return checkOption?.unit === unit && checkOption.diff === diff;
    };

    return (
        <div className="range-picker-container">
            <div className="range-picker-body">
                {
                    <div className="range-picker-options">
                        <Checkbox
                            checked={isCheckedOption(6, 'day')}
                            value="7-days"
                            customLabelStyles="input-checkbox-label"
                            customStyles="range-picker-option"
                            label="7 Days"
                            onChange={handleCheckboxChange}
                        />
                        <Checkbox
                            checked={isCheckedOption(29, 'day')}
                            value="30-days"
                            customLabelStyles="input-checkbox-label"
                            customStyles="range-picker-option"
                            label="30 Days"
                            onChange={handleCheckboxChange}
                        />
                        <Checkbox
                            checked={isCheckedOption(89, 'day')}
                            value="90-days"
                            customLabelStyles="input-checkbox-label"
                            customStyles="range-picker-option"
                            label="90 Days"
                            onChange={handleCheckboxChange}
                        />
                        <Checkbox
                            checked={isCheckedOption(12, 'month')}
                            value="12-months"
                            customLabelStyles="input-checkbox-label"
                            customStyles="range-picker-option"
                            label="12 Month"
                            onChange={handleCheckboxChange}
                        />
                        <Checkbox
                            checked={isCheckedOption(0, 'day')}
                            value="today"
                            customLabelStyles="input-checkbox-label"
                            customStyles="range-picker-option"
                            label="Today"
                            onChange={handleCheckboxChange}
                        />
                        <Checkbox
                            checked={isCheckedOption(0, 'week')}
                            value="week"
                            customLabelStyles="input-checkbox-label"
                            customStyles="range-picker-option"
                            label="This Week"
                            onChange={handleCheckboxChange}
                        />
                        <Checkbox
                            checked={isCheckedOption(0, 'month')}
                            value="month"
                            customLabelStyles="input-checkbox-label"
                            customStyles="range-picker-option"
                            label="This Month"
                            onChange={handleCheckboxChange}
                        />
                        <Checkbox
                            checked={isCheckedOption(0, 'year')}
                            value="year"
                            customLabelStyles="input-checkbox-label"
                            customStyles="range-picker-option"
                            label="This Year"
                            onChange={handleCheckboxChange}
                        />
                    </div>
                }
                <div className="range-picker-custom-range">
                    {
                        <div style={{ width: '100%' }}>
                            <DatePicker range={state} onSelectionChange={(dateRange) => handleDateSelection(dateRange)} enableSelection />
                            <div className="custom-date-range-apply-button-container">
                                <Button onClick={handleCustomDateRangeApply}>Apply</Button>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};

export default RangePicker;
