import { HttpStatus } from '@nestjs/common';

export interface IPayloadValidateException {
    message: string;
    validatorErrors: any[];
    statusCode: HttpStatus;
}

export class ValidateException {
    constructor(public iPayloadValidateException: IPayloadValidateException) {
        this.iPayloadValidateException = iPayloadValidateException;
    }
}
