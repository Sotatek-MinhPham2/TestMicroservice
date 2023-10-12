import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    HttpHealthIndicator,
    MemoryHealthIndicator,
    MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import type { HealthCheckResult } from '@nestjs/terminus';
import { Transport, RedisOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { getConfigRedis } from '@config/redis.config';

@Controller('/info')
export class HealthController {
    constructor(
        private healthCheckService: HealthCheckService,
        private http: HttpHealthIndicator,
        private memory: MemoryHealthIndicator,
        private microservice: MicroserviceHealthIndicator,
        private config: ConfigService,
    ) {}
    @Get('/health-x-y-z-a')
    @HealthCheck()
    async check(): Promise<HealthCheckResult> {
        return this.healthCheckService.check([
            () =>
                this.http.pingCheck('Google', 'https://www.google.com', {
                    timeout: 5000,
                }),
            () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024),
            // () => this.db.pingCheck(),
            () =>
                this.microservice.pingCheck<RedisOptions>('redis', {
                    transport: Transport.REDIS,
                    options: {
                        ...getConfigRedis(this.config),
                    },
                }),
        ]);
    }
}
