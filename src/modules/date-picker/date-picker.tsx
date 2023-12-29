import './date-picker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { arrowLeft, arrowRight } from '../../icons/icons';
import { useState } from 'react';
import { addDays, addMonths, endOfMonth, endOfWeek, format, isAfter, isBefore, isSameDay, parse, startOfMonth, startOfWeek, subDays, subMonths } from 'date-fns/esm';

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

const _swap = (date1: any, date2: any) => {
    let temp = new Date(date1);
    date1 = new Date(date2);
    date2 = new Date(temp);
    return [date1, date2];
};

const _parse = (date: string): Date => {
    return parse(date, 'dd-MM-yyyy', new Date(), {
        weekStartsOn: 0
    });
};

const _format = (date: Date): string => {
    return format(date, 'dd-MM-yyyy', {
        weekStartsOn: 0
    });
};

const rangeToSelection = (dateRange: DateRange): string[] => {
    let startDate = addDays(dateRange.startDate, 1);
    let endDate = subDays(dateRange.endDate, 1);
    const newSoftSelectionRange = [];
    while (isBefore(startDate, endDate) || isSameDay(startDate, endDate)) {
        const formattedId: string = _format(startDate);
        newSoftSelectionRange.push(formattedId);
        startDate = addDays(startDate, 1);
    }
    return newSoftSelectionRange;
};

const DatePicker = ({ range, onSelectionChange, enableSelection = true }: { range: DateRange; onSelectionChange: (dateRange: DateRange) => any | void; enableSelection: boolean }) => {
    const [month, setMonth] = useState(range?.startDate ? range.startDate.getMonth() : new Date().getMonth());
    const [year, setYear] = useState(range?.startDate ? range.startDate.getFullYear() : new Date().getMonth());
    const [selectionInPreview, setSelectionInPreview] = useState(false);
    const [selection, setSelection] = useState<
        | {
              start: string;
              middle: string[];
              end: string;
              forward: boolean;
          }
        | undefined
    >({
        start: _format(range.startDate),
        middle: rangeToSelection(range),
        end: _format(range.endDate),
        forward: true
    });
    const [softSelection, setSoftSelection] = useState<
        | {
              start: string;
              middle: string[];
              end: string;
              forward: boolean | undefined;
          }
        | undefined
    >(undefined);

    const handleDate = (next: any) => {
        let localDate = new Date(year, month);
        if (next) {
            localDate = addMonths(localDate, 1);
        } else {
            localDate = subMonths(localDate, 1);
        }
        setMonth(localDate.getMonth());
        setYear(localDate.getFullYear());
    };

    /// Adding Class Names to Element
    const getClasses = (dateInProcess: Date, currentMonth: boolean): string => {
        const startOfWeekDate = startOfWeek(dateInProcess, { weekStartsOn: 0 });
        const endOfWeekDate = endOfWeek(dateInProcess, { weekStartsOn: 0 });
        const startOfMonthDate = startOfMonth(dateInProcess);
        const endOfMonthDate = endOfMonth(dateInProcess);
        const classNames: string[] = [];
        classNames.push('render-day');
        if (!currentMonth) {
            classNames.push('render-day-not-in-current-month');
        }
        if (isSameDay(dateInProcess, startOfWeekDate)) {
            classNames.push('render-day-start-of-week');
        }
        if (isSameDay(dateInProcess, endOfWeekDate)) {
            classNames.push('render-day-end-of-week');
        }
        if (isSameDay(dateInProcess, startOfMonthDate)) {
            classNames.push('render-day-start-of-month');
        }
        if (isSameDay(dateInProcess, endOfMonthDate)) {
            classNames.push('render-day-end-of-month');
        }
        if (isSameDay(dateInProcess, new Date())) {
            classNames.push('render-day-today');
        }
        return classNames.join(' ');
    };

    const doesRenderSelectionSpan = (elementId: string) => {
        return selection?.start === elementId || selection?.middle.includes(elementId) || selection?.end === elementId;
    };

    const doesRenderSoftSelectionSpan = (elementId: string) => {
        return softSelection?.start === elementId || softSelection?.middle.includes(elementId) || softSelection?.end === elementId;
    };

    const renderSelectionSpanClasses = (elementId: string): string => {
        const classNames: string[] = [];
        if (doesRenderSelectionSpan(elementId)) {
            if (selection?.start === elementId) {
                if (selection?.forward) classNames.push('render-day-selection-edge-start');
                else classNames.push('render-day-selection-edge-end');
            }
            if (selection?.end === elementId) {
                if (selection?.forward) classNames.push('render-day-selection-edge-end');
                else classNames.push('render-day-selection-edge-start');
            }
            if (selection?.middle.includes(elementId)) {
                classNames.push('render-day-selection-in-range');
            }
        }
        return classNames.join(' ');
    };

    const renderSoftSelectionSpanClasses = (elementId: string): string => {
        const classNames: string[] = [];
        if (doesRenderSoftSelectionSpan(elementId)) {
            if (softSelection?.start === elementId) {
                if (selectionInPreview) {
                    if (softSelection.forward) classNames.push('render-day-start-soft-selection');
                    else classNames.push('render-day-end-soft-selection');
                } else classNames.push('render-day-start-soft-selection');
            }
            if (softSelection?.end === elementId) {
                if (selectionInPreview) {
                    if (softSelection.forward) classNames.push('render-day-end-soft-selection');
                    else classNames.push('render-day-start-soft-selection');
                } else classNames.push('render-day-end-soft-selection');
            }
            if (softSelection?.middle.includes(elementId)) classNames.push('render-day-in-soft-selection');
        }
        return classNames.join(' ');
    };

    const renderSelectedDaySpanClasses = (elementId: string): string => {
        const classNames: string[] = [];
        classNames.push('render-day-number');
        if (doesRenderSelectionSpan(elementId)) classNames.push('render-day-selected');
        return classNames.join(' ');
    };

    const _handleOnMouseOver = (elementId: string) => {
        if (selectionInPreview) {
            if (!selection?.start) return;
            if (selection?.start === elementId) return;
            let inRangeStart = _parse(selection.start);
            let inRangeEnd = _parse(elementId);

            const forward = isBefore(inRangeStart, inRangeEnd);
            // selection has been started, now tracking for end
            if (forward === undefined) return;

            if (!forward) {
                [inRangeStart, inRangeEnd] = _swap(inRangeStart, inRangeEnd);
            }
            let startDate = addDays(inRangeStart, 1);
            let endDate = subDays(inRangeEnd, 1);
            const newSoftSelectionRange = [];
            while (isBefore(startDate, endDate) || isSameDay(startDate, endDate)) {
                const formattedId: string = _format(startDate);
                newSoftSelectionRange.push(formattedId);
                startDate = addDays(startDate, 1);
            }
            setSoftSelection({
                start: selection.start || '',
                middle: [...newSoftSelectionRange],
                end: elementId,
                forward: forward
            });
        } else {
            setSoftSelection({
                start: elementId,
                middle: [],
                end: elementId,
                forward: undefined
            });
        }
    };

    const _handleOnMouseLeave = () => {
        if (selectionInPreview) {
            if (softSelection?.forward === undefined) return;
            if (!selection?.start) return;
            setSoftSelection({
                start: selection.start,
                middle: [],
                end: selection.start,
                forward: undefined
            });
        } else {
            if (softSelection?.middle.length == 0) {
                setSoftSelection(undefined);
            }
        }
    };

    const _handleOnClick = (elementId: string) => {
        if (!enableSelection) {
            let start = _parse(elementId);
            setSelection({
                start: elementId,
                middle: [],
                end: elementId,
                forward: false
            });
            onSelectionChange({
                startDate: start,
                endDate: start
            });
            return;
        }
        if (selectionInPreview) {
            if (!selection?.start) return;
            setSelectionInPreview(false);
            let start = _parse(selection.start);
            let end = _parse(elementId);
            if (isAfter(start, end)) {
                [start, end] = _swap(start, end);
            }
            setSelection({
                start: selection.start,
                middle: [...(softSelection?.middle || [])],
                end: elementId,
                forward: softSelection?.forward || false
            });
            setSoftSelection(undefined);
            onSelectionChange({
                startDate: start,
                endDate: end
            });
        } else {
            setSelectionInPreview(true);
            setSelection({
                start: elementId,
                middle: [],
                end: elementId,
                forward: false
            });
            setSoftSelection({
                start: elementId || '',
                middle: [],
                end: elementId || '',
                forward: undefined
            });
        }
    };

    const renderDays = () => {
        let firstDayOfMonth = startOfMonth(new Date(year, month));

        const weekStart = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 });
        const isPreviousMonth = weekStart.getDate() !== 1;

        const previousMonthDates = [];
        if (isPreviousMonth) {
            let previousMonthDate: Date = weekStart;
            const endOfPreviousMonth = endOfMonth(previousMonthDate);

            while (isBefore(previousMonthDate, endOfPreviousMonth) || isSameDay(previousMonthDate, endOfPreviousMonth)) {
                const classNames = getClasses(previousMonthDate, false);
                const formattedId: string = _format(previousMonthDate);
                previousMonthDates.push(
                    <button key={formattedId} className={classNames}>
                        <span className="render-day-number">{previousMonthDate.getDate()}</span>
                    </button>
                );
                previousMonthDate = new Date(addDays(previousMonthDate, 1));
            }
        }

        let currentMonthDate: Date = firstDayOfMonth;
        const endOfCurrentMonth = endOfMonth(currentMonthDate);
        let currentMonthDates = [];
        while (isBefore(currentMonthDate, endOfCurrentMonth) || isSameDay(currentMonthDate, endOfCurrentMonth)) {
            const classNames = getClasses(currentMonthDate, true);
            const formattedId: string = _format(currentMonthDate);
            currentMonthDates.push(
                <button key={formattedId} className={classNames} onMouseOver={() => _handleOnMouseOver(formattedId)} onMouseLeave={_handleOnMouseLeave} onClick={() => _handleOnClick(formattedId)}>
                    {doesRenderSelectionSpan(formattedId) && <span className={renderSelectionSpanClasses(formattedId)}></span>}
                    {doesRenderSoftSelectionSpan(formattedId) && <span className={renderSoftSelectionSpanClasses(formattedId)}></span>}
                    <span className={renderSelectedDaySpanClasses(formattedId)}>{currentMonthDate.getDate()}</span>
                </button>
            );
            currentMonthDate = new Date(addDays(currentMonthDate, 1));
        }
        const weekEnd = endOfWeek(endOfCurrentMonth, { weekStartsOn: 0 });
        const isNextMonth = !isSameDay(weekEnd, endOfCurrentMonth);

        let nextMonthDates = [];
        if (isNextMonth) {
            let nextMonthDate: Date = addDays(endOfCurrentMonth, 1);
            const nextMonthDateEnd: Date = weekEnd;
            while (isBefore(nextMonthDate, nextMonthDateEnd) || isSameDay(nextMonthDate, nextMonthDateEnd)) {
                const classNames = getClasses(nextMonthDate, false);
                const formattedId: string = _format(nextMonthDate);
                nextMonthDates.push(
                    <div key={formattedId} className={classNames}>
                        <span className="render-day-number">{nextMonthDate.getDate()}</span>
                    </div>
                );
                nextMonthDate = new Date(addDays(nextMonthDate, 1));
            }
        }

        return [...previousMonthDates, ...currentMonthDates, ...nextMonthDates];
    };

    return (
        <div className="render-date-picker" id="date-picker">
            <div className="render-header">
                <i aria-hidden="true" className="calender-picker-icon icon arrow-container left" onClick={() => handleDate(false)}>
                    <FontAwesomeIcon icon={arrowLeft} />
                </i>
                <span className="render-header-month-year">
                    <span>
                        <select value={month} onChange={(evt) => setMonth(parseInt(evt.currentTarget.value))}>
                            <option value="0">January</option>
                            <option value="1">February</option>
                            <option value="2">March</option>
                            <option value="3">April</option>
                            <option value="4">May</option>
                            <option value="5">June</option>
                            <option value="6">July</option>
                            <option value="7">August</option>
                            <option value="8">September</option>
                            <option value="9">October</option>
                            <option value="10">November</option>
                            <option value="11">December</option>
                        </select>
                    </span>
                    <span></span>
                    <span>
                        <select value={year} onChange={(evt) => setYear(parseInt(evt.currentTarget.value))}>
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                            <option value="2022">2022</option>
                        </select>
                    </span>
                </span>
                <i aria-hidden="true" className="calender-picker-icon icon arrow-container" onClick={() => handleDate(true)}>
                    <FontAwesomeIcon icon={arrowRight} />
                </i>
            </div>
            <div className="render-weekdays">
                <span className="render-weekday">Sun</span>
                <span className="render-weekday">Mon</span>
                <span className="render-weekday">Tue</span>
                <span className="render-weekday">Wed</span>
                <span className="render-weekday">Thu</span>
                <span className="render-weekday">Fri</span>
                <span className="render-weekday">Sat</span>
            </div>
            <div className="render-month">{renderDays()}</div>
        </div>
    );
};

export default DatePicker;
