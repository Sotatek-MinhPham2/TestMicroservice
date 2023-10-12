import { Catch, RpcExceptionFilter } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { LoggerService } from '@shared/modules/loggers/logger.service';
import { IResponseMicroservice } from '@shared/interceptors/request-response.interceptor';
import { EEnvKey } from '@constants/env.constant';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

@Catch(RpcException)
export class MicroserviceExceptionFilter implements RpcExceptionFilter<RpcException> {
    constructor(private readonly loggingService: LoggerService) {}

    private logger = this.loggingService.getLogger('microservice-exception');

    catch(exception: RpcException): Observable<any> {
        this.logger.warn(exception);
        const defaultResponse: IResponseMicroservice<any> = {
            data: null,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            message: typeof exception === 'object' && exception?.message ? exception.message : '',
            success: false,
            serviceName: configService.get(EEnvKey.APP_NAME),
        };
        return new Observable(subscriber => {
            subscriber.next(defaultResponse);
            subscriber.complete();
        });
    }
}
