import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, RpcExceptionFilter } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EEnvKey } from '@constants/env.constant';

import { IResponse, IResponseMicroservice } from '@shared/interceptors/request-response.interceptor';
import { LoggerService } from '@shared/modules/loggers/logger.service';
import { RedisContext, RmqContext, TcpContext } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { ValidateException } from '@shared/exception/validate.exception';
// import { Metadata } from '@grpc/grpc-js';

const configService = new ConfigService();

@Catch()
export class UnknownExceptionsFilter implements ExceptionFilter, RpcExceptionFilter {
    constructor(private readonly loggingService: LoggerService) {}

    private logger = this.loggingService.getLogger('unknown-exception');
    private loggerValidate = this.loggingService.getLogger('validate-exception');

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        if (
            response instanceof TcpContext ||
            response instanceof RedisContext ||
            response instanceof RmqContext
            // || response instanceof Metadata
        ) {
            let defaultResponse: IResponseMicroservice<any> = {};
            if (exception instanceof ValidateException) {
                defaultResponse = {
                    data: null,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    message: exception.iPayloadValidateException.message,
                    validatorErrors: exception.iPayloadValidateException.validatorErrors,
                    success: false,
                    serviceName: configService.get(EEnvKey.APP_NAME),
                };
                this.loggerValidate.warn(exception);
            } else {
                defaultResponse = {
                    data: null,
                    message: typeof exception === 'object' && exception?.message ? exception.message : '',
                    success: false,
                    serviceName: configService.get(EEnvKey.APP_NAME),
                };
                this.logger.error(exception);
            }
            if (response instanceof TcpContext || response instanceof RmqContext) {
                this.logger.error(`Error in pattern: ${response.getPattern()}`);
            }
            return new Observable(subscriber => {
                subscriber.next(defaultResponse);
                subscriber.complete();
            });
        } else {
            let defaultResponse: IResponse<any> = {};
            if (exception instanceof ValidateException) {
                defaultResponse = {
                    data: null,
                    statusCode: exception.iPayloadValidateException.statusCode,
                    message: exception.iPayloadValidateException.message,
                    validatorErrors: exception.iPayloadValidateException.validatorErrors,
                    success: false,
                    serviceName: configService.get(EEnvKey.APP_NAME),
                };
                this.loggerValidate.warn(exception);
            } else {
                defaultResponse = {
                    data: null,
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: typeof exception === 'object' && exception?.message ? exception.message : '',
                    success: false,
                    serviceName: configService.get(EEnvKey.APP_NAME),
                };
                this.logger.error(exception);
            }

            return response.status(defaultResponse.statusCode).json(defaultResponse);
        }
    }
}
