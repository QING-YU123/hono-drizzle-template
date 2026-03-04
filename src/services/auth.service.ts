import { db } from '../db';
import { usersTable, sessionsTable } from '../db/schema';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { UserService } from './user.service';
import {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken,
    verifyAccessToken,
    getRefreshTokenExpiry,
    type JwtPayload
} from '../utils/jwt';

/**
 * 认证服务类
 *
 * @description 处理用户认证相关的业务逻辑
 *              包括注册、登录、令牌刷新、注销等功能
 * @module AuthService
 */
export const AuthService = {
    /**
     * 用户注册
     *
     * @description 创建新用户账户
     *              邮箱必须唯一，密码将被安全哈希
     * @param {string} email - 用户邮箱
     * @param {string} password - 明文密码（最少 8 字符）
     * @param {string} [name] - 可选的用户名称
     * @returns {Promise<Object>} 创建的用户信息（不含密码）
     * @throws {Error} 当邮箱已存在时抛出错误
     *
     * @example
     * const user = await AuthService.register('user@example.com', 'password123', 'John');
     * // 返回: { id: 1, email: 'user@example.com', name: 'John', ... }
     */
    async register(email: string, password: string, name?: string): Promise<any> {
        // 检查邮箱是否已存在
        const existingUser = await UserService.findByEmail(email);
        if (existingUser) {
            throw new Error('Email already exists');
        }

        // 创建用户
        const userName = name?.trim() || email.split('@')[0];
        const user = await UserService.createUserWithPassword({
            name: userName,
            email: email.trim(),
            password,
        });

        return user;
    },

    /**
     * 用户登录
     *
     * @description 验证用户身份并签发令牌
     *              返回 JWT 访问令牌和刷新令牌
     * @param {string} email - 用户邮箱
     * @param {string} password - 明文密码
     * @returns {Promise<Object>} 登录结果，包含令牌和用户信息
     * @throws {Error} 当邮箱或密码错误时抛出错误
     *
     * @example
     * const result = await AuthService.login('user@example.com', 'password123');
     * // 返回: { accessToken: '...', refreshToken: '...', user: {...} }
     */
    async login(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: any;
    }> {
        // 验证用户凭据
        const user = await UserService.verifyCredentials(email, password);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // 生成 JWT 访问令牌
        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
            isAdmin: user.is_admin,
        };
        const accessToken = generateAccessToken(payload);

        // 生成刷新令牌
        const { token: refreshToken, hash: refreshTokenHash } = generateRefreshToken();
        const expiresAt = getRefreshTokenExpiry();

        // 存储 session（软删除已存在的 session，实现单设备登录）
        await db
            .update(sessionsTable)
            .set({ deleted_at: new Date() })
            .where(and(
                eq(sessionsTable.user_id, user.id),
                isNull(sessionsTable.deleted_at)
            ));

        // 创建新 session
        await db.insert(sessionsTable).values({
            user_id: user.id,
            refresh_token_hash: refreshTokenHash,
            expires_at: expiresAt,
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };
    },

    /**
     * 刷新访问令牌
     *
     * @description 使用刷新令牌获取新的访问令牌
     *              刷新令牌会轮换（生成新的）
     * @param {string} refreshToken - 刷新令牌
     * @returns {Promise<Object>} 新的令牌对
     * @throws {Error} 当刷新令牌无效或过期时抛出错误
     *
     * @example
     * const result = await AuthService.refresh('old-refresh-token');
     * // 返回: { accessToken: '...', refreshToken: '...' }
     */
    async refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        // 计算刷新令牌哈希
        const tokenHash = hashRefreshToken(refreshToken);

        // 查找有效的 session
        const sessions = await db
            .select()
            .from(sessionsTable)
            .where(
                and(
                    eq(sessionsTable.refresh_token_hash, tokenHash),
                    isNull(sessionsTable.deleted_at),
                    gt(sessionsTable.expires_at, new Date())
                )
            );

        const session = sessions[0];
        if (!session) {
            throw new Error('Invalid or expired refresh token');
        }

        // 获取用户信息
        const userResult = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, session.user_id));
        const user = userResult[0];
        if (!user) {
            throw new Error('User not found');
        }

        // 生成新的访问令牌
        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
            isAdmin: user.is_admin,
        };
        const accessToken = generateAccessToken(payload);

        // 轮换刷新令牌（生成新的）
        const { token: newRefreshToken, hash: newRefreshTokenHash } = generateRefreshToken();
        const expiresAt = getRefreshTokenExpiry();

        // 软删除旧的 session，创建新的
        await db
            .update(sessionsTable)
            .set({ deleted_at: new Date() })
            .where(eq(sessionsTable.id, session.id));

        await db.insert(sessionsTable).values({
            user_id: user.id,
            refresh_token_hash: newRefreshTokenHash,
            expires_at: expiresAt,
        });

        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    },

    /**
     * 注销登录
     *
     * @description 删除指定的刷新令牌会话
     *              支持幂等操作，重复注销返回成功
     * @param {string} refreshToken - 刷新令牌
     * @returns {Promise<boolean>} 是否成功注销
     *
     * @example
     * await AuthService.logout('refresh-token');
     * // 返回: true
     */
    async logout(refreshToken: string): Promise<boolean> {
        const tokenHash = hashRefreshToken(refreshToken);

        // 软删除对应的 session
        const result = await db
            .update(sessionsTable)
            .set({ deleted_at: new Date() })
            .where(
                and(
                    eq(sessionsTable.refresh_token_hash, tokenHash),
                    isNull(sessionsTable.deleted_at)
                )
            )
            .returning();

        return result.length > 0;
    },

    /**
     * 验证访问令牌
     *
     * @description 解析并验证 JWT 访问令牌
     * @param {string} token - JWT 访问令牌
     * @returns {JwtPayload | null} 解析后的用户信息，无效时返回 null
     *
     * @example
     * const payload = await AuthService.verifyToken('eyJhbGciOiJIUzI1NiIs...');
     * if (payload) { console.log('用户 ID:', payload.userId); }
     */
    async verifyToken(token: string): Promise<JwtPayload | null> {
        return verifyAccessToken(token);
    },

    /**
     * 根据令牌获取用户信息
     *
     * @description 使用 JWT 访问令牌获取完整的用户信息
     *              用于 /user/me 等需要当前用户信息的接口
     * @param {string} token - JWT 访问令牌
     * @returns {Promise<Object | null>} 用户信息，令牌无效时返回 null
     *
     * @example
     * const user = await AuthService.getUserByToken('eyJhbGciOiJIUzI1NiIs...');
     * if (user) { console.log('当前用户:', user); }
     */
    async getUserByToken(token: string): Promise<any> {
        const payload = await this.verifyToken(token);
        if (!payload) {
            return null;
        }

        const result = await db
            .select({
                id: usersTable.id,
                name: usersTable.name,
                email: usersTable.email,
                is_admin: usersTable.is_admin,
                created_at: usersTable.created_at,
                updated_at: usersTable.updated_at,
            })
            .from(usersTable)
            .where(eq(usersTable.id, payload.userId));

        return result[0] || null;
    }
};
