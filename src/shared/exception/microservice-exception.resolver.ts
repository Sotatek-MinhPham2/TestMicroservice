import { RpcException } from '@nestjs/microservices';

export class MicroserviceException extends RpcException {
    constructor(error: string | object) {
        super(error);
    }
}
