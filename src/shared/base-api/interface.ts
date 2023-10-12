import { DeepPartial } from 'typeorm/common/DeepPartial';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';
import BaseEntity from '@shared/base-api/models/base.entity';
import { EntityId } from 'typeorm/repository/EntityId';
import { FindManyOptions, FindOneOptions, FindOptionsWhere } from 'typeorm';

export interface IBaseService<MainEntity> {
    createEntity(entityData: DeepPartial<MainEntity>): Promise<MainEntity>;
    updateEntity(
        filters: FindOptionsWhere<MainEntity>,
        entityData: QueryDeepPartialEntity<MainEntity>,
    ): Promise<UpdateResult>;
    listEntities(filters: FindManyOptions<MainEntity>);
    getEntityByConditions(filters: FindOneOptions<MainEntity>);
    getEntityById<T extends BaseEntity>(_id: EntityId): Promise<T>;
}
