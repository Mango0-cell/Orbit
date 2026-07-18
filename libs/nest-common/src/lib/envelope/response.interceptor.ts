import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { type Observable, map } from 'rxjs';
import type { SuccessEnvelope } from './envelope.types';

/** Wraps every successful handler result in the standard `{ data, meta }` envelope. */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, SuccessEnvelope<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessEnvelope<T>> {
    const req = context.switchToHttp().getRequest();
    const requestId: string =
      req?.requestId ?? req?.headers?.['x-request-id'] ?? '';
    return next
      .handle()
      .pipe(
        map((data) => ({
          data,
          meta: { requestId, timestamp: new Date().toISOString() },
        })),
      );
  }
}
