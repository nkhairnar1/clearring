import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const start = Date.now();
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();

    res.setHeader('X-Request-ID', requestId);

    res.on('finish', () => {
      const ms = Date.now() - start;
      const { statusCode } = res;
      const color = statusCode >= 500 ? 31 : statusCode >= 400 ? 33 : statusCode >= 300 ? 36 : 32;
      this.logger.log(`\x1b[${color}m${method} ${originalUrl} → ${statusCode}\x1b[0m (${ms}ms) [${requestId.slice(0, 8)}]`);
    });

    next();
  }
}
