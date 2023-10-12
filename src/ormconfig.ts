import { defaultConfig } from '@config/database.config';
import { DataSourceOptions } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const config: DataSourceOptions = {
    ...defaultConfig,
    logging: true,
    logger: 'file',
    migrationsTableName: 'migrate_tables',
    synchronize: false,
    // Allow both start:prod and start:dev to use migrations
    // __dirname is either dist or src folder, meaning either
    // the compiled js in prod or the ts in dev.
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
};

export = config;
