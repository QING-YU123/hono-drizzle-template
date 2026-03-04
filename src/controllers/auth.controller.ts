import { Hono } from 'hono';
import { AuthService } from '../services/auth.service';

/**
 * 认证控制器
 *
 * @description 处理用户认证相关的 HTTP 请求
 *              包括注册、登录、令牌刷新、注销等操作
 * @module AuthController
 */

const authController = new Hono();

/**
 * 用户注册
 *
 * @description 创建新用户账户，邮箱必须唯一，密码最少 8 字符
 * @route POST /auth/register
 * @param {Object} body - 请求体
 * @param {string} body.email - 用户邮箱（必填，邮箱格式）
 * @param {string} body.password - 密码（必填，最少 8 字符）
 * @param {string} [body.name] - 用户名称（可选）
 * @returns {Promise<Object>} JSON 响应，包含创建的用户信息，HTTP 状态码 201
 * @throws {400} 当 JSON 格式无效或参数验证失败时
 * @throws {409} 当邮箱已存在时
 *
 * @example
 * // POST /auth/register
 * // Body: { "email": "user@example.com", "password": "password123", "name": "John" }
 * // Response: { "id": 1, "email": "user@example.com", "name": "John", ... }
 */
authController.post('/register', async (c) => {
    let body: unknown;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ message: 'Invalid JSON body' }, 400);
    }

    const { email, password, name } = (body ?? {}) as {
        email?: unknown;
        password?: unknown;
        name?: unknown;
    };

    // 验证邮箱
    if (typeof email !== 'string' || email.trim().length === 0) {
        return c.json({ message: 'email is required' }, 400);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return c.json({ message: 'email must be a valid email address' }, 400);
    }

    // 验证密码
    if (typeof password !== 'string' || password.trim().length === 0) {
        return c.json({ message: 'password is required' }, 400);
    }
    if (password.length < 8) {
        return c.json({ message: 'password must be at least 8 characters' }, 400);
    }

    // 验证 name（可选）
    if (name !== undefined && typeof name !== 'string') {
        return c.json({ message: 'name must be a string' }, 400);
    }

    try {
        const user = await AuthService.register(
            email.trim(),
            password,
            name?.trim()
        );
        return c.json(user, 201);
    } catch (err) {
        if (err instanceof Error && err.message === 'Email already exists') {
            return c.json({ message: 'Email already exists' }, 409);
        }
        throw err;
    }
});

/**
 * 用户登录
 *
 * @description 验证用户身份并签发访问令牌和刷新令牌
 * @route POST /auth/login
 * @param {Object} body - 请求体
 * @param {string} body.email - 用户邮箱（必填）
 * @param {string} body.password - 密码（必填）
 * @returns {Promise<Object>} JSON 响应，包含令牌和用户信息
 * @throws {400} 当 JSON 格式无效或参数验证失败时
 * @throws {401} 当邮箱或密码错误时
 *
 * @example
 * // POST /auth/login
 * // Body: { "email": "user@example.com", "password": "password123" }
 * // Response: { "accessToken": "...", "refreshToken": "...", "user": {...} }
 */
authController.post('/login', async (c) => {
    let body: unknown;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ message: 'Invalid JSON body' }, 400);
    }

    const { email, password } = (body ?? {}) as {
        email?: unknown;
        password?: unknown;
    };

    // 验证邮箱
    if (typeof email !== 'string' || email.trim().length === 0) {
        return c.json({ message: 'email is required' }, 400);
    }

    // 验证密码
    if (typeof password !== 'string' || password.trim().length === 0) {
        return c.json({ message: 'password is required' }, 400);
    }

    try {
        const result = await AuthService.login(email.trim(), password);
        return c.json(result);
    } catch (err) {
        if (err instanceof Error && err.message === 'Invalid credentials') {
            return c.json({ message: 'Invalid email or password' }, 401);
        }
        throw err;
    }
});

/**
 * 刷新访问令牌
 *
 * @description 使用刷新令牌获取新的访问令牌和刷新令牌（令牌轮换）
 * @route POST /auth/refresh
 * @param {Object} body - 请求体
 * @param {string} body.refreshToken - 刷新令牌（必填）
 * @returns {Promise<Object>} JSON 响应，包含新的令牌对
 * @throws {400} 当 JSON 格式无效或参数验证失败时
 * @throws {401} 当刷新令牌无效或过期时
 *
 * @example
 * // POST /auth/refresh
 * // Body: { "refreshToken": "your-refresh-token" }
 * // Response: { "accessToken": "...", "refreshToken": "..." }
 */
authController.post('/refresh', async (c) => {
    let body: unknown;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ message: 'Invalid JSON body' }, 400);
    }

    const { refreshToken } = (body ?? {}) as {
        refreshToken?: unknown;
    };

    // 验证刷新令牌
    if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
        return c.json({ message: 'refreshToken is required' }, 400);
    }

    try {
        const result = await AuthService.refresh(refreshToken.trim());
        return c.json(result);
    } catch (err) {
        if (err instanceof Error && err.message === 'Invalid or expired refresh token') {
            return c.json({ message: 'Invalid or expired refresh token' }, 401);
        }
        throw err;
    }
});

/**
 * 注销登录
 *
 * @description 删除服务端的刷新令牌会话，使当前登录失效
 * @route POST /auth/logout
 * @param {Object} body - 请求体
 * @param {string} body.refreshToken - 刷新令牌（必填）
 * @returns {Promise<Object>} JSON 响应，包含成功消息
 * @throws {400} 当 JSON 格式无效或参数验证失败时
 *
 * @example
 * // POST /auth/logout
 * // Body: { "refreshToken": "your-refresh-token" }
 * // Response: { "message": "Logged out successfully" }
 */
authController.post('/logout', async (c) => {
    let body: unknown;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ message: 'Invalid JSON body' }, 400);
    }

    const { refreshToken } = (body ?? {}) as {
        refreshToken?: unknown;
    };

    // 验证刷新令牌
    if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
        return c.json({ message: 'refreshToken is required' }, 400);
    }

    // 注销（幂等操作，无论 token 是否有效都返回成功）
    await AuthService.logout(refreshToken.trim());

    return c.json({ message: 'Logged out successfully' });
});

export default authController;
