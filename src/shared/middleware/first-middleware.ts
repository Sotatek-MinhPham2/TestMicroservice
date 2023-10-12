import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ServiceUnavailable } from '@shared/exception';
import { ErrorConstant } from '@constants/error.constant';

@Injectable()
export class FirstMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // flag
        const isMaintain = false;
        if (isMaintain)
            throw new ServiceUnavailable({
                message: ErrorConstant.DEFAULT.MAINTAIN,
            });
        next();
    }
}
