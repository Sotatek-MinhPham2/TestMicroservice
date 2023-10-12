import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';

import { EEnvKey } from '@constants/env.constant';

import { ResponseTransformInterceptor } from '@shared/interceptors/request-response.interceptor';
import { useMorgan } from '@shared/middleware';
import { HttpExceptionFilter } from '@shared/middleware/http-exception.filter';
import { UnknownExceptionsFilter } from '@shared/middleware/unknown-exceptions.filter';
import { LoggerService } from '@shared/modules/loggers/logger.service';
import { BodyValidationPipe } from '@shared/pipes/validation.pipe';
import { initSwagger } from '@shared/swagger';
import { TcpOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { MicroserviceExceptionFilter } from '@shared/middleware/microservice-exception.filter';
// import { RedisOptions } from 'ioredis';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);
    const loggingService = app.get(LoggerService);
    const logger = loggingService.getLogger(configService.get<string>(EEnvKey.APP_NAME));
    app.useGlobalInterceptors(new ResponseTransformInterceptor(loggingService));
    app.useGlobalFilters(new UnknownExceptionsFilter(loggingService));
    app.useGlobalFilters(new HttpExceptionFilter(loggingService));
    app.useGlobalFilters(new MicroserviceExceptionFilter(loggingService));

    app.useGlobalPipes(new BodyValidationPipe());
    app.setGlobalPrefix(configService.get<string>(EEnvKey.GLOBAL_PREFIX));
    app.enableCors();
    app.use(useMorgan(loggingService.logger.access));
    initSwagger(app, configService);
    app.use('/assets', express.static('assets'));
    const tcpHost = configService.get(EEnvKey.TCP_HOST);
    const tcpPort = configService.get(EEnvKey.TCP_PORT);
    app.connectMicroservice(
        {
            transport: Transport.TCP,
            options: {
                host: tcpHost,
                port: tcpPort,
            },
        } as TcpOptions,
        { inheritAppConfig: true },
    );
    app.connectMicroservice(
        {
            transport: Transport.GRPC,
            options: {
                package: 'hero',
                protoPath: join(__dirname, '../hero/hero.proto'),
            },
        },
        { inheritAppConfig: true },
    );
    // app.connectMicroservice(
    //     {
    //         transport: Transport.REDIS,
    //         options: {
    //             host: 'localhost',
    //             port: 6379,
    //         },
    //     } as RedisOptions,
    //     { inheritAppConfig: true },
    // );
    // app.connectMicroservice(
    //     {
    //         transport: Transport.RMQ,
    //         options: {
    //             urls: ['amqp://thomq:thopassword@localhost:5672'],
    //             queue: 'template_queue',
    //             // noAck => manual acknowledgment mode enabled
    //             noAck: false,
    //             queueOptions: {
    //                 durable: false,
    //             },
    //         },
    //     },
    //     { inheritAppConfig: true },
    // );
    await app.startAllMicroservices();
    await app.listen(configService.get<number>(EEnvKey.PORT) || 3000);
    logger.info(`[RestfulLAPI] Application is running on: ${await app.getUrl()}`);
    logger.info(`[TCP] Application is running on: ${tcpHost}:${tcpPort}`);
}
bootstrap();
