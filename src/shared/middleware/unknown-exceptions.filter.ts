import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, RpcExceptionFilter } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EEnvKey } from '@constants/env.constant';

import { IResponse, IResponseMicroservice } from '@shared/interceptors/request-response.interceptor';
import { LoggerService } from '@shared/modules/loggers/logger.service';
import { TcpContext } from '@nestjs/microservices';
import { Observable } from 'rxjs';

const configService = new ConfigService();

@Catch()
export class UnknownExceptionsFilter implements ExceptionFilter, RpcExceptionFilter {
    constructor(private readonly loggingService: LoggerService) {}

    private logger = this.loggingService.getLogger('unknown-exception');

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        this.logger.error(exception);

        const defaultResponse: IResponse<any> = {
            data: null,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            message: typeof exception === 'object' && exception?.message ? exception.message : '',
            success: false,
            serviceName: configService.get(EEnvKey.APP_NAME),
        };
        if (response instanceof TcpContext) {
            const defaultResponse: IResponseMicroservice<any> = {
                data: null,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                message: typeof exception === 'object' && exception?.message ? exception.message : '',
                success: false,
                serviceName: configService.get(EEnvKey.APP_NAME),
            };
            this.logger.error(`Error in pattern: ${response.getPattern()}`);
            return new Observable(subscriber => {
                subscriber.next(defaultResponse);
                subscriber.complete();
            });
        }
        return response.status(defaultResponse.statusCode).json(defaultResponse);
    }
}
