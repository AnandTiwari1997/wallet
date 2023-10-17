import CSS from 'csstype';
import { Button, Dialog } from '@mui/material';
import { Fragment, useRef, useState } from 'react';
import './savings.css';
import MutualFund from './mutual-fund';
import ProvidentFund from './provident-fund';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { refresh } from '../../icons/icons';
import { syncInvestmentAccount, syncInvestmentAccountCaptcha } from '../../modules/backend/BackendApi';
import Tabs from '../../modules/tabs/tabs';
import Tab from '../../modules/tabs/tab';

const topDiv: CSS.Properties = {
    display: 'flex',
    // flexDirection: 'column',
    height: '100%'
};

export const collapsedStyle: CSS.Properties = {
    height: '0',
    visibility: 'hidden'
};

export const expandedStyle: CSS.Properties = {
    height: 'auto',
    visibility: 'visible'
};

export const expenseStyle: CSS.Properties = {
    color: '#e75757'
    // border: "1px solid #ff7f7f",
};

export const incomeStyle: CSS.Properties = {
    color: '#2e7d32'
    //   border: "1px solid #7fff7f",
};

export const intermediateExpandStyle: CSS.Properties = {
    transform: 'rotate(-90deg)',
    transition: 'transform 150ms ease 0s'
};

export const collapseAllStyle: CSS.Properties = {
    transform: 'rotate(-180deg)',
    transition: 'transform 150ms ease 0s'
};

export const collapseStyle: CSS.Properties = {
    transform: 'rotate(-180deg)',
    transition: 'transform 150ms ease 0s'
};

export const expandStyle: CSS.Properties = {
    transform: 'rotate(0deg)',
    transition: 'transform 150ms ease 0s'
};

class SavingsTab {
    static MUTUAL_FUND = {
        label: 'Mutual Fund',
        value: 'mutual_fund'
    };
    static PROVIDENT_FUND = {
        label: 'Provident Fund',
        value: 'provident_fund'
    };
}

const SavingsPage = () => {
    const [selectedTab, setSelectedTab] = useState<string>(SavingsTab.MUTUAL_FUND.value);
    const [openCaptcha, setOpenCaptcha] = useState(false);
    const [captchaUrl, setCaptchaUrl] = useState<string | undefined>(undefined);
    const [captchaId, setCaptchaId] = useState<string | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const switchTabs = (e: any, tab: string) => {
        setSelectedTab(tab);
    };

    const tabs: { label: string; value: string }[] = [
        {
            label: SavingsTab.MUTUAL_FUND.label,
            value: SavingsTab.MUTUAL_FUND.value
        },
        {
            label: SavingsTab.PROVIDENT_FUND.label,
            value: SavingsTab.PROVIDENT_FUND.value
        }
    ];

    // const renderTabs = () => {
    //     return tabs.map((tab, index) => {
    //         let rootClasses: string = 'savings-tab-root';
    //         if (index !== tabs.length - 1) rootClasses += ' tab-root-after';
    //         return (
    //             <Tab
    //                 key={index}
    //                 label={tab.label}
    //                 value={tab.value}
    //                 classes={{
    //                     root: rootClasses,
    //                     selected: 'tab-selected'
    //                 }}
    //             />
    //         );
    //     });
    // };

    const renderTabContent = () => {
        switch (selectedTab) {
            case SavingsTab.MUTUAL_FUND.value:
                return <MutualFund />;
            case SavingsTab.PROVIDENT_FUND.value:
                return <ProvidentFund />;
        }
    };

    const handleRefresh = () => {
        const eventSource: EventSource = syncInvestmentAccount(selectedTab);
        eventSource.onmessage = (ev: MessageEvent) => {
            const jsonData = JSON.parse(ev.data);
            if (selectedTab === SavingsTab.MUTUAL_FUND.value) eventSource.close();
            if (jsonData['type'] === 'ping') return;
            setCaptchaUrl(jsonData['imageUrl']);
            setCaptchaId(jsonData['captchaID']);
            setOpenCaptcha(true);
            eventSource.close();
        };
    };

    const handleCaptcha = () => {
        setOpenCaptcha(false);
        setCaptchaUrl(undefined);
        console.log(inputRef.current?.value);
        if (inputRef.current?.value && captchaId) {
            syncInvestmentAccountCaptcha(selectedTab, {
                data: {
                    id: captchaId,
                    captcha: inputRef.current?.value
                }
            }).then((r) => console.log(r));
        }
    };

    return (
        <div style={topDiv}>
            <div className="savings-body">
                <Fragment>
                    <div style={{ background: 'white', height: '100%' }}>
                        <button className="icon-button tab-refresh-icon" onClick={handleRefresh}>
                            <i className="icon">
                                <FontAwesomeIcon icon={refresh} />
                            </i>
                        </button>
                        <Tabs selectedTab={selectedTab} onTabChange={(selectedTab) => setSelectedTab(selectedTab.tabValue)}>
                            <Tab label={SavingsTab.MUTUAL_FUND.label} value={SavingsTab.MUTUAL_FUND.value} classes={'tab--width'}>
                                <MutualFund />
                            </Tab>
                            <Tab label={SavingsTab.PROVIDENT_FUND.label} value={SavingsTab.PROVIDENT_FUND.value} classes={'tab--width'}>
                                <ProvidentFund />
                            </Tab>
                        </Tabs>
                    </div>
                    {/*<Tabs*/}
                    {/*    onChange={switchTabs}*/}
                    {/*    value={selectedTab}*/}
                    {/*    classes={{*/}
                    {/*        scroller: 'tab-scroller',*/}
                    {/*        root: 'savings-tabs-root',*/}
                    {/*        indicator: 'tab-indicator',*/}
                    {/*        flexContainer: 'savings-tabs-flex-container'*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    {renderTabs()}*/}
                    {/*</Tabs>*/}
                    {/*<div className="savings-tab-content">{renderTabContent()}</div>*/}
                    <Dialog open={openCaptcha} classes={{ paper: 'captcha-dialog' }}>
                        <img src={captchaUrl} alt="" className="captcha-dialog-image" />
                        <input className="captcha-dialog-input" ref={inputRef} />
                        <div className="captcha-dialog-action" onClick={handleCaptcha}>
                            <Button>Submit</Button>
                        </div>
                    </Dialog>
                </Fragment>
            </div>
        </div>
    );
};

export default SavingsPage;
