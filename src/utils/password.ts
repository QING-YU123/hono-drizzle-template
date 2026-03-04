import * as bcrypt from 'bcryptjs';

/**
 * 密码工具模块
 *
 * @description 提供密码哈希和验证功能，使用 bcrypt 算法
 * @module password
 */

const SALT_ROUNDS = 12;

/**
 * 哈希密码
 *
 * @description 使用 bcrypt 对明文密码进行哈希处理
 *              成本因子为 12，提供良好的安全性和性能平衡
 * @param {string} password - 明文密码
 * @returns {Promise<string>} 哈希后的密码
 * @throws {Error} 当哈希过程失败时
 *
 * @example
 * const hash = await hashPassword('myPassword123');
 * // 返回: '$2a$12$...'
 */
export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 验证密码
 *
 * @description 比对明文密码与哈希值是否匹配
 *              使用 bcrypt 的 constant-time 比较，防止时序攻击
 * @param {string} password - 明文密码
 * @param {string} hash - 密码哈希值
 * @returns {Promise<boolean>} 密码是否匹配
 *
 * @example
 * const isValid = await verifyPassword('myPassword123', '$2a$12$...');
 * // 返回: true 或 false
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}
