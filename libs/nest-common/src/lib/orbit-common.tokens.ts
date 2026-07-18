/** DI token holding the JWT secret used by JwtAuthGuard. */
export const JWT_SECRET_TOKEN = Symbol('ORBIT_JWT_SECRET');

/** Options for `OrbitCommonModule.forRoot()`. */
export interface OrbitCommonOptions {
  /** JWT secret; defaults to `process.env.JWT_SECRET`. */
  jwtSecret?: string;
}
