import './year-picker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { arrowLeft, arrowRight } from '../../icons/icons';
import React, { useState } from 'react';
import { addYears, startOfYear, subYears } from 'date-fns/esm';
import { OnCalenderPickerChange } from '../calender-picker/calender-picker';
import { endOfYear } from 'date-fns';

const YearPicker = ({ value, onChange }: { value: OnCalenderPickerChange | undefined; onChange: (change: OnCalenderPickerChange, picker: string) => void }) => {
    const parse = (value: any) => {
        if (!value) return undefined;
        const label = value.label;
        if (label === 'This Year') return new Date().getFullYear();
        return parseInt(label);
    };

    const getStartYear = (value: number | undefined) => {
        if (!value) return new Date().getFullYear() - 11;
        let loopThrough: boolean = true;
        let startYear = new Date().getFullYear() - 11;
        let endYear = new Date().getFullYear();
        do {
            if (value >= startYear && value <= endYear) {
                return startYear;
            }
            endYear = startYear - 1;
            startYear = endYear - 11;
            if (startYear < 0) loopThrough = false;
        } while (loopThrough);
        return undefined;
    };

    const getEndYear = (value: number | undefined) => {
        if (!value) return new Date().getFullYear();
        let loopThrough: boolean = true;
        let startYear = new Date().getFullYear() - 11;
        let endYear = new Date().getFullYear();
        do {
            if (value >= startYear && value <= endYear) {
                return endYear;
            }
            endYear = startYear - 1;
            startYear = endYear - 11;
            if (startYear < 0) loopThrough = false;
        } while (loopThrough);
        return undefined;
    };

    const [year, setYear] = useState(value ? value.rangeStart.getFullYear() : undefined);
    const [years, setYears] = useState({
        startYear: getStartYear(year),
        endYear: getEndYear(year)
    });

    const handleYears = (isNext: boolean) => {
        let localDate = new Date();
        if (isNext) {
            localDate.setFullYear(years.endYear!);
            localDate = addYears(localDate, 1);
        } else {
            localDate.setFullYear(years.startYear!);
            localDate = subYears(localDate, 12);
        }
        setYears({
            startYear: localDate.getFullYear(),
            endYear: localDate.getFullYear() + 11
        });
    };

    const handleClick = (e: React.MouseEvent) => {
        let date = new Date();
        date.setFullYear(parseInt(e.currentTarget.id));
        onChange(
            {
                rangeStart: startOfYear(date),
                rangeEnd: endOfYear(date),
                unit: 'year'
            },
            'year'
        );
        setYear(date.getFullYear());
    };

    const renderMonths = () => {
        let calculatedYears: any[] = [];
        for (let index = years.startYear; index! <= years.endYear!; index!++) {
            let className = 'single-year';
            if (index === new Date().getFullYear()) {
                className += ' current-year';
            }
            if (year === index) {
                className += ' selected-year';
            }
            calculatedYears.push(
                <div className={className} key={index} id={`${index}`} onClick={handleClick}>
                    {index}
                </div>
            );
        }
        return calculatedYears;
    };

    return (
        <div className="year-picker-container">
            <div className="year-picker-header">
                <i aria-hidden="true" className="calender-picker-icon icon arrow-container left" onClick={() => handleYears(false)}>
                    <FontAwesomeIcon icon={arrowLeft} />
                </i>
                {`${years.startYear}-${years.endYear}`}
                <i aria-hidden="true" className="calender-picker-icon icon arrow-container" onClick={() => handleYears(true)}>
                    <FontAwesomeIcon icon={arrowRight} />
                </i>
            </div>
            <div className="year-picker-body">{renderMonths()}</div>
        </div>
    );
};

export default YearPicker;
