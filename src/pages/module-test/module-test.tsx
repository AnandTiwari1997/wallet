import {
    accounts,
    bills,
    Button,
    CalenderPicker,
    Card,
    CardBody,
    CardHeader,
    edit,
    Icon,
    IconButton,
    InputField,
    Menu,
    MenuOption,
    OnCalenderPickerChange,
    plus,
    savings,
    Select,
    stocks,
    wallet
} from 'boxed-material-ui/modules';
import { format } from 'date-fns';
import { caretRight, close, menu } from 'icons/icons';
import { DateInput, Grid, Grids } from 'modules';
import React, { CSSProperties, useEffect, useRef, useState } from 'react';

const itemStyle: CSSProperties = {
    transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    borderRadius: '4px',
    boxShadow:
        '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)',
    backgroundColor: '#fff',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: '400',
    fontSize: '0.875rem',
    lineHeight: '1.43',
    letterSpacing: '0.01071em',
    padding: '8px',
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.6)'
};

const ModuleTestPage = ({}) => {
    const [pickerRange, setPickerRange] = React.useState<OnCalenderPickerChange>({
        rangeStart: new Date(),
        rangeEnd: new Date(),
        unit: 'Range'
    });
    const [open, openMenu] = React.useState(false);
    const [openIconButtonMenu, setOpenIconButtonMenu] = React.useState(false);
    const [open5, openMenu5] = React.useState(false);
    const [transactionDate, setTransactionDate] = useState<string>(format(new Date(), 'dd-MM-yyyy'));
    const [progress, setProgress] = React.useState(0);
    const [buffer, setBuffer] = React.useState(10);
    const [selectedTab, setSelectedTab] = React.useState('button');

    // Input State
    const [showPassword, setShowPassword] = useState(false);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress === 100) {
                    setBuffer(10);
                    return 0;
                }
                const diff = Math.random() * 10;
                return Math.min(oldProgress + diff, 100);
            });
            setBuffer((oldBuffer) => {
                const diff = Math.random() * 10;
                return Math.max(Math.min(oldBuffer + diff, 100), progress);
            });
        }, 500);

        return () => {
            clearInterval(timer);
        };
    }, [progress]);

    const menuButtonRef = useRef<HTMLButtonElement>(null);

    return (
        <div
            style={{
                height: '100%',
                width: '98%',
                margin: '0 1%',
                overflow: 'scroll'
            }}
        >
            <Grids spacing={1}>
                <Grid xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Card
                        style={{
                            maxWidth: `unset`,
                            width: '100%'
                        }}
                    >
                        <CardHeader
                            components={{
                                heading: `Buttons`
                            }}
                        ></CardHeader>
                        <CardBody>
                            <div
                                style={{
                                    display: `flex`,
                                    justifyContent: `space-between`,
                                    alignItems: `center`
                                }}
                            >
                                <Button
                                    color={'default'}
                                    size={'sm'}
                                    appearance={'filled'}
                                    onClick={() => {
                                        console.log('Default Filled Clicked');
                                    }}
                                >
                                    Default Filled
                                </Button>
                                <Button
                                    color={'primary'}
                                    size={'sm'}
                                    appearance={'filled'}
                                    onClick={() => {
                                        console.log('Primary Filled Clicked');
                                    }}
                                    clickEffect={'wave'}
                                >
                                    Primary Filled
                                </Button>
                                <Button
                                    color={'secondary'}
                                    size={'sm'}
                                    appearance={'filled'}
                                    onClick={() => {
                                        console.log('Secondary Filled Clicked');
                                    }}
                                >
                                    Secondary Filled
                                </Button>
                                <Button
                                    color={'tertiary'}
                                    size={'sm'}
                                    appearance={'filled'}
                                    onClick={() => {
                                        console.log('Tertiary Filled Clicked');
                                    }}
                                    clickEffect={'wave'}
                                >
                                    Tertiary Filled
                                </Button>
                                <Button
                                    color={'success'}
                                    size={'sm'}
                                    appearance={'filled'}
                                    onClick={() => {
                                        console.log('Success Filled Clicked');
                                    }}
                                >
                                    Success Filled
                                </Button>
                                <Button
                                    color={'error'}
                                    size={'sm'}
                                    appearance={'filled'}
                                    onClick={() => {
                                        console.log('Error Filled Clicked');
                                    }}
                                    clickEffect={'wave'}
                                >
                                    Error Filled
                                </Button>
                                <Button
                                    color={'warning'}
                                    size={'sm'}
                                    appearance={'filled'}
                                    onClick={() => {
                                        console.log('Warning Filled Clicked');
                                    }}
                                >
                                    Warning Filled
                                </Button>
                                <Button
                                    color={'info'}
                                    size={'sm'}
                                    appearance={'filled'}
                                    onClick={() => {
                                        console.log('Info Filled Clicked');
                                    }}
                                    clickEffect={'wave'}
                                >
                                    Info Filled
                                </Button>
                            </div>
                            <div
                                style={{
                                    marginTop: '20px',
                                    display: `flex`,
                                    justifyContent: `space-between`,
                                    alignItems: `center`
                                }}
                            >
                                <Button
                                    color={'default'}
                                    size={'sm'}
                                    appearance={'ghost'}
                                    onClick={() => {
                                        console.log('Default Ghost Clicked');
                                    }}
                                >
                                    Default Ghost
                                </Button>
                                <Button
                                    color={'primary'}
                                    size={'sm'}
                                    appearance={'ghost'}
                                    onClick={() => {
                                        console.log('Primary Ghost Clicked');
                                    }}
                                    clickEffect={'pulse'}
                                >
                                    Primary Ghost
                                </Button>
                                <Button
                                    color={'secondary'}
                                    size={'sm'}
                                    appearance={'ghost'}
                                    onClick={() => {
                                        console.log('Secondary Ghost Clicked');
                                    }}
                                >
                                    Secondary Ghost
                                </Button>
                                <Button
                                    color={'tertiary'}
                                    size={'sm'}
                                    appearance={'ghost'}
                                    onClick={() => {
                                        console.log('Tertiary Ghost Clicked');
                                    }}
                                    clickEffect={'pulse'}
                                >
                                    Tertiary Ghost
                                </Button>
                                <Button
                                    color={'success'}
                                    size={'sm'}
                                    appearance={'ghost'}
                                    onClick={() => {
                                        console.log('Success Ghost Clicked');
                                    }}
                                >
                                    Success Ghost
                                </Button>
                                <Button
                                    color={'error'}
                                    size={'sm'}
                                    appearance={'ghost'}
                                    onClick={() => {
                                        console.log('Error Ghost Clicked');
                                    }}
                                    clickEffect={'pulse'}
                                >
                                    Error Ghost
                                </Button>
                                <Button
                                    color={'warning'}
                                    size={'sm'}
                                    appearance={'ghost'}
                                    onClick={() => {
                                        console.log('Warning Ghost Clicked');
                                    }}
                                >
                                    Warning Ghost
                                </Button>
                                <Button
                                    color={'info'}
                                    size={'sm'}
                                    appearance={'ghost'}
                                    onClick={() => {
                                        console.log('Info Ghost Clicked');
                                    }}
                                    clickEffect={'pulse'}
                                >
                                    Info Ghost
                                </Button>
                            </div>
                            <div
                                style={{
                                    marginTop: '20px',
                                    display: `flex`,
                                    justifyContent: `space-between`,
                                    alignItems: `center`
                                }}
                            >
                                <Button color={'default'} size={'sm'} appearance={'ghost'} disabled>
                                    Default Disabled
                                </Button>
                                <Button color={'primary'} size={'sm'} appearance={'filled'} disabled>
                                    Primary Disabled
                                </Button>
                                <Button color={'secondary'} size={'sm'} appearance={'filled'} disabled>
                                    Secondary Disabled
                                </Button>
                                <Button color={'tertiary'} size={'sm'} appearance={'ghost'} disabled>
                                    Tertiary Disabled
                                </Button>
                                <Button color={'success'} size={'sm'} appearance={'ghost'} disabled>
                                    Success Disabled
                                </Button>
                                <Button color={'error'} size={'sm'} appearance={'ghost'} disabled>
                                    Error Disabled
                                </Button>
                                <Button color={'warning'} size={'sm'} appearance={'filled'} disabled>
                                    Warning Disabled
                                </Button>
                                <Button color={'info'} size={'sm'} appearance={'ghost'} disabled>
                                    Info Disabled
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </Grid>
                <Grid xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Card
                        style={{
                            maxWidth: `unset`,
                            width: '100%'
                        }}
                    >
                        <CardHeader
                            components={{
                                heading: `Buttons`
                            }}
                        ></CardHeader>
                        <CardBody>
                            <div
                                style={{
                                    display: `flex`,
                                    justifyContent: `space-between`,
                                    alignItems: `center`
                                }}
                            >
                                <IconButton
                                    iconProps={{
                                        icon: close
                                    }}
                                    color={'default'}
                                    clickEffect={'wave'}
                                    size={'md'}
                                    appearance={'filled'}
                                    onClick={() => {
                                        console.log('Default Filled Clicked');
                                    }}
                                >
                                    Default Filled
                                </IconButton>
                                <IconButton
                                    iconProps={{
                                        icon: edit
                                    }}
                                    color={'primary'}
                                    clickEffect={'pulse'}
                                    size={'md'}
                                    appearance={'filled'}
                                    onClick={() => {
                                        console.log('Default Filled Clicked');
                                    }}
                                >
                                    Default Filled
                                </IconButton>
                                <IconButton
                                    iconProps={{
                                        icon: plus
                                    }}
                                    color={'secondary'}
                                    clickEffect={'wave'}
                                    size={'md'}
                                    appearance={'filled'}
                                    onClick={() => {
                                        console.log('Default Filled Clicked');
                                    }}
                                >
                                    Default Filled
                                </IconButton>
                                <IconButton
                                    iconProps={{
                                        icon: accounts
                                    }}
                                    color={'tertiary'}
                                    clickEffect={'pulse'}
                                    size={'md'}
                                    appearance={'filled'}
                                    onClick={() => {
                                        console.log('Default Filled Clicked');
                                    }}
                                >
                                    Default Filled
                                </IconButton>
                                <IconButton
                                    iconProps={{
                                        icon: bills
                                    }}
                                    color={'success'}
                                    clickEffect={'wave'}
                                    size={'md'}
                                    appearance={'filled'}
                                    onClick={() => {
                                        console.log('Default Filled Clicked');
                                    }}
                                >
                                    Default Filled
                                </IconButton>
                                <IconButton
                                    iconProps={{
                                        icon: stocks
                                    }}
                                    color={'error'}
                                    clickEffect={'pulse'}
                                    size={'md'}
                                    appearance={'filled'}
                                    onClick={() => {
                                        console.log('Default Filled Clicked');
                                    }}
                                >
                                    Default Filled
                                </IconButton>
                                <IconButton
                                    iconProps={{
                                        icon: wallet
                                    }}
                                    color={'warning'}
                                    clickEffect={'wave'}
                                    size={'md'}
                                    appearance={'filled'}
                                    onClick={() => {
                                        console.log('Default Filled Clicked');
                                    }}
                                >
                                    Default Filled
                                </IconButton>
                                <IconButton
                                    iconProps={{
                                        icon: savings
                                    }}
                                    color={'info'}
                                    clickEffect={'pulse'}
                                    size={'md'}
                                    appearance={'filled'}
                                    onClick={() => {
                                        console.log('Default Filled Clicked');
                                    }}
                                >
                                    Default Filled
                                </IconButton>
                            </div>
                            <div
                                style={{
                                    marginTop: `20px`,
                                    display: `flex`,
                                    justifyContent: `space-between`,
                                    alignItems: `center`
                                }}
                            >
                                <IconButton
                                    iconProps={{
                                        icon: close
                                    }}
                                    color={'default'}
                                    clickEffect={'wave'}
                                    size={'md'}
                                    appearance={'ghost'}
                                    onClick={() => {
                                        console.log('Default Filled Clicked');
                                    }}
                                >
                                    Default Filled
                                </IconButton>
                                <IconButton
                                    iconProps={{
                                        icon: edit
                                    }}
                                    color={'primary'}
                                    clickEffect={'pulse'}
                                    size={'md'}
                                    appearance={'ghost'}
                                    onClick={() => {
                                        console.log('Default Filled Clicked');
                                    }}
                                >
                                    Default Filled
                                </IconButton>
                                <IconButton
                                    iconProps={{
                                        icon: plus
                                    }}
                                    color={'secondary'}
                                    clickEffect={'wave'}
                                    size={'md'}
                                    appearance={'ghost'}
                                    onClick={() => {
                                        console.log('Default Filled Clicked');
                                    }}
                                >
                                    Default Filled
                                </IconButton>
                                <IconButton
                                    iconProps={{
                                        icon: accounts
                                    }}
                                    color={'tertiary'}
                                    clickEffect={'pulse'}
                                    size={'md'}
                                    appearance={'ghost'}
                                    onClick={() => {
                                        console.log('Default Filled Clicked');
                                    }}
                                >
                                    Default Filled
                                </IconButton>
                                <IconButton
                                    iconProps={{
                                        icon: bills
                                    }}
                                    color={'success'}
                                    clickEffect={'wave'}
                                    size={'md'}
                                    appearance={'ghost'}
                                    onClick={() => {
                                        console.log('Default Filled Clicked');
                                    }}
                                >
                                    Default Filled
                                </IconButton>
                                <IconButton
                                    iconProps={{
                                        icon: stocks
                                    }}
                                    color={'error'}
                                    clickEffect={'pulse'}
                                    size={'md'}
                                    appearance={'ghost'}
                                    onClick={() => {
                                        console.log('Default Filled Clicked');
                                    }}
                                >
                                    Default Filled
                                </IconButton>
                                <IconButton
                                    iconProps={{
                                        icon: wallet
                                    }}
                                    color={'warning'}
                                    clickEffect={'wave'}
                                    size={'md'}
                                    appearance={'ghost'}
                                    onClick={() => {
                                        console.log('Default Filled Clicked');
                                    }}
                                >
                                    Default Filled
                                </IconButton>
                                <IconButton
                                    iconProps={{
                                        icon: savings
                                    }}
                                    color={'info'}
                                    clickEffect={'pulse'}
                                    size={'md'}
                                    appearance={'ghost'}
                                    onClick={() => {
                                        console.log('Default Filled Clicked');
                                    }}
                                >
                                    Default Filled
                                </IconButton>
                            </div>
                        </CardBody>
                    </Card>
                </Grid>
                <Grid xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Card
                        style={{
                            maxWidth: `unset`,
                            width: '100%'
                        }}
                    >
                        <CardHeader
                            components={{
                                heading: `Inputs`
                            }}
                        ></CardHeader>
                        <CardBody>
                            <div
                                style={{
                                    display: `flex`,
                                    justifyContent: `space-between`,
                                    alignItems: `center`
                                }}
                            >
                                <InputField
                                    appearance={'outlined'}
                                    type={'text'}
                                    label={'All'}
                                    color={'primary'}
                                    placeholder={'Enter Text'}
                                    showHint={true}
                                    hint={'Should contain @'}
                                />
                                <InputField
                                    type={'text'}
                                    label={'All'}
                                    color={'primary'}
                                    placeholder={'Enter Text'}
                                    showHint={true}
                                    hint={'Should contain @'}
                                    suffixes={[
                                        <IconButton
                                            appearance={'ghost'}
                                            color={'default'}
                                            clickEffect={'wave'}
                                            size={'sm'}
                                            iconProps={{
                                                icon: close
                                            }}
                                        ></IconButton>
                                    ]}
                                    prefixes={[<Icon icon={caretRight}></Icon>]}
                                />
                                <InputField
                                    type={'text'}
                                    label={'Start Icon'}
                                    color={'secondary'}
                                    placeholder={'Enter Text'}
                                    showHint={true}
                                    hint={'Should contain @'}
                                    prefixes={[<Icon icon={caretRight}></Icon>]}
                                />
                                <InputField
                                    type={'text'}
                                    label={'End Icon'}
                                    placeholder={'Enter Text'}
                                    showHint={true}
                                    hint={'Should contain @'}
                                    suffixes={[
                                        <IconButton
                                            appearance={'ghost'}
                                            color={'default'}
                                            clickEffect={'wave'}
                                            size={'sm'}
                                            iconProps={{
                                                icon: close
                                            }}
                                        ></IconButton>
                                    ]}
                                />
                                <InputField
                                    type={'text'}
                                    label={'Disabled'}
                                    placeholder={'Enter Text'}
                                    showHint={true}
                                    hint={'Should contain @'}
                                    prefixes={[<Icon icon={caretRight}></Icon>]}
                                    suffixes={[
                                        <IconButton
                                            appearance={'ghost'}
                                            color={'default'}
                                            clickEffect={'wave'}
                                            size={'sm'}
                                            iconProps={{
                                                icon: close
                                            }}
                                        ></IconButton>
                                    ]}
                                    disabled
                                />
                            </div>
                            <div
                                style={{
                                    marginTop: '20px',
                                    display: `flex`,
                                    justifyContent: `space-between`,
                                    alignItems: `center`
                                }}
                            >
                                <InputField
                                    appearance={'ghost'}
                                    type={'text'}
                                    label={'All'}
                                    color={'primary'}
                                    placeholder={'Enter Text'}
                                    showHint={true}
                                    hint={'Should contain @'}
                                />
                                <InputField
                                    appearance={'ghost'}
                                    type={'text'}
                                    label={'All'}
                                    color={'primary'}
                                    placeholder={'Enter Text'}
                                    showHint={true}
                                    hint={'Should contain @'}
                                    suffixes={[
                                        <IconButton
                                            appearance={'ghost'}
                                            color={'default'}
                                            clickEffect={'wave'}
                                            size={'sm'}
                                            iconProps={{
                                                icon: close
                                            }}
                                        ></IconButton>
                                    ]}
                                    prefixes={[<Icon icon={caretRight}></Icon>, <>Mr.</>]}
                                />
                                <InputField
                                    appearance={'ghost'}
                                    type={'text'}
                                    label={'Start Icon'}
                                    color={'secondary'}
                                    placeholder={'Enter Text'}
                                    showHint={true}
                                    hint={'Should contain @'}
                                    prefixes={[<Icon icon={caretRight}></Icon>, <>Mr.</>]}
                                />
                                <InputField
                                    appearance={'ghost'}
                                    showLabel={false}
                                    type={'text'}
                                    label={'End Icon'}
                                    placeholder={'Enter Text'}
                                    showHint={true}
                                    hint={'Should contain @'}
                                    suffixes={[
                                        <IconButton
                                            appearance={'filled'}
                                            color={'default'}
                                            clickEffect={'wave'}
                                            size={'sm'}
                                            iconProps={{
                                                icon: close
                                            }}
                                        ></IconButton>
                                    ]}
                                />
                                <InputField
                                    appearance={'ghost'}
                                    type={'text'}
                                    label={'Disabled'}
                                    placeholder={'Enter Text'}
                                    showHint={true}
                                    hint={'Should contain @'}
                                    prefixes={[<Icon icon={caretRight}></Icon>, <>Mr.</>]}
                                    suffixes={[
                                        <IconButton
                                            appearance={'ghost'}
                                            color={'default'}
                                            clickEffect={'wave'}
                                            size={'sm'}
                                            iconProps={{
                                                icon: close
                                            }}
                                        ></IconButton>
                                    ]}
                                    disabled
                                />
                            </div>
                        </CardBody>
                    </Card>
                </Grid>
                <Grid xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Card
                        style={{
                            maxWidth: `unset`,
                            width: '100%'
                        }}
                    >
                        <CardHeader
                            components={{
                                heading: `Dropdowns`
                            }}
                        ></CardHeader>
                        <CardBody>
                            <div
                                style={{
                                    display: `flex`,
                                    justifyContent: `space-between`,
                                    alignItems: `center`
                                }}
                            >
                                <Select
                                    label={'Select One'}
                                    onSelectionChange={(selectedOption) => {
                                        console.log(selectedOption);
                                    }}
                                    options={[
                                        { value: 'ALL', label: 'All' },
                                        { value: 'ANY', label: 'Any' },
                                        { value: 'NONE', label: 'None' }
                                    ]}
                                    selectedOption={'ALL'}
                                />
                                <Select
                                    showLabel={false}
                                    onSelectionChange={(selectedOption) => {
                                        console.log(selectedOption);
                                    }}
                                    options={[
                                        { value: 'ALL', label: 'All' },
                                        { value: 'ANY', label: 'Any' },
                                        { value: 'NONE', label: 'None' }
                                    ]}
                                    selectedOption={'ALL'}
                                />
                                <Select
                                    showLabel={false}
                                    placeholder={'-- Select One --'}
                                    onSelectionChange={(selectedOption) => {
                                        console.log(selectedOption);
                                    }}
                                    options={[
                                        { value: 'ALL', label: 'All' },
                                        { value: 'ANY', label: 'Any' },
                                        { value: 'NONE', label: 'None' }
                                    ]}
                                    // selectedOption={'ALL'}
                                />
                            </div>
                        </CardBody>
                    </Card>
                </Grid>
                <Grid xs={12} sm={12} md={12} lg={12} xl={12}>
                    <div style={itemStyle}>
                        <CalenderPicker onChange={(item) => setPickerRange(item)} />
                        <p>{pickerRange.unit}</p>
                        <p>{pickerRange.rangeStart.toISOString()}</p>
                        <p>{pickerRange.rangeEnd.toISOString()}</p>
                    </div>
                </Grid>
                <Grid xs={12} sm={12} md={12} lg={12} xl={12}>
                    <div style={itemStyle}>
                        <Button
                            id={'menu'}
                            ref={menuButtonRef}
                            appearance={'ghost'}
                            onClick={(event) => {
                                openMenu(true);
                            }}
                            size={'xs'}
                        >
                            Open Menu
                        </Button>
                        <Menu open={open} menuFor={'menu'} onClose={() => openMenu(false)}>
                            <MenuOption label={'Edit 1'} onMenuOptionClick={(event) => {}} />
                            <MenuOption label={'Edit 2'} onMenuOptionClick={(event) => {}} />
                            <MenuOption label={'Edit 3'} onMenuOptionClick={(event) => {}} />
                            <MenuOption label={'Edit 4'} onMenuOptionClick={(event) => {}} />
                            <MenuOption label={'Edit 5'} onMenuOptionClick={(event) => {}} />
                            <MenuOption label={'Edit 6'} onMenuOptionClick={(event) => {}} />
                            <MenuOption label={'Edit 7'} onMenuOptionClick={(event) => {}} />
                            <MenuOption label={'Edit 8'} onMenuOptionClick={(event) => {}} />
                        </Menu>
                    </div>
                </Grid>
                <Grid xs={12} sm={12} md={12} lg={12} xl={12}>
                    <div style={itemStyle}>
                        {/*<IconButton*/}
                        {/*    id={`icon-button-menu`}*/}
                        {/*    icon={menu}*/}
                        {/*    onClick={(event) => {*/}
                        {/*        setOpenIconButtonMenu(true);*/}
                        {/*    }}*/}
                        {/*/>*/}
                        <Menu
                            open={openIconButtonMenu}
                            menuFor={'Icon-button-menu'}
                            onClose={() => setOpenIconButtonMenu(false)}
                        >
                            <MenuOption label={'Edit'} onMenuOptionClick={(event) => {}} />
                            <MenuOption label={'Delete'} onMenuOptionClick={(event) => {}} />
                        </Menu>
                    </div>
                </Grid>
                <Grid xs={12} sm={12} md={12} lg={12} xl={12}>
                    <div style={itemStyle}>
                        <DateInput
                            value={transactionDate}
                            onChange={(event) => {
                                setTransactionDate(event.target.value);
                            }}
                        />
                    </div>
                </Grid>
            </Grids>
        </div>
    );
};

export default ModuleTestPage;
