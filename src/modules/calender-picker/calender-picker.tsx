import CSS from 'csstype';

import './calender-picker.css';
import {
    addDays,
    differenceInDays,
    differenceInMonths,
    format,
    isSameDay,
    isSameMonth,
    isSameWeek,
    isSameYear,
    isThisMonth,
    isThisWeek,
    isThisYear,
    startOfMonth,
    startOfWeek,
    startOfYear,
    subDays
} from 'date-fns/esm';
import { Fragment, useRef, useState } from 'react';

import { caretDown, caretLeft, caretRight } from '../../icons/icons';
import Icon from '../icon/icon';
import IconButton from '../icon/icon-button';
import MonthPicker from '../month-picker/month-picker';
import Overlay from '../overlay/overlay';
import RangePicker from '../range-picker/range-picker';
import Tab from '../tabs/tab';
import Tabs from '../tabs/tabs';
import WeekPicker from '../week-picker/week-picker';
// import { Tab, Tabs } from '@mui/material';
import YearPicker from '../year-picker/year-picker';

const calenerPickerBoxStyle: CSS.Properties = {
    width: '100%',
    height: '100%'
};

export interface OnCalenderPickerChange {
    rangeStart: Date;
    rangeEnd: Date;
    unit: string;
}

export interface PickerData {
    activePicker: string;
    values: { [key: string]: OnCalenderPickerChange | undefined };
}

class CalenderPickerTab {
    static RANGE = { label: 'Range', value: 'range' };
    static WEEKS = { label: 'Weeks', value: 'week' };
    static MONTHS = { label: 'Months', value: 'month' };
    static YEARS = { label: 'Years', value: 'year' };
}

const CalenderPicker = ({
    onChange,
    range
}: {
    onChange: (calenderPickerRange: OnCalenderPickerChange) => void;
    range?: { from: Date; to: Date };
}) => {
    const ref = useRef(null);
    const tabsValue: PickerData = {
        activePicker: 'range',
        values: {
            week: undefined,
            month: undefined,
            year: undefined,
            range: {
                rangeStart: range ? range.from : new Date(),
                rangeEnd: range ? range.to : new Date(),
                unit: 'range'
            }
        }
    };

    const [openPicker, setOpenPicker] = useState(false);
    const [value, setValue] = useState(tabsValue);
    const [selectedTab, setSelectedTab] = useState('range');

    const handleOpenPicker = (isBackDrop: boolean) => {
        if (isBackDrop) {
            setOpenPicker(false);
        } else {
            setOpenPicker(!openPicker);
        }
        setSelectedTab(value.activePicker);
    };

    const switchTabs = (e: any, tab: string) => {
        if (tab !== value.activePicker) {
            value.values[tab] = undefined;
        }
        setValue(value);
        setSelectedTab(tab);
    };

    const onPickerUpdate = (newValue: OnCalenderPickerChange, tab: string) => {
        value.activePicker = tab;
        value.values[tab] = newValue;
        onChange({
            rangeStart: newValue.rangeStart,
            rangeEnd: newValue.rangeEnd,
            unit: newValue.unit
        });
        setValue(value);
        handleOpenPicker(false);
    };

    const months: string[] = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    const valueList: { diff: number; unit: string; label: string }[] = [
        { diff: 0, unit: 'day', label: 'Today' },
        { diff: 6, unit: 'day', label: 'Last 7 Days' },
        { diff: 29, unit: 'day', label: 'Last 30 Days' },
        { diff: 89, unit: 'day', label: 'Last 90 Days' },
        { diff: 0, unit: 'week', label: 'This Week' },
        { diff: 0, unit: 'month', label: 'This Month' },
        { diff: 12, unit: 'month', label: 'Last 12 Months' },
        { diff: 0, unit: 'year', label: 'This Year' }
    ];

    const getShownLabel = (): string => {
        const range = value.values[value.activePicker];
        if (!range) {
            return '';
        }
        const start = range.rangeStart;
        const end = range.rangeEnd;
        const unit = range.unit;
        if (unit === 'month') {
            return isThisMonth(start)
                ? `This Month`
                : isThisYear(start)
                ? `${months[start.getMonth()]}`
                : `${months[start.getMonth()]} ${start.getFullYear()}`;
        } else if (unit === 'range') {
            if (isSameDay(end, new Date())) {
                return (
                    valueList.find((currentValue) => {
                        switch (currentValue.unit) {
                            case 'day':
                                return differenceInDays(end, start) === currentValue.diff;
                            case 'month':
                                return (
                                    (isSameMonth(end, start) &&
                                        isSameDay(start, startOfMonth(new Date())) &&
                                        isSameDay(end, new Date()) &&
                                        isSameYear(end, start)) ||
                                    (currentValue.diff > 0 && differenceInMonths(end, start) === currentValue.diff)
                                );
                            case 'week':
                                return (
                                    isSameWeek(end, start) &&
                                    isSameDay(start, startOfWeek(new Date())) &&
                                    isSameDay(end, new Date())
                                );
                            case 'year':
                                return (
                                    isSameYear(end, start) &&
                                    isSameDay(start, startOfYear(new Date())) &&
                                    isSameDay(end, new Date())
                                );
                        }
                    })?.label || ''
                );
            }
            return dateCommonFormat(start, end);
        } else if (unit === 'week') {
            return isThisWeek(start, { weekStartsOn: 1 }) ? `This Week` : dateCommonFormat(start, end);
        } else {
            return isThisYear(start) ? `This Year` : `${start.getFullYear()}`;
        }
    };

    const dateCommonFormat = (start: Date, end: Date) => {
        return `${format(start, `dd MMMM ${!isThisYear(start) ? 'yyyy' : ''}`, {
            weekStartsOn: 1,
            useAdditionalDayOfYearTokens: true,
            useAdditionalWeekYearTokens: true
        }).trim()} to ${format(end, `dd MMMM ${!isThisYear(end) ? 'yyyy' : ''}`, {
            weekStartsOn: 1,
            useAdditionalDayOfYearTokens: true,
            useAdditionalWeekYearTokens: true
        }).trim()}`;
    };

    const renderNextRange = () => {
        const range = value.values[value.activePicker];
        if (!range) {
            return;
        }
        const diffDays = differenceInDays(range.rangeEnd, range.rangeStart);
        const newValue = {
            rangeStart: new Date(addDays(range.rangeEnd, 1)),
            rangeEnd: new Date(addDays(range.rangeEnd, diffDays + 1)),
            unit: range.unit
        };
        onChange(newValue);
        value.values[value.activePicker] = { ...newValue };
        setValue({ ...value });
        setOpenPicker(false);
    };

    const renderPreviousRange = () => {
        const range = value.values[value.activePicker];
        if (!range) {
            return;
        }
        const diffDays = differenceInDays(range.rangeEnd, range.rangeStart);
        const newValue = {
            rangeStart: new Date(subDays(range.rangeStart, diffDays + 1)),
            rangeEnd: new Date(subDays(range.rangeStart, 1)),
            unit: range.unit
        };
        onChange(newValue);
        value.values[value.activePicker] = { ...newValue };
        setValue({ ...value });
        setOpenPicker(false);
    };

    return (
        <div className="date-range-picker">
            <IconButton icon={caretLeft} onClick={renderPreviousRange} />
            <div
                className="css-wi57kk-GridEmotionStyles--headerRowItem-Header--headerRowItemNoPadding"
                onClick={() => handleOpenPicker(false)}
                id="selector"
                ref={ref}
            >
                <div className="css-1h182y4-TimeSelect--selectContainer-TimeSelect--styles-TimeSelect--render">
                    <div className="select-classes">
                        <div style={calenerPickerBoxStyle}>
                            <label className="calender-picker-disabled-text-field">{getShownLabel()}</label>
                        </div>
                        <Icon icon={caretDown} style={{ cursor: 'pointer' }} />
                    </div>
                </div>
            </div>
            <IconButton icon={caretRight} onClick={renderNextRange} />
            <Overlay open={openPicker} onBackdrop={() => handleOpenPicker(true)} triggerBy="selector" noShadow noMargin>
                <div className="picker-body">
                    <Fragment>
                        <Tabs
                            selectedTab={selectedTab}
                            onTabChange={(selectedTab) => setSelectedTab(selectedTab.tabValue)}
                        >
                            <Tab
                                label={CalenderPickerTab.RANGE.label}
                                value={CalenderPickerTab.RANGE.value}
                                classes={'tab--width'}
                            >
                                <RangePicker onChange={onPickerUpdate} value={value.values[selectedTab]} />
                            </Tab>
                            <Tab
                                label={CalenderPickerTab.WEEKS.label}
                                value={CalenderPickerTab.WEEKS.value}
                                classes={'tab--width'}
                            >
                                <WeekPicker onChange={onPickerUpdate} value={value.values[selectedTab]} />
                            </Tab>
                            <Tab
                                label={CalenderPickerTab.MONTHS.label}
                                value={CalenderPickerTab.MONTHS.value}
                                classes={'tab--width'}
                            >
                                <MonthPicker onChange={onPickerUpdate} value={value.values[selectedTab]} />
                            </Tab>
                            <Tab
                                label={CalenderPickerTab.YEARS.label}
                                value={CalenderPickerTab.YEARS.value}
                                classes={'tab--width'}
                            >
                                <YearPicker onChange={onPickerUpdate} value={value.values[selectedTab]} />
                            </Tab>
                        </Tabs>
                    </Fragment>
                </div>
            </Overlay>
        </div>
    );
};
// @ts-ignore
export default CalenderPicker;

// @ts-ignore
