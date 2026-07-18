import { firstValueFrom, of } from 'rxjs';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type CallHandler,
  type ExecutionContext,
} from '@nestjs/common';
import { ResponseInterceptor } from './response.interceptor';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('ResponseInterceptor', () => {
  it('wraps the handler result in { data, meta }', async () => {
    const interceptor = new ResponseInterceptor();
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ requestId: 'req-1' }) }),
    } as unknown as ExecutionContext;
    const next: CallHandler = { handle: () => of({ hello: 'world' }) };

    const out = (await firstValueFrom(interceptor.intercept(context, next))) as {
      data: unknown;
      meta: { requestId: string; timestamp: string };
    };
    expect(out.data).toEqual({ hello: 'world' });
    expect(out.meta.requestId).toBe('req-1');
    expect(typeof out.meta.timestamp).toBe('string');
  });
});

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  function run(exception: unknown) {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ requestId: 'r' }),
      }),
    } as unknown as ArgumentsHost;
    filter.catch(exception, host);
    return { status, json, body: () => json.mock.calls[0][0] };
  }

  it('shapes an HttpException with its status, code and message', () => {
    const { status, body } = run(new BadRequestException('bad input'));
    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(body().error.code).toBe('BAD_REQUEST');
    expect(body().error.message).toBe('bad input');
    expect(body().meta.requestId).toBe('r');
  });

  it('surfaces class-validator message arrays as details', () => {
    const { body } = run(
      new HttpException({ message: ['a must be a string', 'b is required'] }, HttpStatus.BAD_REQUEST),
    );
    expect(body().error.message).toBe('Validation failed');
    expect(body().error.details).toEqual(['a must be a string', 'b is required']);
  });

  it('hides internals for an unknown error (500)', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const { status, body } = run(new Error('db exploded'));
    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body().error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(body().error.message).toBe('Internal server error');
  });
});
