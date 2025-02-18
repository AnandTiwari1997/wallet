import 'pages/savings/savings.css';
import { syncInvestmentAccount, syncInvestmentAccountCaptcha } from 'backend/BackendApi';
import { Button, InputField } from 'boxed-material-ui/modules';
import CSS from 'csstype';
import { refresh } from 'icons/icons';
import { Dialog, Icon, Tab, Tabs } from 'modules';
import MutualFund from 'pages/savings/mutual-fund';
import ProvidentFund from 'pages/savings/provident-fund';
import { Fragment, useRef, useState } from 'react';

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
    const [openOTP, setOpenOTP] = useState(false);
    const [otpId, setOtpId] = useState<string | undefined>(undefined);
    const [otpMessage, setOtpMessage] = useState<string | undefined>(undefined);
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

    const handleRefresh = () => {
        const eventSource: EventSource = syncInvestmentAccount(selectedTab);
        eventSource.onmessage = (ev: MessageEvent) => {
            const jsonData = JSON.parse(ev.data);
            if (selectedTab === SavingsTab.MUTUAL_FUND.value) {
                eventSource.close();
            }
            if (jsonData.type === 'ping') {
                return;
            }
            if (jsonData.type === 'captcha') {
                setCaptchaUrl(jsonData.imageUrl);
                setCaptchaId(jsonData.captchaID);
                setOpenCaptcha(true);
            }
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
                    text: inputRef.current?.value
                }
            }).then((r) => {
                setOtpMessage('Please enter OTP sent to your registered number.');
                setOtpId(captchaId);
                setOpenOTP(true);
            });
        }
    };

    const handleOTP = () => {
        setOpenOTP(false);
        setOtpMessage(undefined);
        if (inputRef.current?.value && otpId) {
            syncInvestmentAccountCaptcha(selectedTab, {
                data: {
                    id: otpId,
                    text: inputRef.current?.value
                }
            }).then((r) => {});
        }
    };

    return (
        <div style={topDiv}>
            <div className="savings-body">
                <Fragment>
                    <div style={{ background: 'white', height: '100%' }}>
                        <button className="icon-button tab-refresh-icon" onClick={handleRefresh}>
                            <i className="icon">
                                <Icon
                                    icon={refresh}
                                    svgProps={{
                                        height: '16px',
                                        width: '16px'
                                    }}
                                />
                            </i>
                        </button>
                        <Tabs
                            selectedTab={selectedTab}
                            onTabChange={(selectedTab) => setSelectedTab(selectedTab.tabValue)}
                        >
                            <Tab
                                label={SavingsTab.MUTUAL_FUND.label}
                                value={SavingsTab.MUTUAL_FUND.value}
                                classes={'tab--width'}
                            >
                                <MutualFund />
                            </Tab>
                            <Tab
                                label={SavingsTab.PROVIDENT_FUND.label}
                                value={SavingsTab.PROVIDENT_FUND.value}
                                classes={'tab--width'}
                            >
                                <ProvidentFund />
                            </Tab>
                        </Tabs>
                    </div>
                    <Dialog open={openCaptcha} hideAction>
                        <img src={captchaUrl} alt="" className="captcha-dialog-image" />
                        <InputField
                            className="captcha-dialog-input"
                            ref={inputRef}
                            showLabel={false}
                            placeholder={'Enter Captcha'}
                        />
                        <div className="captcha-dialog-action">
                            <Button onClick={handleCaptcha}>Submit</Button>
                        </div>
                    </Dialog>
                    <Dialog open={openOTP} hideAction>
                        <p>{otpMessage}</p>
                        <InputField
                            className="captcha-dialog-input"
                            ref={inputRef}
                            showLabel={false}
                            placeholder={'Enter OTP'}
                        />
                        <div className="captcha-dialog-action">
                            <Button onClick={handleOTP}>Submit</Button>
                        </div>
                    </Dialog>
                </Fragment>
            </div>
        </div>
    );
};

export default SavingsPage;
