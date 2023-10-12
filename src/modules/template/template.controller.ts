import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ErrorConstant } from '@constants/error.constant';

import * as exc from '@shared/exception/index';
import { LoggerService } from '@shared/modules/loggers/logger.service';

import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateService } from './template.service';
import {
    ClientGrpc,
    ClientProxy,
    ClientRMQ,
    ClientTCP,
    Ctx,
    EventPattern,
    GrpcMethod,
    MessagePattern,
    Payload,
    RmqContext,
} from '@nestjs/microservices';
import { CurrentUser } from '@shared/decorators/auth.decorator';
// import { lastValueFrom } from 'rxjs';
import { ServiceConstant } from '@constants/service.constant';
// import { Metadata, ServerUnaryCall } from '@grpc/grpc-js';
import { lastValueFrom, Observable } from 'rxjs';

@ApiTags('template')
@Controller('template')
export class TemplateController {
    private heroesService: any;
    constructor(
        private readonly templateService: TemplateService,
        private loggerService: LoggerService,

        @Inject(ServiceConstant.TEMPLATE_SERVICE_2.name) private readonly clientTemplateService2Proxy: ClientTCP,
        @Inject('MATH_SERVICE') private readonly clientRedis: ClientProxy,
        @Inject('TEMPLATE_SERVICE') protected rabbit: ClientRMQ,
        @Inject('HERO_PACKAGE') private client: ClientGrpc,
    ) {}
    private logger = this.loggerService.getLogger('template');
    onModuleInit() {
        this.heroesService = this.client.getService<any>('HeroesService');
    }
    @Post()
    create(@Body() createTemplateDto: CreateTemplateDto) {
        this.logger.info('Log');
        return this.templateService.create(createTemplateDto);
    }

    @Get()
    async findAll(@CurrentUser() user: any) {
        console.log(user);
        // const createOrder = await lastValueFrom(
        //     this.clientTemplateService2Proxy.send(ServiceConstant.TEMPLATE_SERVICE_2.patterns.CALL_TEMPLATE, {
        //         content: 'cc',
        //     }),
        // );
        // console.log(createOrder);

        // const callMath = await lastValueFrom(this.clientRedis.send('notifications', [1, 2]));
        // console.log(callMath);

        // Only one client recieve and handle mess,if client handle off network,
        // when client run will reciece message with partern
        // const callMath = this.rabbit.emit('rabbit_message', [1, 2, 3]);
        // console.log(callMath);
        const grpcRes = await lastValueFrom(this.getHero());
        console.log(grpcRes);
        return grpcRes;
    }

    getHero(): Observable<string> {
        return this.heroesService.findOne({ id: 1 });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.templateService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTemplateDto: UpdateTemplateDto) {
        return this.templateService.update(id, updateTemplateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        console.log(id);
        throw new exc.BadRequestException({
            message: ErrorConstant.TEMPLATE.NOT_FOUND,
        });
    }

    @MessagePattern('call_template')
    public async searchUserByCredentials(callParams: { content: string }): Promise<any> {
        console.log(callParams);
        return callParams;
    }
    // All service have pattern also data
    // @MessagePattern('notifications')
    // getNotifications(@Payload() data: number[], @Ctx() context: RedisContext) {
    //     console.log(`Channel: ${context.getChannel()}`);
    // }

    @EventPattern('rabbit_message')
    testRabbit(@Payload() data: number[], @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        channel.ack(originalMsg);
        return (data || []).reduce((a, b) => a + b);
    }

    @GrpcMethod('HeroesService', 'FindOne')
    // findOneGrpc(data, metadata: Metadata, call: ServerUnaryCall<any, any>) {
    findOneGrpc(data) {
        const items = [
            { id: 1, name: 'John' },
            { id: 2, name: 'Doe' },
        ];
        const resData = items.find(({ id }) => id === data.id);
        console.log(`Res GRPC: `, resData);
        return resData;
    }
}
