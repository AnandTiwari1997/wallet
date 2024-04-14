import './week-picker.css';
import { addMonths, endOfDay, endOfWeek, startOfDay, startOfWeek, subMonths, getDaysInMonth } from 'date-fns';
import { useState } from 'react';

import { arrowLeft, arrowRight } from '../../icons/icons';
import { OnCalenderPickerChange } from '../calender-picker/calender-picker';
import IconButton from '../icon/icon-button';

const WeekPicker = ({
    value,
    onChange
}: {
    value: OnCalenderPickerChange | undefined;
    onChange: (change: OnCalenderPickerChange, picker: string) => void;
}) => {
    const [week, setWeek] = useState({
        firstDay: value ? value.rangeStart : undefined,
        lastDay: value ? value.rangeEnd : undefined
    });
    const [date, setDate] = useState(week.firstDay ? week.firstDay : new Date());

    const isLeapYear = () => {
        const leapYear = new Date(new Date().getFullYear(), 1, 29);
        return leapYear.getDate() === 29;
    };

    const handleClick = (e: any) => {
        let localDate;

        if (e.target.id.includes('prev')) {
            localDate = new Date(date.setDate(1));
            setDate(new Date(date.setDate(1)));
        } else if (e.target.id.includes('next')) {
            localDate = new Date(date.setDate(getDaysInMonth(date)));
            setDate(new Date(date.setDate(getDaysInMonth(date))));
        } else {
            localDate = new Date(date.setDate(e.target.id));
            setDate(new Date(date.setDate(e.target.id)));
        }
        const firstDay = startOfWeek(localDate, { weekStartsOn: 1 });
        const lastDay = endOfWeek(localDate, { weekStartsOn: 1 });
        onChange({ rangeStart: firstDay, rangeEnd: lastDay, unit: 'week' }, 'week');
        setWeek({ firstDay, lastDay });
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const days: { [key: string]: number } = {
        '1': 31,
        '2': isLeapYear() ? 29 : 28,
        '3': 31,
        '4': 30,
        '5': 31,
        '6': 30,
        '7': 31,
        '8': 31,
        '9': 30,
        '10': 31,
        '11': 30,
        '12': 31
    };

    const renderDays = () => {
        const month = date.getMonth() + 1;
        const ar = [];
        for (let i = 1; i <= days[month]; i++) {
            const currentDate = new Date(date).setDate(i);

            let cName = 'single-number';
            if (
                week.firstDay &&
                new Date(week.firstDay).getTime() <= new Date(currentDate).getTime() &&
                week.lastDay &&
                new Date(currentDate).getTime() <= new Date(week.lastDay).getTime()
            ) {
                cName += ' selected-week';
                if (startOfDay(new Date(week.firstDay)).getTime() === startOfDay(new Date(currentDate)).getTime()) {
                    cName += ' selected-week-start';
                }
                if (endOfDay(new Date(currentDate)).getTime() === endOfDay(new Date(week.lastDay)).getTime()) {
                    cName += ' selected-week-end';
                }
            }
            if (startOfDay(currentDate).getTime() === startOfDay(new Date()).getTime()) {
                cName += ' current-date';
            }

            ar.push(
                <div id={`${i}`} key={i} className={cName} onClick={handleClick}>
                    {i}
                </div>
            );
        }

        const displayDate = new Date(date).setDate(1);
        let dayInTheWeek = new Date(displayDate).getDay();
        if (dayInTheWeek < 1) {
            dayInTheWeek = 7;
        }
        const prevMonth = [];
        let prevMonthDays = new Date(date).getMonth();
        if (prevMonthDays === 0) {
            prevMonthDays = 12;
        }
        for (let i = dayInTheWeek; i > 1; i--) {
            const previousMonth = new Date(date).setMonth(new Date(date).getMonth() - 1);
            const currentDate = new Date(previousMonth).setDate(days[prevMonthDays] - i + 2);
            let cName = 'single-number other-month';
            const currentTime = new Date(currentDate).getTime();
            const firstTime = week.firstDay && new Date(week.firstDay).getTime();
            const endTime = week.lastDay && new Date(week.lastDay).getTime();
            if (firstTime && currentTime >= firstTime && endTime && currentTime <= endTime) {
                cName += ' selected-week';
                if (firstTime === currentTime) {
                    cName += ' selected-week-start';
                }
            }

            prevMonth.push(
                <div onClick={handleClick} id={'prev-' + i} key={'prev-' + i} className={cName}>
                    {days[prevMonthDays] - i + 2}
                </div>
            );
        }

        const nextMonth = [];
        let fullDays = 35;
        if ([...prevMonth, ...ar].length > 35) {
            fullDays = 42;
        }

        for (let i = 1; i <= fullDays - [...prevMonth, ...ar].length; i++) {
            let cName = 'single-number other-month';
            const lastDay = week.lastDay && week.lastDay.getTime();
            const lastDayOfMonth = new Date(new Date(date).setDate(getDaysInMonth(date)));

            if (
                lastDay &&
                lastDayOfMonth.getTime() <= lastDay &&
                week.firstDay &&
                week.firstDay.getMonth() === lastDayOfMonth.getMonth()
            ) {
                cName += ' selected-week';
                if (i === fullDays - [...prevMonth, ...ar].length) {
                    cName += ' selected-week-end';
                }
            }

            nextMonth.push(
                <div onClick={handleClick} id={'next-' + i} key={'next-' + i} className={cName}>
                    {i}
                </div>
            );
        }
        const allDays: any[] = [...prevMonth, ...ar, ...nextMonth];
        const finalWeeks: any[] = [];
        for (let i = 0; i < allDays.length; i = i + 7) {
            finalWeeks.push(
                <div className="week" key={i}>
                    {allDays.slice(i, i + 7)}
                </div>
            );
        }
        return finalWeeks;
    };

    const handleDate = (next: any) => {
        let localDate = new Date(date);
        if (next) {
            localDate = addMonths(localDate, 1);
        } else {
            localDate = subMonths(localDate, 1);
        }
        setDate(new Date(localDate));
    };

    return (
        <div className="week-picker-options" id="week-selector">
            <div className="title-week">
                <IconButton icon={arrowLeft} className={'arrow-container'} onClick={() => handleDate(false)} />
                {`${months[date.getMonth()]} ${date.getFullYear()}`}
                <IconButton icon={arrowRight} className={'arrow-container'} onClick={() => handleDate(true)} />
            </div>
            <div className="rdrWeekDays">
                <span className="rdrWeekDay">Sun</span>
                <span className="rdrWeekDay">Mon</span>
                <span className="rdrWeekDay">Tue</span>
                <span className="rdrWeekDay">Wed</span>
                <span className="rdrWeekDay">Thu</span>
                <span className="rdrWeekDay">Fri</span>
                <span className="rdrWeekDay">Sat</span>
            </div>
            <div className="numbers-container">{renderDays()}</div>
        </div>
    );
};

export default WeekPicker;
