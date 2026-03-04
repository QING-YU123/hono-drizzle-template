import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';

// 从 CommonJS 模块中解构导出
const { sign, verify } = jwt;

/**
 * JWT 配置
 */
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 分钟
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 天
const REFRESH_TOKEN_BYTES = 64;     // 生成 64 字节随机字符串

/**
 * JWT Payload 接口
 */
export interface JwtPayload {
    userId: number;
    email: string;
    isAdmin: boolean;
}

/**
 * JWT 工具模块
 *
 * @description 提供 JWT 签发、验证和刷新令牌生成功能
 * @module jwt
 */

/**
 * 生成访问令牌 (JWT)
 *
 * @description 为用户签发 JWT 访问令牌
 *              有效期为 15 分钟
 * @param {JwtPayload} payload - 用户信息负载
 * @returns {string} JWT 访问令牌
 * @throws {Error} 当签发失败时
 *
 * @example
 * const token = generateAccessToken({ userId: 1, email: 'user@example.com', isAdmin: false });
 */
export function generateAccessToken(payload: JwtPayload): string {
    return sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * 验证访问令牌
 *
 * @description 验证 JWT 令牌的有效性并解析负载
 * @param {string} token - JWT 访问令牌
 * @returns {JwtPayload | null} 解析后的用户信息，无效时返回 null
 *
 * @example
 * const payload = verifyAccessToken('eyJhbGciOiJIUzI1NiIs...');
 * if (payload) { console.log(payload.userId); }
 */
export function verifyAccessToken(token: string): JwtPayload | null {
    try {
        return verify(token, JWT_SECRET) as JwtPayload;
    } catch {
        return null;
    }
}

/**
 * 生成刷新令牌
 *
 * @description 生成安全的随机刷新令牌
 *              返回明文令牌和哈希值，明文返回给客户端，哈希值存储到数据库
 * @returns {{ token: string; hash: string }} 明文令牌和 SHA-256 哈希值
 *
 * @example
 * const { token, hash } = generateRefreshToken();
 * // token: 发送给客户端
 * // hash: 存储到 sessions 表
 */
export function generateRefreshToken(): { token: string; hash: string } {
    const token = randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
    const hash = createHash('sha256').update(token).digest('hex');
    return { token, hash };
}

/**
 * 哈希刷新令牌
 *
 * @description 计算刷新令牌的 SHA-256 哈希值
 *              用于与数据库中存储的哈希值进行比较
 * @param {string} token - 刷新令牌明文
 * @returns {string} SHA-256 哈希值
 *
 * @example
 * const hash = hashRefreshToken(clientToken);
 * const isValid = hash === storedHash;
 */
export function hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

/**
 * 计算刷新令牌过期时间
 *
 * @description 计算从当前时间起 7 天后的时间戳
 * @returns {Date} 过期时间
 *
 * @example
 * const expiresAt = getRefreshTokenExpiry();
 * // 存储到 sessions.expires_at
 */
export function getRefreshTokenExpiry(): Date {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return expiry;
}
