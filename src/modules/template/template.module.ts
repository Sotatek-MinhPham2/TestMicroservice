import { Template, TemplateSchema } from '@models//entities/Template.entity';
import TemplateRepository from '@models/repositories/Template.repository';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TemplateController } from './template.controller';
import { TemplateService } from './template.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ServiceConstant } from '@constants/service.constant';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Template.name,
                schema: TemplateSchema,
            },
        ]),
        ClientsModule.register([
            {
                name: ServiceConstant.TEMPLATE_SERVICE_2.name,
                transport: Transport.TCP,
                options: {
                    port: 5001,
                    host: '10.4.17.146',
                },
            },
        ]),
        ClientsModule.register([
            {
                name: 'MATH_SERVICE',
                transport: Transport.REDIS,
                options: {
                    host: 'localhost',
                    port: 6379,
                },
            },
        ]),
        ClientsModule.register([
            {
                name: 'TEMPLATE_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: ['amqp://localhost:5672'],
                    queue: 'template_queue',
                    noAck: false,
                    queueOptions: {
                        durable: false,
                    },
                },
            },
        ]),
        ClientsModule.register([
            {
                name: 'HERO_PACKAGE',
                transport: Transport.GRPC,
                options: {
                    package: 'hero',
                    protoPath: join(__dirname, '../../../hero/hero.proto'),
                },
            },
        ]),
    ],
    controllers: [TemplateController],
    providers: [TemplateService, TemplateRepository],
})
export class TemplateModule {}
