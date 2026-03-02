import { describe, it, expect } from 'vitest';
import { app } from '../../src/index';

describe('API 基础测试', () => {
  describe('GET /', () => {
    it('should return hello message', async () => {
      const res = await app.request('/');
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toContain('Hello! The Hono + Drizzle API is running');
    });
  });

  describe('CORS', () => {
    it('should handle OPTIONS request', async () => {
      const res = await app.request('/', {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        }
      });
      expect(res.status).toBe(204);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });

  describe('404 Not Found', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await app.request('/unknown-route');
      expect(res.status).toBe(404);
    });
  });
});
