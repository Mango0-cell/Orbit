import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

interface ReqLike {
  headers: Record<string, string | string[] | undefined>;
  method: string;
  url: string;
  originalUrl?: string;
  requestId?: string;
}
interface ResLike {
  statusCode: number;
  setHeader(name: string, value: string): void;
  on(event: string, cb: () => void): void;
}

/**
 * Assigns a correlation id to every request (honoring an inbound `x-request-id`),
 * echoes it back on the response, and logs `METHOD url status durationms [id]`.
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: ReqLike, res: ResLike, next: () => void): void {
    const inbound = req.headers['x-request-id'];
    const requestId =
      (Array.isArray(inbound) ? inbound[0] : inbound) || randomUUID();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    const start = Date.now();
    res.on('finish', () => {
      this.logger.log(
        `${req.method} ${req.originalUrl ?? req.url} ${res.statusCode} ${Date.now() - start}ms [${requestId}]`,
      );
    });
    next();
  }
}
