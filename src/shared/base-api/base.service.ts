import { DeleteResult, FindManyOptions, FindOneOptions, FindOptionsWhere } from 'typeorm';
import { EntityId } from 'typeorm/repository/EntityId';
import { LoggerService } from '@shared/modules/loggers/logger.service';
import { IBaseService } from '@shared/base-api/interface';
import { Logger } from 'log4js';
import { AbstractBaseService } from '@shared/base-api/abstract.service';
import BaseEntity from '@shared/base-api/models/base.entity';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';
import { BaseRepository } from '@shared/base-api/models/base.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

export class BaseService<MainEntity extends BaseEntity, R extends BaseRepository<MainEntity>>
    extends AbstractBaseService
    implements IBaseService<MainEntity>
{
    protected readonly serviceName: string;
    protected readonly mainRepository: R;
    protected readonly loggerService: LoggerService;
    protected readonly eventEmitter: EventEmitter2;
    protected logger: Logger;

    constructor(mainRepository: R, loggerService: LoggerService, eventEmitter: EventEmitter2, serviceName: string) {
        super();
        this.mainRepository = mainRepository;
        this.loggerService = loggerService;
        this.eventEmitter = eventEmitter;
        this.serviceName = serviceName;
    }

    get beforeCreateEventName() {
        return `${this.serviceName}.beforeCreate.event`;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
    async beforeCreate(entityData: DeepPartial<MainEntity>): Promise<DeepPartial<MainEntity>> {
        this.eventEmitter.emit(this.beforeCreateEventName, entityData);
        return entityData;
    }
    get afterCreateEventName() {
        return `${this.serviceName}.afterCreate.event`;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
    async afterCreate(entityData: DeepPartial<MainEntity>, entity: MainEntity): Promise<void> {
        this.eventEmitter.emit(this.afterCreateEventName, entityData);
    }

    async createEntity(entityData: DeepPartial<MainEntity>): Promise<MainEntity> {
        const beforeCreate = await this.beforeCreate(entityData);
        const entity = await this.mainRepository.save(beforeCreate);
        await this.afterCreate(entityData, entity);
        return entity;
    }

    async normalize<T extends BaseEntity>(entities: MainEntity[]): Promise<T> {
        return entities as unknown as T;
    }

    async getEntityById<T extends BaseEntity>(_id: EntityId): Promise<T> {
        const entity = await this.mainRepository.findOneById(_id);
        const normalize = await this.normalize([entity]);
        return normalize[0];
    }

    async getEntityByConditions(filters: FindOneOptions<MainEntity>) {
        const entity = await this.mainRepository.findOne(filters);
        const normalize = await this.normalize([entity]);
        return normalize[0];
    }

    async listEntities(filters: FindManyOptions<MainEntity>) {
        const entities = await this.mainRepository.find(filters);
        return this.normalize(entities);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
    async beforeUpdate(entityData: QueryDeepPartialEntity<MainEntity>): Promise<QueryDeepPartialEntity<MainEntity>> {
        return entityData;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
    async afterUpdate(entityData: QueryDeepPartialEntity<MainEntity>, updateResult: UpdateResult): Promise<void> {}

    async updateEntity(
        filters: FindOptionsWhere<MainEntity>,
        entityData: QueryDeepPartialEntity<MainEntity>,
    ): Promise<UpdateResult> {
        const beforeUpdate = await this.beforeUpdate(entityData);
        const updateResult = await this.mainRepository.update(filters, beforeUpdate);
        await this.afterUpdate(entityData, updateResult);
        return updateResult;
    }

    async deleteByConditions(filters: FindOptionsWhere<MainEntity>): Promise<DeleteResult> {
        return this.mainRepository.delete(filters);
    }
}
