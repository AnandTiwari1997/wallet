import { Button, Select, SelectOption } from 'boxed-material-ui';
import React from 'react';

type FilterActionHeaderProp = {
    filters?: {
        label: string;
        options: SelectOption[];
        selectedOption: string;
        onSelectionChange: (event: SelectOption) => void;
        hidden?: boolean;
        loading?: boolean;
    }[];
    actions?: { name: string; onClick: (event: any) => void; hidden: boolean }[];
};

const FilterActionHeader = ({ filters, actions }: FilterActionHeaderProp) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                marginBottom: '10px',
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start'
                }}
            >
                {filters
                    ?.filter((filter) => !(filter.hidden ?? false))
                    .map((filter) => {
                        return (
                            <div
                                style={{
                                    margin: '0 5px',
                                    minWidth: '150px',
                                    display: 'block'
                                }}
                            >
                                <Select
                                    label={filter.label}
                                    selectedOption={filter.selectedOption}
                                    onSelectionChange={filter.onSelectionChange}
                                    options={filter.options}
                                    loading={filter.loading ?? false}
                                ></Select>
                            </div>
                        );
                    })}
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start'
                }}
            >
                {actions
                    ?.filter((action) => !action.hidden)
                    .map((action) => {
                        return (
                            <div
                                style={{
                                    display: 'block'
                                }}
                            >
                                <Button
                                    onClick={action.onClick}
                                    appearance={'filled'}
                                    color={'primary'}
                                    text={action.name}
                                    disabled={false}
                                ></Button>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default FilterActionHeader;
