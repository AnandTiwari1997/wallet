import CSS from 'csstype';
import React, { ChangeEvent, useState } from 'react';

import Button from '../../modules/button/button';
import CalenderPicker from '../../modules/calender-picker/calender-picker';
import Checkbox from '../../modules/checkbox/checkbox';
import Menu from '../../modules/menu/menu';
import MenuOption from '../../modules/menu/menu-option';
import Select from '../../modules/select/select';
import DateInput from '../../modules/date-input/date-input';
import { format } from 'date-fns';
import TextBox from '../../modules/text-box/text-box';

const iconStyle: CSS.Properties = {
    width: '1.5em',
    height: '1.5em',
    lineHeight: 'inherit',
    color: 'rgb(34, 52, 60)'
};

const ModuleTestPage = ({}) => {
    const [checked, setChecked] = React.useState(false);
    const [checkedCustom, setCheckedCustom] = React.useState(false);
    const [open, openMenu] = React.useState(false);
    const [transactionDate, setTransactionDate] = useState<string>(format(new Date(), 'dd-MM-yyyy'));
    return (
        <>
            <div
                style={{
                    margin: '5px 0',
                    width: '100px'
                }}
            >
                <Checkbox
                    checked={checkedCustom}
                    value="30-days"
                    customLabelStyles="input-checkbox-label"
                    customStyles="range-picker-option"
                    label="30 Days"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setCheckedCustom(!checkedCustom);
                    }}
                />
            </div>

            <div
                style={{
                    margin: '5px 0'
                }}
            >
                <CalenderPicker
                    onChange={(item) => {
                        console.log(item);
                    }}
                />
            </div>

            <div
                style={{
                    margin: '5px 5px',
                    width: '100px'
                }}
            >
                <Select
                    options={[
                        { value: 1, label: '1' },
                        { value: 2, label: '2' },
                        { value: 3, label: '3' }
                    ]}
                    selectedOption={1}
                    onSelectionChange={(selectedOption) => console.log(selectedOption)}
                />
            </div>

            <div
                style={{
                    margin: '5px 5px',
                    height: '40px'
                }}
            >
                <Button id={'menu'} onClick={(event) => openMenu(!open)}>
                    Open Menu
                </Button>
                <Menu open={open} menuFor={'menu'} onClose={() => openMenu(false)}>
                    <MenuOption
                        label={'Edit'}
                        onMenuOptionClick={(event) => {
                            console.log('Edit');
                        }}
                    />
                    <MenuOption
                        label={'Delete'}
                        onMenuOptionClick={(event) => {
                            console.log('Delete');
                        }}
                    />
                </Menu>
            </div>

            <div
                style={{
                    margin: '5px 5px',
                    height: '40px',
                    width: '100px'
                }}
            >
                <DateInput
                    value={transactionDate}
                    onChange={(event) => {
                        setTransactionDate(event.target.value);
                    }}
                />
            </div>

            <div
                style={{
                    margin: '5px 5px',
                    height: '40px',
                    width: '100px'
                }}
            >
                <TextBox
                    value={transactionDate}
                    onChange={(event) => {
                        setTransactionDate(event.target.value);
                    }}
                />
            </div>
        </>
    );
};

export default ModuleTestPage;
