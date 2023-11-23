import { Broker, BrokerBuilder } from './broker.js';

export interface DematAccount {
    account_bo_id: string;
    account_client_id: string;
    account_name: string;
    broker: Broker;
    account_type: string;
    start_date: Date;
    last_synced_on: Date;
}

export interface DematAccountDto {
    account_bo_id: string;
    account_client_id: string;
    account_name: string;
    broker: Broker;
    account_type: string;
    start_date: Date;
}

export class DematAccountBuilder {
    static buildFromEntity(iDematAccount: DematAccount & Broker): DematAccount {
        return {
            account_bo_id: iDematAccount.account_bo_id,
            account_client_id: iDematAccount.account_client_id,
            account_name: iDematAccount.account_name,
            broker: BrokerBuilder.buildFromEntity(iDematAccount),
            account_type: iDematAccount.account_type,
            start_date: new Date(iDematAccount.start_date),
            last_synced_on: new Date(iDematAccount.last_synced_on)
        };
    }

    static toDematAccountDto(item: DematAccount): DematAccountDto {
        return {
            account_bo_id: item.account_bo_id,
            account_client_id: item.account_client_id,
            account_name: item.account_name,
            broker: item.broker,
            account_type: item.account_type,
            start_date: new Date(item.start_date)
        };
    }

    static toDematAccount(item: DematAccountDto): DematAccount {
        return {
            account_bo_id: item.account_bo_id,
            account_client_id: item.account_client_id,
            account_name: item.account_name,
            broker: item.broker,
            account_type: item.account_type,
            start_date: new Date(item.start_date),
            last_synced_on: new Date()
        };
    }
}
