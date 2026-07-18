/** Metadata attached to every response envelope. */
export interface Meta {
  requestId: string;
  timestamp: string;
}

/** Successful responses are wrapped as `{ data, meta }`. */
export interface SuccessEnvelope<T> {
  data: T;
  meta: Meta;
}

/** Errors are shaped as `{ error: { code, message, details? }, meta }`. */
export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: Meta;
}
