import CSS from 'csstype';
import './calender-picker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { caretDown, caretLeft, caretRight } from '../../icons/icons';
import { Fragment, useRef, useState } from 'react';
import Overlay from '../overlay/overlay';
import WeekPicker from '../week-picker/week-picker';
import { Tab, Tabs } from '@mui/material';
import MonthPicker from '../month-picker/month-picker';
import YearPicker from '../year-picker/year-picker';
import RangePicker from '../range-picker/range-picker';
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

const CalenderPicker = ({ onChange, range }: { onChange: (calenderPickerRange: OnCalenderPickerChange) => void; range?: { from: Date; to: Date } }) => {
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

    const renderTabContent = () => {
        switch (selectedTab) {
            case 'week':
                return <WeekPicker onChange={onPickerUpdate} value={value.values[selectedTab]} />;
            case 'month':
                return <MonthPicker onChange={onPickerUpdate} value={value.values[selectedTab]} />;
            case 'year':
                return <YearPicker onChange={onPickerUpdate} value={value.values[selectedTab]} />;
            default:
                return <RangePicker onChange={onPickerUpdate} value={value.values[selectedTab]} />;
        }
    };

    const tabs: { label: string; value: string }[] = [
        { label: 'Range', value: 'range' },
        { label: 'Weeks', value: 'week' },
        { label: 'Months', value: 'month' },
        { label: 'Years', value: 'year' }
    ];

    const renderTabs = () => {
        return tabs.map((tab, index) => {
            let rootClasses: string = 'tab-root';
            if (index !== tabs.length - 1) rootClasses += ' tab-root-after';
            return (
                <Tab
                    key={index}
                    label={tab.label}
                    value={tab.value}
                    classes={{
                        root: rootClasses,
                        selected: 'tab-selected'
                    }}
                />
            );
        });
    };

    const months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
        let range = value.values[value.activePicker];
        if (!range) return '';
        const start = range.rangeStart;
        const end = range.rangeEnd;
        const unit = range.unit;
        if (unit === 'month') {
            return isThisMonth(start) ? `This Month` : isThisYear(start) ? `${months[start.getMonth()]}` : `${months[start.getMonth()]} ${start.getFullYear()}`;
        } else if (unit === 'range') {
            if (isSameDay(end, new Date())) {
                return (
                    valueList.find((currentValue) => {
                        switch (currentValue.unit) {
                            case 'day':
                                return differenceInDays(end, start) === currentValue.diff;
                            case 'month':
                                return (
                                    (isSameMonth(end, start) && isSameDay(start, startOfMonth(new Date())) && isSameDay(end, new Date()) && isSameYear(end, start)) ||
                                    (currentValue.diff > 0 && differenceInMonths(end, start) === currentValue.diff)
                                );
                            case 'week':
                                return isSameWeek(end, start) && isSameDay(start, startOfWeek(new Date())) && isSameDay(end, new Date());
                            case 'year':
                                return isSameYear(end, start) && isSameDay(start, startOfYear(new Date())) && isSameDay(end, new Date());
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
        if (!range) return;
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
        if (!range) return;
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
            <i aria-hidden="true" className="icon" onClick={renderPreviousRange}>
                <FontAwesomeIcon icon={caretLeft} />
            </i>
            <div className="css-wi57kk-GridEmotionStyles--headerRowItem-Header--headerRowItemNoPadding" onClick={() => handleOpenPicker(false)} id="selector" ref={ref}>
                <div className="css-1h182y4-TimeSelect--selectContainer-TimeSelect--styles-TimeSelect--render">
                    <div className="select-classes">
                        <div style={calenerPickerBoxStyle}>
                            <input value={getShownLabel()} disabled={true} className="calender-picker-disabled-text-field" />
                        </div>
                        <i aria-hidden="true" className="calender-picker-icon icon">
                            <FontAwesomeIcon icon={caretDown} />
                        </i>
                    </div>
                </div>
            </div>
            <i aria-hidden="true" className="icon" onClick={renderNextRange}>
                <FontAwesomeIcon icon={caretRight} />
            </i>
            <Overlay open={openPicker} onBackdrop={() => handleOpenPicker(true)} triggerBy="selector">
                <div className="picker-body">
                    <Fragment>
                        <Tabs
                            onChange={switchTabs}
                            value={selectedTab}
                            classes={{
                                scroller: 'tab-scroller',
                                root: 'tabs-root',
                                indicator: 'tab-indicator'
                            }}
                        >
                            {renderTabs()}
                        </Tabs>
                        <div className="tab-content">{renderTabContent()}</div>
                    </Fragment>
                </div>
            </Overlay>
        </div>
    );
};
// @ts-ignore
export default CalenderPicker;

// @ts-ignore
