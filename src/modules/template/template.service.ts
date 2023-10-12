import { HttpStatus, Injectable } from '@nestjs/common';

import { formatResponseSuccess } from '@shared/utils/format';

import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateRepository } from '@models/repositories/Template.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@shared/base-api/base.service';
import { LoggerService } from '@shared/modules/loggers/logger.service';
import { TemplateEntity } from '@models/entities/Template.entity';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class TemplateService extends BaseService<TemplateEntity, TemplateRepository> {
    constructor(
        @InjectRepository(TemplateRepository) private templateRepository: TemplateRepository,
        protected loggerService: LoggerService,
        protected eventEmitter: EventEmitter2,
    ) {
        super(templateRepository, loggerService, eventEmitter, TemplateService.name);
        this.logger = this.loggerService.getLogger(TemplateService.name);
    }
    async create(createTemplateDto: CreateTemplateDto) {
        this.logger.info(createTemplateDto);
        const templateEntity = await this.createEntity({
            content: createTemplateDto.content,
        });
        return formatResponseSuccess({
            data: templateEntity,
            statusCode: HttpStatus.CREATED,
        });
    }
    @OnEvent(`${TemplateService.name}.afterCreate.event`)
    async handleOrderCreatedEvent(payload) {
        this.logger.info('Handle after create', payload);
    }
    async findAll(): Promise<[]> {
        return [];
    }

    async findOne(id: number) {
        return this.getEntityById(id);
    }

    update(id: string, updateTemplateDto: UpdateTemplateDto) {
        console.log(updateTemplateDto);
        return {};
    }

    remove(id: number) {
        return `This action removes a #${id} template`;
    }
}
