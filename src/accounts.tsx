import CSS from 'csstype';
import './accounts.css';
import Table, { TableColumn } from './modules/table/table';
import { Account, accounts } from './data/account-data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { indianRupee } from './icons/icons';

const topDiv: CSS.Properties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
};

const AccountPage = () => {
    const columns: TableColumn[] = [
        {
            key: 'accountType',
            label: 'Account Type',
            groupByKey: (row: Account) => {
                return row.accountType;
            }
        },
        {
            key: 'accountName',
            label: 'Account Name',
            groupByRender: (rows: Account[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Account Used:`}</div>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>{rows[0].accountName}</div>
                    </div>
                );
            }
        },
        {
            key: 'addedOn',
            label: 'Added On'
        },
        {
            key: 'initialBalance',
            label: 'Initial Balance',
            groupByRender: (rows: Account[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Account Initial Balance:`}</div>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            <i className="icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {rows[0].initialBalance}
                        </div>
                    </div>
                );
            },
            customRender: (row: Account) => {
                return (
                    <div>
                        <i className="icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {row.initialBalance}
                    </div>
                );
            }
        },
        {
            key: 'accountBalance',
            label: 'Account Balance',
            groupByRender: (rows: Account[]) => {
                return (
                    <div style={{ display: 'block' }}>
                        <div style={{ width: '100%', textAlign: 'left' }}>{`Recent Account Balance:`}</div>
                        <div style={{ width: '100%', textAlign: 'left', fontWeight: '700' }}>
                            <i className="icon">
                                <FontAwesomeIcon icon={indianRupee} />
                            </i>
                            {rows[0].accountBalance}
                        </div>
                    </div>
                );
            },
            customRender: (row: Account) => {
                return (
                    <div>
                        <i className="icon">
                            <FontAwesomeIcon icon={indianRupee} />
                        </i>
                        {row.accountBalance}
                    </div>
                );
            }
        }
    ];

    return (
        <>
            <div style={topDiv}>
                <div className="account-table-division">
                    <Table columns={columns} rows={accounts} groupByColumn={columns[0]} />
                </div>
            </div>
        </>
    );
};

export default AccountPage;
