import { EntityRepository } from 'typeorm';
import { TemplateEntity } from '@models/entities/Template.entity';
import { BaseRepository } from '@shared/base-api/models/base.repository';

@EntityRepository(TemplateEntity)
export class TemplateRepository extends BaseRepository<TemplateEntity> {}
