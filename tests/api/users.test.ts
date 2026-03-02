import { describe, it, expect } from 'vitest';
import { app } from '../../src/index';

describe('用户 API 测试', () => {
  describe('GET /api/users', () => {
    it('should get all users', async () => {
      const res = await app.request('/api/users');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return 400 for invalid id', async () => {
      const res = await app.request('/api/users/invalid');
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('message');
    });
  });

  describe('POST /api/users', () => {
    it('should return 400 when name is missing', async () => {
      const res = await app.request('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com'
        })
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('message');
    });

    it('should return 400 when email is missing', async () => {
      const res = await app.request('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '测试用户'
        })
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('message');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should return 404 when updating non-existent user', async () => {
      const res = await app.request('/api/users/999999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '测试用户'
        })
      });

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body).toHaveProperty('message');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should return 404 when deleting non-existent user', async () => {
      const res = await app.request('/api/users/999999', {
        method: 'DELETE'
      });

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body).toHaveProperty('message');
    });
  });
});
