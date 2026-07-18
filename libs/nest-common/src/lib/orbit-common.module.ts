import {
  type DynamicModule,
  Logger,
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from './envelope/all-exceptions.filter';
import { ResponseInterceptor } from './envelope/response.interceptor';
import { createValidationPipe } from './validation/validation.pipe';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PoliciesGuard } from './auth/policies.guard';
import { RequestContextMiddleware } from './context/request-context.middleware';
import { JWT_SECRET_TOKEN, type OrbitCommonOptions } from './orbit-common.tokens';

/**
 * One import wires every cross-cutting concern for a service:
 *   @Module({ imports: [OrbitCommonModule.forRoot()] })
 *
 * Registers (globally): ValidationPipe, AllExceptionsFilter, ResponseInterceptor,
 * JwtAuthGuard then PoliciesGuard, and the RequestContextMiddleware.
 */
@Module({})
export class OrbitCommonModule implements NestModule {
  static forRoot(options: OrbitCommonOptions = {}): DynamicModule {
    const secret = options.jwtSecret ?? process.env.JWT_SECRET ?? '';
    if (!secret) {
      new Logger(OrbitCommonModule.name).warn(
        'JWT_SECRET is not set — all bearer tokens will be rejected (guests only).',
      );
    }
    return {
      module: OrbitCommonModule,
      global: true,
      providers: [
        { provide: JWT_SECRET_TOKEN, useValue: secret },
        { provide: APP_PIPE, useFactory: () => createValidationPipe() },
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
        // Order matters: JwtAuthGuard sets req.user, then PoliciesGuard reads it.
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: PoliciesGuard },
      ],
    };
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
