import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Common')
@Controller('')
export class HealthController {
    @ApiOperation({ summary: 'API check health server' })
    @Get('/health')
    async check(): Promise<any> {
        return {
            status: 'ok',
        };
    }
}
