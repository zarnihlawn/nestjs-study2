import { LoggerMiddleware } from './logger.middleware';

describe('MiddlewareLoggerMiddleware', () => {
  it('should be defined', () => {
    expect(new LoggerMiddleware()).toBeDefined();
  });
});
