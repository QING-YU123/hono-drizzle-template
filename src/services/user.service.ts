import { db } from '../db';
import { usersTable as users } from '../db/schema/users';
import { and, eq, isNull } from 'drizzle-orm';

/**
 * 用户服务类
 *
 * @description 处理用户相关的业务逻辑和数据库操作
 *              使用 Drizzle ORM 进行数据库查询
 *              实现软删除模式，确保已删除用户不会出现在正常查询结果中
 * @module UserService
 */
export const UserService = {
    /**
     * 获取所有用户
     *
     * @description 从数据库获取所有未被软删除的用户列表
     *              使用软删除过滤（deleted_at IS NULL）
     * @returns {Promise<Array<Object>>} 用户对象数组，包含所有字段
     * @throws {Error} 数据库查询错误
     *
     * @example
     * const allUsers = await UserService.getAllUsers();
     * // 返回: [{ id: 1, name: "John", email: "john@example.com", created_at: ..., ... }, ...]
     */
    async getAllUsers(): Promise<Array<any>> {
        return await db
            .select()
            .from(users)
            .where(isNull(users.deleted_at));
    },

    /**
     * 根据 ID 获取单个用户
     *
     * @description 获取指定 ID 的用户信息
     *              只返回未被软删除的用户
     *              如果用户不存在或已被软删除，返回 null
     * @param {number} id - 用户 ID（必须为正整数）
     * @returns {Promise<Object|null>} 用户对象或 null
     * @throws {Error} 数据库查询错误
     *
     * @example
     * const user = await UserService.getUserById(1);
     * // 返回: { id: 1, name: "John", email: "john@example.com", ... }
     *
     * const notFound = await UserService.getUserById(999);
     * // 返回: null
     */
    async getUserById(id: number): Promise<any> {
        const result = await db
            .select()
            .from(users)
            .where(and(eq(users.id, id), isNull(users.deleted_at)));
        return result[0] || null; // Drizzle 返回的是数组，这里取第一项
    },

    /**
     * 创建用户
     *
     * @description 在数据库中创建新用户
     *              自动设置 updated_at 为当前时间
     *              created_at 由数据库默认值设置
     * @param {Object} data - 用户数据
     * @param {string} data.name - 用户名称
     * @param {string} data.email - 用户邮箱（必须唯一）
     * @returns {Promise<Object>} 创建的用户对象（包含所有字段，包括自动生成的 ID）
     * @throws {Error} 数据库插入错误（如邮箱重复、约束违反等）
     *
     * @example
     * const newUser = await UserService.createUser({
     *   name: "John Doe",
     *   email: "john@example.com"
     * });
     * // 返回: { id: 1, name: "John Doe", email: "john@example.com", created_at: ..., ... }
     */
    async createUser(data: { name: string; email: string }): Promise<any> {
        // returning() 是 Drizzle 的特性，插入后直接返回新行数据
        const result = await db
            .insert(users)
            .values({
                ...data,
                updated_at: new Date(),
            })
            .returning();
        return result[0];
    },

    /**
     * 更新用户（部分更新）
     *
     * @description 更新指定 ID 的用户信息
     *              只更新提供的字段（name 或 email）
     *              自动设置 updated_at 为当前时间
     *              只能更新未被软删除的用户
     * @param {number} id - 用户 ID（必须为正整数）
     * @param {Object} data - 要更新的字段
     * @param {string} [data.name] - 新的用户名称（可选）
     * @param {string} [data.email] - 新的用户邮箱（可选，必须唯一）
     * @returns {Promise<Object|null>} 更新后的用户对象，如果用户不存在则返回 null
     * @throws {Error} 数据库更新错误（如邮箱重复、约束违反等）
     *
     * @example
     * // 只更新名称
     * const updated = await UserService.updateUser(1, { name: "Jane Doe" });
     * // 返回: { id: 1, name: "Jane Doe", email: "john@example.com", ... }
     *
     * // 只更新邮箱
     * const updated = await UserService.updateUser(1, { email: "jane@example.com" });
     *
     * // 更新多个字段
     * const updated = await UserService.updateUser(1, {
     *   name: "Jane Doe",
     *   email: "jane@example.com"
     * });
     *
     * // 用户不存在
     * const notFound = await UserService.updateUser(999, { name: "Test" });
     * // 返回: null
     */
    async updateUser(id: number, data: { name?: string; email?: string }): Promise<any> {
        const result = await db
            .update(users)
            .set({
                ...data,
                updated_at: new Date(),
            })
            .where(and(eq(users.id, id), isNull(users.deleted_at)))
            .returning();
        return result[0] || null;
    },

    /**
     * 删除用户（软删除）
     *
     * @description 将指定 ID 的用户标记为已删除
     *              设置 deleted_at 和 updated_at 为当前时间
     *              被软删除的用户不会出现在 getAllUsers 和 getUserById 的结果中
     *              数据不会从数据库中物理删除
     * @param {number} id - 用户 ID（必须为正整数）
     * @returns {Promise<Object|null>} 被删除的用户对象，如果用户不存在则返回 null
     * @throws {Error} 数据库更新错误
     *
     * @example
     * const deleted = await UserService.deleteUser(1);
     * // 返回: { id: 1, name: "John", email: "john@example.com", deleted_at: "2024-...", ... }
     *
     * const notFound = await UserService.deleteUser(999);
     * // 返回: null
     *
     * // 软删除后无法通过正常查询找到
     * await UserService.getUserById(1); // 返回: null
     */
    async deleteUser(id: number): Promise<any> {
        const result = await db
            .update(users)
            .set({
                deleted_at: new Date(),
                updated_at: new Date(),
            })
            .where(and(eq(users.id, id), isNull(users.deleted_at)))
            .returning();
        return result[0] || null;
    }
};
