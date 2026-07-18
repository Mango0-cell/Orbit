import { RequestContextMiddleware } from './request-context.middleware';

describe('RequestContextMiddleware', () => {
  const mw = new RequestContextMiddleware();

  const makeRes = () => ({ statusCode: 200, setHeader: jest.fn(), on: jest.fn() });

  it('generates a request id, echoes it, and calls next', () => {
    const req = { headers: {}, method: 'GET', url: '/x' } as never as Parameters<
      RequestContextMiddleware['use']
    >[0];
    const res = makeRes();
    const next = jest.fn();
    mw.use(req, res, next);
    expect((req as { requestId?: string }).requestId).toMatch(/[0-9a-f-]{36}/);
    expect(res.setHeader).toHaveBeenCalledWith(
      'x-request-id',
      (req as { requestId?: string }).requestId,
    );
    expect(next).toHaveBeenCalled();
  });

  it('honors an inbound x-request-id', () => {
    const req = {
      headers: { 'x-request-id': 'incoming-1' },
      method: 'GET',
      url: '/x',
    } as never as Parameters<RequestContextMiddleware['use']>[0];
    mw.use(req, makeRes(), () => undefined);
    expect((req as { requestId?: string }).requestId).toBe('incoming-1');
  });
});
