import { Hono } from 'hono';
import { UserService } from '../services/user.service';

/**
 * 用户控制器
 *
 * @description 处理用户相关的 HTTP 请求，包括用户的增删改查操作
 *              遵循 RESTful API 设计规范
 * @module UserController
 */

const userController = new Hono();

/**
 * 获取所有用户
 *
 * @description 获取所有未被软删除的用户列表
 * @route GET /api/users
 * @returns {Promise<Object>} JSON 响应，包含用户数组
 * @throws {Error} 数据库查询错误
 *
 * @example
 * // GET /api/users
 * // Response: [{ id: 1, name: "John", email: "john@example.com" }, ...]
 */
userController.get('/', async (c) => {
    const data = await UserService.getAllUsers();
    return c.json(data);
});

/**
 * 根据 ID 获取用户
 *
 * @description 获取指定 ID 的用户信息，如果用户不存在或已被软删除则返回 404
 * @route GET /api/users/:id
 * @param {number} id - 用户 ID
 * @returns {Promise<Object>} JSON 响应，包含用户信息
 * @throws {400} 当 ID 格式无效时
 * @throws {404} 当用户不存在时
 *
 * @example
 * // GET /api/users/1
 * // Response: { id: 1, name: "John", email: "john@example.com" }
 */
userController.get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id <= 0) {
        return c.json({ message: 'Invalid id' }, 400);
    }

    const data = await UserService.getUserById(id);
    if (!data) {
        return c.json({ message: 'User not found' }, 404);
    }
    return c.json(data);
});

/**
 * 创建用户
 *
 * @description 创建新用户，需要提供 name 和 email 字段
 * @route POST /api/users
 * @param {Object} body - 请求体
 * @param {string} body.name - 用户名称（必填，非空字符串）
 * @param {string} body.email - 用户邮箱（必填，非空字符串）
 * @returns {Promise<Object>} JSON 响应，包含创建的用户信息，HTTP 状态码 201
 * @throws {400} 当 JSON 格式无效或参数验证失败时
 * @throws {409} 当邮箱已存在时（违反唯一约束）
 *
 * @example
 * // POST /api/users
 * // Body: { "name": "John Doe", "email": "john@example.com" }
 * // Response: { id: 1, name: "John Doe", "email": "john@example.com", ... }
 */
userController.post('/', async (c) => {
    let body: unknown;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ message: 'Invalid JSON body' }, 400);
    }

    const { name, email } = (body ?? {}) as { name?: unknown; email?: unknown };
    if (typeof name !== 'string' || name.trim().length === 0) {
        return c.json({ message: 'name is required' }, 400);
    }
    if (typeof email !== 'string' || email.trim().length === 0) {
        return c.json({ message: 'email is required' }, 400);
    }

    try {
        const data = await UserService.createUser({
            name: name.trim(),
            email: email.trim(),
        });
        return c.json(data, 201);
    } catch (err) {
        // Postgres unique_violation
        if (typeof err === 'object' && err && 'code' in err && (err as any).code === '23505') {
            return c.json({ message: 'Email already exists' }, 409);
        }
        throw err;
    }
});

/**
 * 更新用户
 *
 * @description 部分更新指定 ID 的用户信息，只更新提供的字段
 * @route PUT /api/users/:id
 * @param {number} id - 用户 ID
 * @param {Object} body - 请求体
 * @param {string} [body.name] - 新的用户名称（可选）
 * @param {string} [body.email] - 新的用户邮箱（可选）
 * @returns {Promise<Object>} JSON 响应，包含更新后的用户信息
 * @throws {400} 当 ID 格式无效、JSON 格式无效、参数验证失败或没有字段需要更新时
 * @throws {404} 当用户不存在时
 * @throws {409} 当邮箱已存在时（违反唯一约束）
 *
 * @example
 * // PUT /api/users/1
 * // Body: { "name": "Jane Doe" }
 * // Response: { id: 1, name: "Jane Doe", "email": "john@example.com", ... }
 */
userController.put('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id <= 0) {
        return c.json({ message: 'Invalid id' }, 400);
    }

    let body: unknown;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ message: 'Invalid JSON body' }, 400);
    }

    const { name, email } = (body ?? {}) as { name?: unknown; email?: unknown };
    const payload: { name?: string; email?: string } = {};

    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
            return c.json({ message: 'name must be a non-empty string' }, 400);
        }
        payload.name = name.trim();
    }

    if (email !== undefined) {
        if (typeof email !== 'string' || email.trim().length === 0) {
            return c.json({ message: 'email must be a non-empty string' }, 400);
        }
        payload.email = email.trim();
    }

    if (!payload.name && !payload.email) {
        return c.json({ message: 'Nothing to update' }, 400);
    }

    try {
        const data = await UserService.updateUser(id, payload);
        if (!data) {
            return c.json({ message: 'User not found' }, 404);
        }
        return c.json(data);
    } catch (err) {
        if (typeof err === 'object' && err && 'code' in err && (err as any).code === '23505') {
            return c.json({ message: 'Email already exists' }, 409);
        }
        throw err;
    }
});

/**
 * 删除用户（软删除）
 *
 * @description 将指定 ID 的用户标记为已删除，而不是从数据库中物理删除
 *              软删除后的用户将不会出现在 getAllUsers 的结果中
 * @route DELETE /api/users/:id
 * @param {number} id - 用户 ID
 * @returns {Promise<Object>} JSON 响应，包含被删除的用户信息和确认消息
 * @throws {400} 当 ID 格式无效时
 * @throws {404} 当用户不存在时
 *
 * @example
 * // DELETE /api/users/1
 * // Response: { message: "Deleted", data: { id: 1, name: "John", ... } }
 */
userController.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id <= 0) {
        return c.json({ message: 'Invalid id' }, 400);
    }

    const data = await UserService.deleteUser(id);
    if (!data) {
        return c.json({ message: 'User not found' }, 404);
    }

    return c.json({ message: 'Deleted', data });
});

export default userController;
