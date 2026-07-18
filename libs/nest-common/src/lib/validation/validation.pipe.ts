import { ValidationPipe, type ValidationPipeOptions } from '@nestjs/common';

/**
 * The Orbit global validation pipe: strips unknown properties, rejects requests that
 * carry them, and transforms plain payloads into their DTO classes (with implicit
 * primitive conversion). Override any option per project if needed.
 */
export function createValidationPipe(
  options: ValidationPipeOptions = {},
): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    ...options,
  });
}
