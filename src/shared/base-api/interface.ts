import { DeepPartial } from 'typeorm/common/DeepPartial';
import { FindConditions } from 'typeorm/find-options/FindConditions';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';
import BaseEntity from '@shared/base-api/models/base.entity';
import { EntityId } from 'typeorm/repository/EntityId';

export interface IBaseService<MainEntity> {
    createEntity(entityData: DeepPartial<MainEntity>): Promise<MainEntity>;
    updateEntity(
        filters: FindConditions<MainEntity>,
        entityData: QueryDeepPartialEntity<MainEntity>,
    ): Promise<UpdateResult>;
    listEntities(filters: FindConditions<MainEntity>);
    getEntityByConditions(filters: FindConditions<MainEntity>);
    getEntityById<T extends BaseEntity>(_id: EntityId): Promise<T>;
}
