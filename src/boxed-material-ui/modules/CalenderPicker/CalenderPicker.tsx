import {
    CalenderPickerProps,
    CalenderPickerTab,
    OnCalenderPickerChange,
    PickerData
} from 'boxed-material-ui/modules/CalenderPicker/CalenderPicker.types';
import Overlay from 'boxed-material-ui/modules/Overlay/Overlay';
import { Styled } from 'boxed-material-ui/styles';
import useGenerateClassNames from 'boxed-material-ui/styles/useGenerateClassNames/useGenerateClassNames';
import { clsx } from 'clsx';
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
import { caretDown, caretLeft, caretRight } from 'icons/icons';
import { Icon } from 'modules/icon';
import { IconButton } from 'modules/icon-button';
import { MonthPicker } from 'modules/month-picker';
import { RangePicker } from 'modules/range-picker';
import { Tab, Tabs } from 'modules/tabs';
import { WeekPicker } from 'modules/week-picker';
import { YearPicker } from 'modules/year-picker';
import { ComponentPropsWithoutRef, FC, forwardRef, Fragment, useRef, useState } from 'react';
import { useSanitizeProp } from '../../utils';

const ROOT = Styled<CalenderPickerProps>('div')((styles) => {
    return {
        display: `flex`,
        alignItems: `center`,
        justifyContent: `center`
    };
});

const HEADER = Styled<ComponentPropsWithoutRef<'div'>>('div')((styled) => {
    return {
        flex: `0 1 0%`,
        display: `flex`,
        alignItems: `center`,
        boxSizing: `border-box`,
        justifyContent: `space-around`,
        paddingRight: `0rem`
    };
});

const HEADER_SELECT = Styled<ComponentPropsWithoutRef<'div'>>('div')((styles) => {
    return {
        display: `flex`,
        position: `relative`,
        boxSizing: `border-box`,
        flexDirection: `row`,
        fontWeight: `400`,
        cursor: `text`,
        alignItems: `center`,
        justifyContent: `center`,
        fontFamily: `inherit`,
        fontSize: `0.8rem`,
        backgroundColor: `rgb(255, 255, 255)`,
        lineHeight: `1.1rem`,
        color: `rgb(0, 0, 0)`,
        border: `1px solid rgb(138, 150, 158)`,
        borderImage: `initial`,
        width: `20rem`,
        height: `40px`
    };
});

const LABEL = Styled<ComponentPropsWithoutRef<'label'>>('label')((styled) => {
    return {
        display: `flex`,
        justifyContent: `center`,
        alignItems: `center`,
        padding: `0`,
        width: `100%`,
        height: `100%`,
        background: `transparent`,
        border: `none`,
        textAlign: `center`,
        cursor: `pointer`,
        userSelect: `none`
    };
});

const BODY = Styled<ComponentPropsWithoutRef<'div'>>('div')((styled) => {
    return {
        padding: `0 calc(0.4rem - 1px)`,
        border: `1px solid #c3c0cc`,
        overflow: `hidden`,
        background: `white`,
        display: `flex`,
        flexDirection: `column`,
        alignItems: `center`,
        cursor: `pointer`,
        flex: `1`,
        minHeight: `0`,
        height: `500px`
    };
});

const CalenderPicker: FC<CalenderPickerProps> = forwardRef(function CalenderPicker(inProps, refer) {
    const { onChange, range, childProps, childClasses, className, ...others } = inProps;
    const { header: headerProps, body: bodyProps } = useSanitizeProp(childProps, { header: {}, body: {} });
    const { header: headerClass, body: bodyClass } = useSanitizeProp(childClasses, { header: '', body: '' });

    const ref = useRef<HTMLDivElement>(null);

    const [openPicker, setOpenPicker] = useState(false);
    const [selectedTab, setSelectedTab] = useState('range');

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

    const [value, setValue] = useState(tabsValue);

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
        if (onChange) {
            onChange({
                rangeStart: newValue.rangeStart,
                rangeEnd: newValue.rangeEnd,
                unit: newValue.unit
            });
        }
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
            if (isThisMonth(start)) {
                return `This Month`;
            } else if (isThisYear(start)) {
                return `${months[start.getMonth()]}`;
            } else {
                return `${months[start.getMonth()]} ${start.getFullYear()}`;
            }
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
                            default:
                                // eslint-disable-next-line array-callback-return
                                return;
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
        if (onChange) {
            onChange(newValue);
        }
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
        if (onChange) {
            onChange(newValue);
        }
        value.values[value.activePicker] = { ...newValue };
        setValue({ ...value });
        setOpenPicker(false);
    };

    const rootClassNames = useGenerateClassNames('calender-picker', ['root']);
    const headerClassNames = useGenerateClassNames('calender-picker', ['header']);
    const bodyClassNames = useGenerateClassNames('calender-picker', ['body']);

    return (
        <ROOT className={clsx(rootClassNames, className)} {...others}>
            <IconButton
                icon={caretLeft}
                onClick={renderPreviousRange}
                svgProps={{
                    height: '16px',
                    width: '16px'
                }}
            />
            <HEADER
                onClick={() => handleOpenPicker(false)}
                ref={ref}
                className={clsx(headerClassNames, headerClass)}
                {...headerProps}
            >
                <HEADER_SELECT>
                    <div
                        style={{
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        <LABEL>{getShownLabel()}</LABEL>
                    </div>
                    <Icon
                        icon={caretDown}
                        style={{ cursor: 'pointer' }}
                        svgProps={{
                            height: '16px',
                            width: '16px'
                        }}
                    />
                </HEADER_SELECT>
            </HEADER>
            <IconButton
                icon={caretRight}
                onClick={renderNextRange}
                svgProps={{
                    height: '16px',
                    width: '16px'
                }}
            />
            <Fragment>
                {openPicker && (
                    <Overlay
                        open={openPicker}
                        onBackdrop={() => handleOpenPicker(true)}
                        parent={document.getElementsByTagName('body')[0]}
                        anchorElement={ref.current}
                    >
                        <BODY className={clsx(bodyClassNames, bodyClass)} {...bodyProps}>
                            <Tabs
                                selectedTab={selectedTab}
                                onTabChange={(selectedTab) => {
                                    setSelectedTab(selectedTab.tabValue);
                                }}
                            >
                                <Tab label={CalenderPickerTab.RANGE.label} value={CalenderPickerTab.RANGE.value}>
                                    <RangePicker onChange={onPickerUpdate} value={value.values[selectedTab]} />
                                </Tab>
                                <Tab label={CalenderPickerTab.WEEKS.label} value={CalenderPickerTab.WEEKS.value}>
                                    <WeekPicker onChange={onPickerUpdate} value={value.values[selectedTab]} />
                                </Tab>
                                <Tab label={CalenderPickerTab.MONTHS.label} value={CalenderPickerTab.MONTHS.value}>
                                    <MonthPicker onChange={onPickerUpdate} value={value.values[selectedTab]} />
                                </Tab>
                                <Tab label={CalenderPickerTab.YEARS.label} value={CalenderPickerTab.YEARS.value}>
                                    <YearPicker onChange={onPickerUpdate} value={value.values[selectedTab]} />
                                </Tab>
                            </Tabs>
                        </BODY>
                    </Overlay>
                )}
            </Fragment>
        </ROOT>
    );
});
export default CalenderPicker;
