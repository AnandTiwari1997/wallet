import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Consent {
    @PrimaryColumn()
    email: string;

    @Column()
    provider: string;

    @Column()
    access_token: string;

    @Column()
    refresh_token: string;

    @Column()
    expiration: Date;

    constructor(email: string, provider: string, access_token: string, refresh_token: string, expiration: Date) {
        this.email = email;
        this.provider = provider;
        this.access_token = access_token;
        this.refresh_token = refresh_token;
        this.expiration = expiration;
    }
}
