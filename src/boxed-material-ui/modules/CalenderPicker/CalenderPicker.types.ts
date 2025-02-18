import { ExcludedComponentPropsWithoutRef } from 'boxed-material-ui/modules';
import { ComponentPropsWithRef } from 'react';

export interface OnCalenderPickerChange {
    rangeStart: Date;
    rangeEnd: Date;
    unit: string;
}

export interface PickerData {
    activePicker: string;
    values: { [key: string]: OnCalenderPickerChange | undefined };
}

export class CalenderPickerTab {
    static RANGE = { label: 'Range', value: 'range' };
    static WEEKS = { label: 'Weeks', value: 'week' };
    static MONTHS = { label: 'Months', value: 'month' };
    static YEARS = { label: 'Years', value: 'year' };
}

export type CalenderPickerRange = {
    from: Date;
    to: Date;
};

export type CalenderPickerHeaderProps = ExcludedComponentPropsWithoutRef<'div', 'className'>;
export type CalenderPickerBodyProps = ExcludedComponentPropsWithoutRef<'div', 'className'>;

export type CalenderPickerProps = {
    onChange?: (calenderPickerRange: OnCalenderPickerChange) => void;
    range?: CalenderPickerRange;
    childClasses?: {
        header: string;
        body: string;
    };
    childProps?: {
        header: CalenderPickerHeaderProps;
        body: CalenderPickerBodyProps;
    };
} & ComponentPropsWithRef<'div'>;
