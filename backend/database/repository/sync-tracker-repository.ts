import { DataSource, Repository } from 'typeorm';
import { SyncTracker } from '../models/sync-tracker.js';
import { databaseProvider } from '../database-provider.js';

class SyncTrackerRepository extends Repository<SyncTracker> {
    private readonly dataSource: DataSource;

    constructor(dataSource: DataSource) {
        super(SyncTracker, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }
}

export const syncTrackerRepository = new SyncTrackerRepository(databaseProvider.database);
