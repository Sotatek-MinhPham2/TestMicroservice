import { Controller, Get } from '@nestjs/common';

import { ErrorConstant } from '@constants/error.constant';

import { AppService } from './app.service';
import { PlainBody } from '@shared/decorators/custom.decorator';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(@PlainBody() text: string): string {
        console.log(text);
        return this.appService.getHello();
    }
    @Get('/error')
    getConstant() {
        return ErrorConstant;
    }
}
