import { ConfigService } from '@nestjs/config';
import { EEnvKey } from '@constants/env.constant';
const configService = new ConfigService();
export function getConfigRedis(config: ConfigService): any {
    return {
        host: config.get<string>(EEnvKey.REDIS_HOST),
        port: config.get<number>(EEnvKey.REDIS_PORT),
        password: config.get<string>(EEnvKey.REDIS_PASSWORD),
        db: config.get<number>(EEnvKey.REDIS_DB_NUMBER),
    };
}

export const redisConfig = getConfigRedis(configService);
