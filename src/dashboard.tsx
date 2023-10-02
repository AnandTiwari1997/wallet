import CSS from 'csstype';
import './dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Account } from './data/account-data';
import { plus, edit } from './icons/icons';
import CalenderPicker from './modules/calender-picker/calender-picker';
import { useEffect, useState } from 'react';
import { getAccounts } from './modules/backend/BackendApi';

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

    useEffect(() => {
        getAccounts().then((response) => {
            setAccounts(response.results);
        });
    }, [setAccounts, getAccounts]);

    const accountCards = accounts.map((account) => {
        const backgroundColor: CSS.Properties = {
            backgroundColor: `${account.accountBackgroundColor ? account.accountBackgroundColor : '#e5e9ed'}`,
            color: `${account.accountBackgroundColor ? 'rgb(255, 255, 255)' : 'black'}`,
            display: 'flex',
            alignItems: 'center'
        };
        return (
            <div key={account.id} className="account-card" style={backgroundColor}>
                <i aria-hidden="true" className="pencil alternate icon" onClick={() => console.log('Edit Clicked')}>
                    <FontAwesomeIcon aria-hidden="true" className="icon pencil" icon={edit} />
                </i>

                <div className="account-icon-container">
                    <div className="account-icon icon-square simple">
                        <span>
                            <FontAwesomeIcon icon={account.accountIcon} />
                        </span>
                    </div>
                </div>
                <div className="account-details-container">
                    <div className="account-name">
                        <span>
                            <span>{account.accountName}</span>
                        </span>
                    </div>
                    <div className="account-balance">
                        <span className="">{account.initialBalance}</span>
                    </div>
                </div>
            </div>
        );
    });

    return (
        <div style={topDiv}>
            <div style={accountTopDivStyle}>
                <div style={addAccountCardStyle}>
                    <button className="add-account-button" onClick={() => console.log('Add Account Clicked')}>
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
        </div>
    );
};

export default DashboardPage;
