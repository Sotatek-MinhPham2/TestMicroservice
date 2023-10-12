import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ErrorConstant } from '@constants/error.constant';

import * as exc from '@shared/exception/index';
import { LoggerService } from '@shared/modules/loggers/logger.service';

import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateService } from './template.service';

@ApiTags('template')
@Controller('template')
export class TemplateController {
    constructor(private readonly templateService: TemplateService, private loggerService: LoggerService) {}
    private logger = this.loggerService.getLogger(TemplateController.name);

    @Post()
    create(@Body() createTemplateDto: CreateTemplateDto) {
        this.logger.info('Log');
        // const isTrue = this.eventEmitter.emit('template.created', {
        //     orderId: 1,
        //     payload: {},
        // });
        // this.eventEmitter.emit('templateAsync.created', {
        //     orderId: 1,
        //     payload: {},
        // });
        // this.logger.info('After event call', isTrue);

        return this.templateService.create(createTemplateDto);
    }
    @Get()
    findAll() {
        return this.templateService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
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
}
