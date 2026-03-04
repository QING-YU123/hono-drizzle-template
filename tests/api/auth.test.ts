import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { app } from '../../src/index';

/**
 * 用户认证与管理 API 测试
 *
 * @description 基于 v0.1.0-MVP 版本的 API 测试
 * @module auth.test
 */

// 生成唯一邮箱的辅助函数
const generateEmail = (prefix: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}@example.com`;
};

describe('认证 API 测试', () => {
  let validUser: {
    email: string;
    password: string;
    name: string;
  };

  let registeredUser: any = null;
  let loginTokens: { accessToken: string; refreshToken: string } | null = null;
  let refreshTestTokens: { accessToken: string; refreshToken: string } | null = null;

  describe('POST /auth/register - 用户注册', () => {
    it('TC-AUTH-REG-001: 注册成功（含 name）', async () => {
      const email = generateEmail('register');
      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'password123',
          name: '注册用户'
        })
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('email', email);
      expect(body).toHaveProperty('name', '注册用户');
      expect(body).toHaveProperty('is_admin', false);
      expect(body).toHaveProperty('created_at');
      expect(body).toHaveProperty('updated_at');
    });

    it('TC-AUTH-REG-002: 注册成功（不含 name）', async () => {
      const email = generateEmail('noreg');
      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'password123'
        })
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty('name');
      expect(body.name).toBe(email.split('@')[0]); // 邮箱前缀
    });

    it('TC-AUTH-REG-003: 密码边界值（8 字符）', async () => {
      const email = generateEmail('boundary8');
      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'pass1234'  // 刚好 8 字符
        })
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty('id');
    });

    it('TC-AUTH-REG-004: 缺少 email 字段', async () => {
      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: 'password123'
        })
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('message', 'email is required');
    });

    it('TC-AUTH-REG-005: 缺少 password 字段', async () => {
      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nopass@example.com'
        })
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('message', 'password is required');
    });

    it('TC-AUTH-REG-006: 邮箱格式无效', async () => {
      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'password123'
        })
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('message', 'email must be a valid email address');
    });

    it('TC-AUTH-REG-007: 密码少于 8 字符', async () => {
      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'shortpass@example.com',
          password: 'pass123'  // 7 字符
        })
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('message', 'password must be at least 8 characters');
    });

    it('TC-AUTH-REG-008: 邮箱已存在', async () => {
      const email = generateEmail('duplicate');
      // 先注册一个用户
      await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'password123'
        })
      });

      // 尝试注册相同邮箱
      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'password456'
        })
      });

      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body).toHaveProperty('message', 'Email already exists');
    });
  });

  describe('POST /auth/login - 用户登录', () => {
    it('TC-AUTH-LOG-001: 登录成功', async () => {
      const email = generateEmail('login');
      // 先注册用户
      await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'password123',
          name: '登录用户'
        })
      });

      // 登录
      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'password123'
        })
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');
      expect(body).toHaveProperty('user');
      expect(body.user).toHaveProperty('id');
      expect(body.user).toHaveProperty('email', email);
      expect(body.user).toHaveProperty('name', '登录用户');

      // 保存令牌供后续测试使用
      loginTokens = {
        accessToken: body.accessToken,
        refreshToken: body.refreshToken
      };
    });

    it('TC-AUTH-LOG-002: 缺少 email 字段', async () => {
      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: 'password123'
        })
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('message', 'email is required');
    });

    it('TC-AUTH-LOG-003: 缺少 password 字段', async () => {
      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com'
        })
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('message', 'password is required');
    });

    it('TC-AUTH-LOG-004: 邮箱为空字符串', async () => {
      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ' ',
          password: 'password123'
        })
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('message', 'email is required');
    });

    it('TC-AUTH-LOG-005: 密码为空字符串', async () => {
      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: ' '
        })
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('message', 'password is required');
    });

    it('TC-AUTH-LOG-006: 用户不存在', async () => {
      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
      });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body).toHaveProperty('message', 'Invalid email or password');
    });

    it('TC-AUTH-LOG-007: 密码错误', async () => {
      const email = generateEmail('wrongpass');
      // 先注册用户
      await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'password123'
        })
      });

      // 使用错误密码登录
      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'wrongpassword'
        })
      });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body).toHaveProperty('message', 'Invalid email or password');
    }, 15000); // 增加超时时间到15秒（bcrypt 操作较慢）
  });

  describe('POST /auth/refresh - 刷新访问令牌', () => {
    // 每次刷新测试前重新获取令牌，确保令牌未被使用过
    beforeEach(async () => {
      const email = generateEmail('refresh');
      // 注册并登录获取令牌
      await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'password123',
          name: '刷新用户'
        })
      });

      const loginRes = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'password123'
        })
      });

      const loginBody = await loginRes.json();
      refreshTestTokens = {
        accessToken: loginBody.accessToken,
        refreshToken: loginBody.refreshToken
      };
    });

    it('TC-AUTH-REF-001: 刷新成功', async () => {
      const res = await app.request('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: refreshTestTokens!.refreshToken
        })
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');
      // 令牌已轮换
      expect(body.refreshToken).not.toEqual(refreshTestTokens!.refreshToken);
    });

    it('TC-AUTH-REF-002: 缺少 refreshToken 字段', async () => {
      const res = await app.request('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('message', 'refreshToken is required');
    });

    it('TC-AUTH-REF-003: refreshToken 为空字符串', async () => {
      const res = await app.request('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: ' '
        })
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('message', 'refreshToken is required');
    });

    it('TC-AUTH-REF-004: 刷新令牌无效', async () => {
      const res = await app.request('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: 'invalid-token'
        })
      });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body).toHaveProperty('message', 'Invalid or expired refresh token');
    });

    it('TC-AUTH-REF-005: 刷新令牌已使用过', async () => {
      // 第一次刷新
      const firstRes = await app.request('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: refreshTestTokens!.refreshToken
        })
      });

      expect(firstRes.status).toBe(200);

      // 尝试使用同一令牌再次刷新
      const secondRes = await app.request('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: refreshTestTokens!.refreshToken
        })
      });

      expect(secondRes.status).toBe(401);
    });
  });

  describe('POST /auth/logout - 注销登录', () => {
    beforeEach(async () => {
      // 每个测试前重新登录获取新令牌
      const email = generateEmail('logout');
      await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'password123',
          name: '注销用户'
        })
      });

      const loginRes = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'password123'
        })
      });

      const loginBody = await loginRes.json();
      loginTokens = {
        accessToken: loginBody.accessToken,
        refreshToken: loginBody.refreshToken
      };
    });

    it('TC-AUTH-LOGOUT-001: 注销成功', async () => {
      const res = await app.request('/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: loginTokens!.refreshToken
        })
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('message', 'Logged out successfully');
    });

    it('TC-AUTH-LOGOUT-002: 缺少 refreshToken 字段', async () => {
      const res = await app.request('/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty('message', 'refreshToken is required');
    });

    it('TC-AUTH-LOGOUT-003: 重复注销（幂等性）', async () => {
      // 第一次注销
      const firstRes = await app.request('/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: loginTokens!.refreshToken
        })
      });

      expect(firstRes.status).toBe(200);

      // 第二次注销（使用已注销的令牌）
      const secondRes = await app.request('/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: loginTokens!.refreshToken
        })
      });

      // 幂等操作，返回成功
      expect(secondRes.status).toBe(200);
    });
  });
});
