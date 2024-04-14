import './month-picker.css';
import { addYears, endOfMonth, startOfMonth, subYears } from 'date-fns/esm';
import React, { useState } from 'react';

import { arrowLeft, arrowRight } from '../../icons/icons';
import { OnCalenderPickerChange } from '../calender-picker/calender-picker';
import IconButton from '../icon/icon-button';

const MonthPicker = ({
    value,
    onChange
}: {
    value: OnCalenderPickerChange | undefined;
    onChange: (change: OnCalenderPickerChange, picker: string) => void;
}) => {
    const parse = (value: any, index: number) => {
        if (!value) {
            return undefined;
        }
        const label = value.label;
        if (label === 'This Month') {
            return index === 0 ? new Date().getMonth() : new Date().getFullYear();
        }
        const dates: string[] = label.trim().split(' ');
        if (index === 0) {
            const month: string = dates[index].trim();
            return months.indexOf(month);
        }
        if (dates.length === 1) {
            return new Date().getFullYear();
        }
        return parseInt(dates[index].trim());
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

    const [month, setMonth] = useState({
        month: value ? value.rangeStart.getMonth() : undefined,
        year: value ? value.rangeStart.getFullYear() : undefined
    });
    const [year, setYear] = useState(month.year ? month.year : new Date().getFullYear());

    const handleClick = (e: any) => {
        const date = new Date();
        date.setMonth(parseInt(e.target.id));
        date.setFullYear(year);
        onChange(
            {
                rangeStart: startOfMonth(date),
                rangeEnd: endOfMonth(date),
                unit: 'month'
            },
            'month'
        );
        setMonth({ month: date.getMonth(), year: date.getFullYear() });
    };

    const handleYear = (isNext: boolean) => {
        let localDate = new Date();
        localDate.setFullYear(year);
        if (isNext) {
            localDate = addYears(localDate, 1);
        } else {
            localDate = subYears(localDate, 1);
        }
        setYear(localDate.getFullYear());
    };

    const renderMonth = () => {
        return months.map((month_, index) => {
            let className = 'single-month';
            if (index === new Date().getMonth() && year === new Date().getFullYear()) {
                className += ' current-month';
            }
            if (month.month === index && month.year === year) {
                className += ' selected-month';
            }
            return (
                <div className={className} key={index} id={`${index}`} onClick={handleClick}>
                    {month_}
                </div>
            );
        });
    };

    return (
        <div className="month-picker-container">
            <div className="month-picker-header">
                <IconButton icon={arrowLeft} className={'arrow-container'} onClick={() => handleYear(false)} />
                {`${year}`}
                <IconButton icon={arrowRight} className={'arrow-container'} onClick={() => handleYear(false)} />
            </div>
            <div className="month-picker-body">{renderMonth()}</div>
        </div>
    );
};

export default MonthPicker;
