import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
    @ApiProperty()
    @IsString()
    idempotencyKey: string;

    @ApiProperty()
    @IsString()
    metadata: MetadataType;

    @ApiProperty()
    @IsOptional()
    amount: {
        amount: string;
        currency: string;
    };

    @ApiProperty()
    source: {
        id: string;
        type: string;
    };

    @ApiProperty()
    @IsOptional()
    @IsString()
    encryptedData: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    keyId: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    verification: string;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isAcceptTermAndCondition: boolean;
}

export type MetadataType = {
    email: string;
    phoneNumber?: string;
    sessionId: string;
    ipAddress?: string;
};
