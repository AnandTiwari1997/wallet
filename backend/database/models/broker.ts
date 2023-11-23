export interface Broker {
    broker_id: string;
    broker_name: string;
    broker_icon: string;
    broker_email_id: string;
    broker_primary_color: string;
}

export interface IBroker {
    broker_id: string;
    broker_name: string;
    broker_icon: string;
    broker_email_id: string;
    broker_primary_color: string;
}

export class BrokerBuilder {
    static buildFromEntity(iBroker: Broker): Broker {
        return {
            broker_id: iBroker.broker_id,
            broker_name: iBroker.broker_name,
            broker_icon: iBroker.broker_icon,
            broker_email_id: iBroker.broker_email_id,
            broker_primary_color: iBroker.broker_primary_color
        };
    }
}
