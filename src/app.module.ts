import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { memoryStorage } from 'multer';
import { ConsoleModule } from 'nestjs-console';

import { ConfigurationModule } from '@config/config.module';

import { LoggingModule } from '@shared/modules/loggers/logger.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MODULES } from './modules';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmOptions } from '@config/database.config';
import { RepositoryModule } from '@models/repositories/repository.module';
import { FirstMiddleware } from '@shared/middleware/first-middleware';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
    imports: [
        EventEmitterModule.forRoot({
            // set this to `true` to use wildcards
            wildcard: false,
            // the delimiter used to segment namespaces
            delimiter: '.',
            // set this to `true` if you want to emit the newListener event
            newListener: false,
            // set this to `true` if you want to emit the removeListener event
            removeListener: false,
            // the maximum amount of listeners that can be assigned to an event
            maxListeners: 10,
            // show event name in memory leak message when more than maximum amount of listeners is assigned
            verboseMemoryLeak: false,
            // disable throwing uncaughtException if an error event is emitted and it has no listeners
            ignoreErrors: false,
        }),
        ConfigurationModule,
        TypeOrmModule.forRootAsync(typeOrmOptions),
        RepositoryModule,
        LoggingModule,
        ConsoleModule,
        MulterModule.register({
            storage: memoryStorage(),
        }),
        ScheduleModule.forRoot(),
        ...MODULES,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(FirstMiddleware).forRoutes('*');
    }
}
