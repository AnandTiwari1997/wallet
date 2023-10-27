import CSS from 'csstype';
import './dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Account } from '../../data/models';
import { edit, indianRupee, plus } from '../../icons/icons';
import CalenderPicker from '../../modules/calender-picker/calender-picker';
import { useEffect, useState } from 'react';
import { getAccounts } from '../../modules/backend/BackendApi';
import { useGlobalLoadingState } from '../../index';
import Dialog from '../../modules/dialog/dialog';
import AddAccount from '../account/add-account';

const accountTopDivStyle: CSS.Properties = {
    display: 'flex',
    flexDirection: 'row',
    height: '19%',
    margin: '1%',
    background: 'rgb(255, 255, 255)',
    boxShadow: 'rgba(255, 255, 255, 0.45) -3px -3px 7px, rgba(128, 135, 148, 0.56) 2px 2px 5px'
};

const cardWrapperStyle: CSS.Properties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%'
};

const addAccountCardStyle: CSS.Properties = {
    display: 'flex',
    flexDirection: 'row',
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center'
};

const scrollableDiv: CSS.Properties = {
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'scroll',
    width: '85%',
    alignItems: 'center'
};

const topDiv: CSS.Properties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
};

const DashboardPage = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [state, dispatch] = useGlobalLoadingState();
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | undefined>(undefined);

    useEffect(() => {
        getAccounts(dispatch).then((response) => {
            setAccounts(response.results);
        });
    }, [setAccounts, getAccounts]);

    const accountCards = accounts.map((account) => {
        const backgroundColor: CSS.Properties = {
            backgroundColor: `${typeof account.bank === 'object' ? account.bank.primary_color : '#e5e9ed'}`,
            color: `${typeof account.bank === 'object' && account.bank.primary_color ? 'rgb(255, 255, 255)' : 'black'}`,
            display: 'flex',
            alignItems: 'center'
        };
        return (
            <div key={account.account_id} className="account-card" style={backgroundColor}>
                <i
                    aria-hidden="true"
                    className="pencil alternate icon"
                    onClick={() => {
                        setShowAddAccount(true);
                        setSelectedAccount(account);
                    }}
                >
                    <FontAwesomeIcon aria-hidden="true" className="icon pencil" icon={edit} />
                </i>

                <div className="account-icon-container">{account.bank && <i className="account-icon" dangerouslySetInnerHTML={{ __html: account.bank.icon }}></i>}</div>
                <div className="account-details-container">
                    <div className="account-name">
                        <span>
                            <span>{account.account_name}</span>
                        </span>
                    </div>
                    <div className="account-balance">
                        <span className="">
                            <i className="icon custom-font-size">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {account.account_balance.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        );
    });

    return (
        <div style={topDiv}>
            <div style={accountTopDivStyle}>
                <div style={addAccountCardStyle}>
                    <button
                        className="add-account-button"
                        onClick={() => {
                            setShowAddAccount(true);
                            setSelectedAccount(undefined);
                        }}
                    >
                        <i className="icon">
                            <FontAwesomeIcon icon={plus} />
                        </i>
                        <span>Add Account</span>
                    </button>
                </div>
                <div style={scrollableDiv}>
                    <div style={cardWrapperStyle}>{accountCards}</div>
                </div>
            </div>
            <div className="_1G4RrpLL512uJptsH35-hS">
                <CalenderPicker onChange={(item) => console.log(item)} />
            </div>
            <Dialog
                open={showAddAccount}
                onClose={() => {
                    setShowAddAccount(false);
                    setSelectedAccount(undefined);
                }}
                header="Account"
            >
                <AddAccount
                    account={selectedAccount}
                    onSubmit={(success, data) => {
                        if (success) {
                            getAccounts(dispatch).then((response) => {
                                setAccounts(response.results);
                            });
                            console.log(`Account ${data} has been add Successfully.`);
                        } else {
                            console.log(`Error occurred while adding Account ${data}.`);
                        }
                        setSelectedAccount(undefined);
                        setShowAddAccount(false);
                    }}
                />
            </Dialog>
        </div>
    );
};

export default DashboardPage;
