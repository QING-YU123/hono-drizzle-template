import { db } from '../index';
import { usersTable as users } from '../db/schema/users';
import { and, eq, isNull } from 'drizzle-orm';

export const UserService = {
    // 获取所有用户
    async getAllUsers() {
        return await db
            .select()
            .from(users)
            .where(isNull(users.deleted_at));
    },

    // 根据 ID 获取单个用户
    async getUserById(id: number) {
        const result = await db
            .select()
            .from(users)
            .where(and(eq(users.id, id), isNull(users.deleted_at)));
        return result[0] || null; // Drizzle 返回的是数组，这里取第一项
    },

    // 创建用户
    async createUser(data: { name: string; email: string }) {
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

    // 更新用户（部分更新）
    async updateUser(id: number, data: { name?: string; email?: string }) {
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

    // 删除用户（软删除）
    async deleteUser(id: number) {
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