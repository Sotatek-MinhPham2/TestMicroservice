import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { EEnvKey } from '@constants/env.constant';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.env`,
            validationSchema: Joi.object({
                // nestjs
                [EEnvKey.NODE_ENV]: Joi.string().valid('development', 'production'),
                [EEnvKey.PORT]: Joi.number().default(3000),
                [EEnvKey.GLOBAL_PREFIX]: Joi.string(),
                [EEnvKey.SWAGGER_PATH]: Joi.string(),
                // database
                [EEnvKey.DB_HOST]: Joi.string().required(),
                [EEnvKey.DB_PORT]: Joi.number().required(),
                [EEnvKey.DB_USERNAME]: Joi.string(),
                [EEnvKey.DB_PASSWORD]: Joi.string(),
                // // circle
                // [EEnvKey.CIRCLE_API_KEY]: Joi.string(),
                // [EEnvKey.CIRCLE_API_URL]: Joi.string(),
                // [EEnvKey.BACKEND_APIS_DOMAIN]: Joi.string(),
                // // coinmarketcap
                // [EEnvKey.CMC_API_URL]: Joi.string(),
                // [EEnvKey.CMC_API_KEY]: Joi.string(),
            }),
            load: [],
        }),
    ],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigurationModule {}
