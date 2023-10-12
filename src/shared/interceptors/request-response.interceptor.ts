import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisContext, RmqContext, TcpContext } from '@nestjs/microservices';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EEnvKey } from '@constants/env.constant';

import { LoggerService } from '@shared/modules/loggers/logger.service';
import { IncomingHttpHeaders } from 'http';
// import { Metadata } from '@grpc/grpc-js';

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
        message: data?.message || '',
        validatorErrors: [],
        serviceName: configService.get(EEnvKey.APP_NAME),
    };
}

export interface IResponseMicroservice<T> {
    data?: T;
    _metadata?: {
        [key: string]: any;
    };
    // Message for error
    message?: string | null;
    validatorErrors?: any[];
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
        message: data?.message || '',
        serviceName: configService.get(EEnvKey.APP_NAME),
    };
}

function getUserFromHeader(headers: IncomingHttpHeaders) {
    if (!headers['x-consumer-username']) return undefined;
    return {
        ownerId: headers['x-consumer-custom-id'],
        username: headers['x-consumer-username'],
    };
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
    constructor(private readonly loggingService: LoggerService) {}
    private logger = this.loggingService.getLogger('Request');
    intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse<T>> {
        const request = context.switchToHttp().getRequest();
        if (!request?.headers) {
            this.logger.info(`Request data [Microservice]`, request);
        } else {
            request.kongUser = getUserFromHeader(request.headers);
            this.logger.info(request.headers, request.query, request.params, request.body);
        }
        return next.handle().pipe(
            map(data => {
                const ctx = context.switchToHttp();
                const response = ctx.getResponse<Response>();
                // For Microservice
                if (
                    response instanceof TcpContext ||
                    response instanceof RedisContext ||
                    response instanceof RmqContext
                ) {
                    return createResponseForMicroservice(data);
                }
                // if (response instanceof Metadata) {
                //     // return response;
                //     // Format base in file defiine grpc
                //     return data;
                // }
                // For Http RestAPI
                const responseData = createResponse(data);
                response.status(responseData.statusCode);
                return createResponse(data);
            }),
        );
    }
}
