import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EEnvKey } from '@constants/env.constant';

@Injectable()
export class AppService {
    constructor(private configService: ConfigService) {}
    getHello(): string {
        return 'Hello World! This is service: ' + this.configService.get(EEnvKey.APP_NAME);
    }
}
