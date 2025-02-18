import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('sync_tracker')
export class SyncTracker {
    @PrimaryColumn()
    sync_type: string;

    @Column()
    sync_status: string;

    @Column()
    sync_started_at: Date;

    @Column({
        nullable: true
    })
    sync_ended_at!: Date;

    constructor(sync_type: string, sync_status: string, sync_started_at: Date) {
        this.sync_type = sync_type;
        this.sync_status = sync_status;
        this.sync_started_at = sync_started_at;
    }
}
