import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from '@shared/base-api/models/base.entity';

@Entity({ name: 'template' })
export class TemplateEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    content: string;
}
