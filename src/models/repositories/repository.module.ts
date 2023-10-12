import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateRepository } from '@models/repositories/Template.repository';

const commonRepositories = [TemplateRepository];

@Global()
@Module({
    imports: [TypeOrmModule.forFeature(commonRepositories)],
    exports: [TypeOrmModule],
})
export class RepositoryModule {}
