import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import rawbody from 'raw-body';

import { EEnvKey } from '@constants/env.constant';

import * as exc from '@shared//exception';
import { IResponse } from '@shared/interceptors/request-response.interceptor';
import { LoggerService } from '@shared/modules/loggers/logger.service';

const configService = new ConfigService();

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
    constructor(private readonly loggingService: LoggerService) {}

    private logger = this.loggingService.getLogger('http-exception');

    async catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();
        const raw = await rawbody(request);
        const text = raw.toString().trim();
        console.log('body:', text);
        console.log(request.reachable);
        // const status = exception.getStatus();
        let excResponse = exception.getResponse() as IResponse<any> | any;
        this.logger.info(request.headers, request.query, request.params, request.body);
        this.logger.warn(excResponse);
        if (typeof excResponse !== 'object' || !excResponse.hasOwnProperty('success')) {
            let newDataResponse: Record<string, any> =
                typeof excResponse === 'object' ? excResponse : { message: excResponse };
            newDataResponse = newDataResponse?.message;
            excResponse = new exc.BadRequestException({
                statusCode: excResponse.statusCode ? excResponse.statusCode : HttpStatus.BAD_REQUEST,
                data: excResponse.data ? excResponse.data : null,
                validatorErrors: excResponse?.validatorErrors ? excResponse.validatorErrors : [],
                message: typeof newDataResponse === 'string' ? newDataResponse : '',
                serviceName: configService.get(EEnvKey.APP_NAME),
            }).getResponse();
        } else {
            excResponse.serviceName = configService.get(EEnvKey.APP_NAME);
        }
        response.status(excResponse.statusCode).json(excResponse);
    }
}
