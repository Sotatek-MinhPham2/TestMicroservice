import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags()
@Controller('/')
export class HealthController {
    @ApiOperation({ summary: '' })
    @Get('/')
    async check() {
        return true;
    }
}
