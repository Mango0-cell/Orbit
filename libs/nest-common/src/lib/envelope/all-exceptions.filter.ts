import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ErrorEnvelope } from './envelope.types';

/**
 * Catches every thrown error and shapes it as `{ error: { code, message, details? }, meta }`.
 * HttpExceptions keep their status/message; anything else is a 500 with its message hidden
 * (logged server-side). class-validator errors surface as `details`.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let details: unknown;

    if (isHttp) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        message = response;
      } else {
        const body = response as { message?: unknown; error?: unknown };
        if (Array.isArray(body.message)) {
          message = 'Validation failed';
          details = body.message;
        } else {
          message = String(body.message ?? body.error ?? exception.message);
        }
      }
    } else {
      this.logger.error(
        exception instanceof Error ? (exception.stack ?? exception.message) : String(exception),
      );
    }

    const envelope: ErrorEnvelope = {
      error: {
        code: (HttpStatus[status] as string | undefined) ?? 'ERROR',
        message,
        ...(details === undefined ? {} : { details }),
      },
      meta: {
        requestId: req?.requestId ?? req?.headers?.['x-request-id'] ?? '',
        timestamp: new Date().toISOString(),
      },
    };

    res.status(status).json(envelope);
  }
}
