import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TcpContext } from '@nestjs/microservices';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EEnvKey } from '@constants/env.constant';

import { LoggerService } from '@shared/modules/loggers/logger.service';
import rawbody from 'raw-body';
const configService = new ConfigService();
export const defaultResponse: IResponse<[]> = {
    success: true,
    statusCode: HttpStatus.OK,
    message: '',
    data: null,
    validatorErrors: [],
    serviceName: '',
};

export interface IResponse<T> {
    statusCode?: HttpStatus;
    data?: T;
    _metadata?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    };
    // Message for error
    message?: string | null;
    success?: boolean;
    validatorErrors?: any[];
    serviceName?: string;
}
export function createResponse<T>(data: any): IResponse<T> {
    let metadata;
    if (data?._metadata) {
        metadata = {
            ...data._metadata,
            timestamp: new Date(),
        };
        delete data._metadata;
    } else {
        metadata = {
            timestamp: new Date(),
        };
    }
    return {
        statusCode: data?.statusCode ? data.statusCode : HttpStatus.OK,
        data: data?.data || data || [],
        _metadata: metadata,
        success: true,
        message: data.message || '',
        validatorErrors: [],
        serviceName: configService.get(EEnvKey.APP_NAME),
    };
}

export interface IResponseMicroservice<T> {
    data?: T;
    _metadata?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    };
    // Message for error
    message?: string | null;
    success?: boolean;
    serviceName?: string;
}

export function createResponseForMicroservice(data: any): IResponseMicroservice<any> {
    let metadata;
    if (data?._metadata) {
        metadata = {
            ...data._metadata,
            timestamp: new Date(),
        };
        delete data._metadata;
    } else {
        metadata = {
            timestamp: new Date(),
        };
    }
    return {
        data: data?.data || data || [],
        _metadata: metadata,
        success: true,
        message: data.message || '',
        serviceName: configService.get(EEnvKey.APP_NAME),
    };
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
    constructor(private readonly loggingService: LoggerService) {}
    private logger = this.loggingService.getLogger('Request');
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<IResponse<T>>> {
        const request = context.switchToHttp().getRequest();
        this.logger.info(`Request data [Microservice]`, request);
        const raw = await rawbody(request);
        const text = raw.toString().trim();
        console.log('body:', text);
        console.log(request.reachable);
        this.logger.info(request.headers, request.query, request.params, request.body);
        return next.handle().pipe(
            map(data => {
                const ctx = context.switchToHttp();
                const response = ctx.getResponse<Response>();
                // For Microservice
                if (response instanceof TcpContext) {
                    return createResponseForMicroservice(data);
                }
                // For Http RestAPI
                const responseData = createResponse(data);
                response.status(responseData.statusCode);
                return createResponse(data);
            }),
        );
    }
}
