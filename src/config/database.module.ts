import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { EEnvKey } from '@constants/env.constant';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const host = configService.get<string>(EEnvKey.DB_HOST);
                const port = configService.get<number>(EEnvKey.DB_PORT);
                const username = configService.get<string>(EEnvKey.DB_USERNAME);
                const password = configService.get<string>(EEnvKey.DB_PASSWORD);
                // const database = configService.get<string>(EEnvKey.DB_DATABASE);
                const uri = `mongodb://${username}:${password}@${host}:${port}/?authSource=admin`;
                return {
                    uri,
                };
            },
        }),
    ],
})
export class DatabaseModule {}
