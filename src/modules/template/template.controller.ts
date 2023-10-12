import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ErrorConstant } from '@constants/error.constant';

import * as exc from '@shared/exception/index';
import { LoggerService } from '@shared/modules/loggers/logger.service';

import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateService } from './template.service';
import { ClientTCP, MessagePattern } from '@nestjs/microservices';
import { CurrentUser } from '@shared/decorators/auth.decorator';
import { lastValueFrom } from 'rxjs';
import { ServiceConstant } from '@constants/service.constant';

@ApiTags('template')
@Controller('template')
export class TemplateController {
    constructor(
        private readonly templateService: TemplateService,
        private loggerService: LoggerService,

        @Inject(ServiceConstant.TEMPLATE_SERVICE_2.name) private readonly clientTemplateService2Proxy: ClientTCP,
    ) {}
    private logger = this.loggerService.getLogger('template');

    @Post()
    create(@Body() createTemplateDto: CreateTemplateDto) {
        this.logger.info('Log');
        return this.templateService.create(createTemplateDto);
    }

    @Get()
    async findAll(@CurrentUser() user: any) {
        console.log(user);
        const createOrder = await lastValueFrom(
            this.clientTemplateService2Proxy.send(ServiceConstant.TEMPLATE_SERVICE_2.patterns.CALL_TEMPLATE, {
                content: 'cc',
            }),
        );
        console.log(createOrder);

        return 'this.templateService.findAll()';
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
        return 'Ok Ok this is abc server 2';
    }
}
