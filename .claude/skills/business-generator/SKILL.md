---
name: business-generator
description: 编写业务逻辑代码。基于现有项目的编码风格和业务模式，设计并实现 Controller 和 Service 层的业务逻辑，遵循 RESTful API 规范和 JSDoc 注释标准。
---

# 业务逻辑编写器

这个技能帮助你设计和实现业务逻辑代码，遵循现有项目的编码风格和架构模式。

## 🎯 工作流程

### 第一阶段：项目分析（必做）
在开始任何工作之前，**必须先完整分析当前项目状态**：

#### 1. 分析数据表结构
```bash
# 读取所有 schema 文件
Read src/db/schema/*.ts
Read src/db/schema/plugin/*.ts
```

**分析要点：**
- 有哪些数据表
- 每个表的字段定义和约束
- 表之间的关系（外键）
- 软删除字段（deleted_at）
- 时间戳字段（created_at, updated_at）

#### 2. 分析现有业务代码
```bash
# 读取所有 controller 文件
Read src/controllers/*.ts

# 读取所有 service 文件
Read src/services/*.ts

# 了解路由配置
Read src/index.ts
```

**分析要点：**
- Controller 编码风格和结构
- Service 层的业务逻辑处理方式
- 参数验证模式
- 错误处理方式
- 响应格式
- 软删除过滤的实现
- 数据库操作方式（Drizzle ORM 使用）

#### 3. 总结项目状态
```
当前项目数据库表：
- [列出所有表及其主要字段]

当前业务接口：
- [列出所有现有接口及其功能]

编码风格总结：
- Controller 风格：[总结]
- Service 风格：[总结]
- 参数验证：[总结]
- 错误处理：[总结]
- 响应格式：[总结]
```

### 第二阶段：需求理解（Plan 模式）
当用户提供业务需求时，**不要立即编码**，先进入计划模式：

#### 1. 理解业务需求
用户提供的内容应该包括：
- 业务描述（有序或无序列表）
- 涉及的数据表
- 接口期望

#### 2. 分析设计合理性
结合当前项目分析结果，思考：
- 业务设计是否合理？
- 是否与现有业务冲突？
- 是否需要额外的数据表？
- 接口设计是否符合 RESTful 规范？
- 是否需要考虑软删除？
- 是否需要事务处理？
- 是否需要权限控制？

#### 3. 提出疑问和理解
如果存在任何疑问，必须向用户提出：
- 业务逻辑不清晰的地方
- 接口设计的疑问
- 数据库操作的疑问
- 错误处理的疑问
- 特殊场景的处理

#### 4. 反馈设计方案
将以下内容反馈给用户等待确认：

**接口设计方案：**
```
业务 1：[业务名称]
- 接口 1：[HTTP 方法] /api/[路径]
  - 功能描述：[描述]
  - 输入参数：[参数列表和验证规则]
  - 数据库影响：[影响的表和字段]
  - 响应格式：[响应数据结构]
  - 错误处理：[可能的错误情况]

业务 2：[业务名称]
...
```

**实现说明：**
- 涉及的 Controller：[文件名]
- 涉及的 Service：[文件名]
- 是否需要修改现有代码：[是/否，说明原因]
- 特殊处理逻辑：[说明]

### 第三阶段：代码实现（Agent 模式）
用户确认方案后，开始编写代码：

#### 1. 编写原则
- ⚠️ **只能修改** `src/controllers/` 和 `src/services/` 目录下的文件
- ⚠️ **不能修改** 数据表定义（必须与用户讨论）
- ⚠️ **不能修改** 其他文件（必须与用户讨论并获得授权）
- ✅ **必须添加** JSDoc 风格注释
- ✅ **必须使用** RESTful API 命名
- ✅ **必须遵循** 现有编码风格

#### 2. 代码注释规范（JSDoc）
```typescript
/**
 * [简要描述功能]
 *
 * @description [详细描述业务逻辑、处理流程、注意事项]
 * @param {类型} 参数名 - [参数说明]
 * @returns {类型} [返回值说明]
 * @throws {错误类型} [可能抛出的错误及原因]
 *
 * @example
 * // 使用示例
 * const result = await functionName(params);
 */
```

#### 3. RESTful API 命名规范
```typescript
// 资源命名：使用复数名词
GET    /api/users          // 获取所有用户
GET    /api/users/:id      // 获取单个用户
POST   /api/users          // 创建用户
PUT    /api/users/:id      // 更新用户
DELETE /api/users/:id      // 删除用户

// 嵌套资源
GET    /api/users/:id/posts        // 获取用户的文章
POST   /api/users/:id/posts        // 为用户创建文章

// 特殊操作
POST   /api/users/:id/activate     // 激活用户
POST   /api/users/:id/deactivate   // 停用用户
```

#### 4. 参数确认清单
在编写代码前，必须与用户确认：
- [ ] 每个接口接受哪些输入参数
- [ ] 参数的验证规则（必填、类型、格式等）
- [ ] 参数的默认值
- [ ] 每个接口影响哪些数据库字段
- [ ] 是否需要事务处理
- [ ] 错误情况的响应方式

## 📋 实施检查清单

### 计划阶段检查
- [ ] 已完成项目分析（schema、controllers、services）
- [ ] 已理解用户的业务需求
- [ ] 已分析设计的合理性
- [ ] 已提出所有疑问并与用户讨论
- [ ] 已反馈完整的设计方案
- [ ] 已获得用户的确认或修改意见

### 实现阶段检查
- [ ] 确认每个接口的输入参数
- [ ] 确认每个接口的数据库影响
- [ ] 只修改 controllers 和 services 目录
- [ ] 添加了完整的 JSDoc 注释
- [ ] 遵循 RESTful API 命名规范
- [ ] 遵循现有编码风格
- [ ] 处理了软删除过滤（如需要）
- [ ] 处理了错误情况
- [ ] 响应格式与现有接口一致

## 🚨 约束和规则

### ⚠️ 绝对不能做的
- **不能修改**数据表定义（schema 文件）
- **不能修改**配置文件（如 index.ts，除非获得明确授权）
- **不能修改**其他目录的文件
- **不能自行决定**业务逻辑（必须与用户确认）
- **不能跳过**计划阶段直接编码

### ✅ 必须做的
- **必须先**完整分析项目状态
- **必须先**理解并讨论业务需求
- **必须先**反馈设计方案等待确认
- **必须使用** JSDoc 注释
- **必须遵循** RESTful API 规范
- **必须遵循**现有编码风格
- **必须处理**软删除过滤（如果项目使用）
- **必须确认**每个接口的输入和输出

## 📝 示例对话

### 用户：我需要实现一个文章管理功能

**AI（计划模式）：**
好的，我来帮你实现文章管理功能。让我先分析一下当前项目的情况。

**[项目分析阶段]**
正在读取 schema 文件...
正在分析现有业务代码...

**分析完成。当前项目状态：**
- 数据库表：users 表（id, name, email, timestamps）
- 现有接口：用户的 CRUD 操作
- 编码风格：[总结发现的风格]

现在让我了解你的需求：

1. **文章表设计**：
   - 是否已经有 articles 表？还是需要创建？
   - 如果已有，请告诉我表的字段定义

2. **业务需求**：
   - 你需要实现哪些具体的业务功能？
   - 比如：创建文章、获取文章列表、获取单篇文章、更新文章、删除文章等

3. **关联关系**：
   - 文章是否需要关联用户（作者）？
   - 是否需要分类、标签等功能？
   - 是否需要评论功能？

4. **特殊需求**：
   - 文章是否需要草稿/发布状态？
   - 是否需要文章搜索功能？
   - 是否需要文章统计（浏览量、点赞等）？

请告诉我这些信息，我会设计详细的实现方案。

### 用户：需要创建 articles 表，字段有 title, content, author_id, status, view_count

**AI（计划模式）：**
明白了。让我继续了解：

1. **articles 表的字段确认**：
   - `title`：varchar(255) 是否足够？
   - `content`：使用 text 类型？
   - `author_id`：外键关联 users 表，删除文章时是否级联删除用户？还是设为 null？
   - `status`：有哪些状态？比如 draft, published, archived？
   - `view_count`：integer 类型，默认值为 0？

2. **业务功能确认**：
   你需要实现以下功能吗？
   - 创建文章（POST /api/articles）
   - 获取文章列表（GET /api/articles）
   - 获取单篇文章（GET /api/articles/:id）
   - 更新文章（PUT /api/articles/:id）
   - 删除文章（DELETE /api/articles/:id）
   - 获取某作者的所有文章（GET /api/users/:id/articles）
   - 按状态筛选文章（GET /api/articles?status=published）
   - 还需要其他功能吗？

3. **接口输入参数确认**：
   - 创建文章：title, content, author_id（必填？），status（默认值？）
   - 更新文章：哪些字段可以更新？
   - 获取文章列表：是否需要分页？排序方式？

4. **软删除处理**：
   - 项目使用了软删除（deleted_at），文章表也需要吗？
   - 删除文章是软删除还是物理删除？

5. **权限控制**：
   - 任何人都可以创建文章吗？
   - 是否只能修改自己的文章？
   - 是否需要登录验证？

请详细说明这些需求，我会给你一个完整的设计方案。

### 用户：确认设计方案

**AI（Agent 模式）：**
好的，我现在开始编写代码。

**设计方案总结：**
- 创建 `src/controllers/article.controller.ts`
- 创建 `src/services/article.service.ts`
- 更新 `src/index.ts` 添加文章路由

**[开始编写代码...]**
```

## 🛠️ 技术实现要点

### Controller 层实现模式
```typescript
import { Hono } from 'hono';
import { ArticleService } from '../services/article.service';

const articleController = new Hono();

/**
 * 获取所有文章
 */
articleController.get('/', async (c) => {
    const data = await ArticleService.getAllArticles();
    return c.json(data);
});

/**
 * 根据 ID 获取文章
 */
articleController.get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id <= 0) {
        return c.json({ message: 'Invalid id' }, 400);
    }

    const data = await ArticleService.getArticleById(id);
    if (!data) {
        return c.json({ message: 'Article not found' }, 404);
    }
    return c.json(data);
});

/**
 * 创建文章
 */
articleController.post('/', async (c) => {
    let body: unknown;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ message: 'Invalid JSON body' }, 400);
    }

    const { title, content, authorId } = (body ?? {}) as {
        title?: unknown;
        content?: unknown;
        authorId?: unknown;
    };

    // 参数验证
    if (typeof title !== 'string' || title.trim().length === 0) {
        return c.json({ message: 'title is required' }, 400);
    }
    if (typeof content !== 'string' || content.trim().length === 0) {
        return c.json({ message: 'content is required' }, 400);
    }
    if (typeof authorId !== 'number' || !Number.isInteger(authorId) || authorId <= 0) {
        return c.json({ message: 'authorId must be a positive integer' }, 400);
    }

    try {
        const data = await ArticleService.createArticle({
            title: title.trim(),
            content: content.trim(),
            authorId,
        });
        return c.json(data, 201);
    } catch (err) {
        // 处理外键约束错误
        if (typeof err === 'object' && err && 'code' in err && (err as any).code === '23503') {
            return c.json({ message: 'Author not found' }, 404);
        }
        throw err;
    }
});

/**
 * 更新文章
 */
articleController.put('/:id', async (c) => {
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

    const { title, content, status } = (body ?? {}) as {
        title?: unknown;
        content?: unknown;
        status?: unknown;
    };

    const payload: {
        title?: string;
        content?: string;
        status?: string;
    } = {};

    if (title !== undefined) {
        if (typeof title !== 'string' || title.trim().length === 0) {
            return c.json({ message: 'title must be a non-empty string' }, 400);
        }
        payload.title = title.trim();
    }

    if (content !== undefined) {
        if (typeof content !== 'string' || content.trim().length === 0) {
            return c.json({ message: 'content must be a non-empty string' }, 400);
        }
        payload.content = content.trim();
    }

    if (status !== undefined) {
        if (typeof status !== 'string' || ['draft', 'published', 'archived'].includes(status)) {
            return c.json({ message: 'status must be draft, published, or archived' }, 400);
        }
        payload.status = status;
    }

    if (Object.keys(payload).length === 0) {
        return c.json({ message: 'Nothing to update' }, 400);
    }

    try {
        const data = await ArticleService.updateArticle(id, payload);
        if (!data) {
            return c.json({ message: 'Article not found' }, 404);
        }
        return c.json(data);
    } catch (err) {
        if (typeof err === 'object' && err && 'code' in err && (err as any).code === '23503') {
            return c.json({ message: 'Author not found' }, 404);
        }
        throw err;
    }
});

/**
 * 删除文章（软删除）
 */
articleController.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id <= 0) {
        return c.json({ message: 'Invalid id' }, 400);
    }

    const data = await ArticleService.deleteArticle(id);
    if (!data) {
        return c.json({ message: 'Article not found' }, 404);
    }

    return c.json({ message: 'Deleted', data });
});

export default articleController;
```

### Service 层实现模式
```typescript
import { db } from '../db';
import { articlesTable, usersTable } from '../db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';

/**
 * 文章服务类
 */
export class ArticleService {
    /**
     * 获取所有文章
     *
     * @description 从数据库获取所有未被软删除的文章，按创建时间倒序排列
     * @returns {Promise<Array>} 文章列表，包含文章信息和作者信息
     *
     * @example
     * const articles = await ArticleService.getAllArticles();
     */
    static async getAllArticles(): Promise<Array<any>> {
        const articles = await db
            .select({
                id: articlesTable.id,
                title: articlesTable.title,
                content: articlesTable.content,
                status: articlesTable.status,
                viewCount: articlesTable.viewCount,
                createdAt: articlesTable.createdAt,
                updatedAt: articlesTable.updatedAt,
                author: {
                    id: usersTable.id,
                    name: usersTable.name,
                    email: usersTable.email,
                },
            })
            .from(articlesTable)
            .leftJoin(usersTable, eq(articlesTable.authorId, usersTable.id))
            .where(isNull(articlesTable.deletedAt))
            .orderBy(desc(articlesTable.createdAt));

        return articles;
    }

    /**
     * 根据 ID 获取文章
     *
     * @description 获取指定 ID 的文章，如果文章不存在或已被软删除则返回 null
     * @param {number} id - 文章 ID
     * @returns {Promise<Object|null>} 文章对象或 null
     * @throws {Error} 当 id 无效时抛出错误
     *
     * @example
     * const article = await ArticleService.getArticleById(1);
     */
    static async getArticleById(id: number): Promise<any> {
        const articles = await db
            .select({
                id: articlesTable.id,
                title: articlesTable.title,
                content: articlesTable.content,
                status: articlesTable.status,
                viewCount: articlesTable.viewCount,
                createdAt: articlesTable.createdAt,
                updatedAt: articlesTable.updatedAt,
                author: {
                    id: usersTable.id,
                    name: usersTable.name,
                    email: usersTable.email,
                },
            })
            .from(articlesTable)
            .leftJoin(usersTable, eq(articlesTable.authorId, usersTable.id))
            .where(and(
                eq(articlesTable.id, id),
                isNull(articlesTable.deletedAt)
            ));

        return articles[0] || null;
    }

    /**
     * 创建文章
     *
     * @description 创建新文章，自动设置默认值和当前时间戳
     * @param {Object} data - 文章数据
     * @param {string} data.title - 文章标题
     * @param {string} data.content - 文章内容
     * @param {number} data.authorId - 作者 ID
     * @returns {Promise<Object>} 创建的文章对象
     * @throws {Error} 当作者不存在时抛出外键约束错误
     *
     * @example
     * const article = await ArticleService.createArticle({
     *   title: '我的第一篇文章',
     *   content: '文章内容',
     *   authorId: 1
     * });
     */
    static async createArticle(data: {
        title: string;
        content: string;
        authorId: number;
    }): Promise<any> {
        const result = await db
            .insert(articlesTable)
            .values({
                title: data.title,
                content: data.content,
                authorId: data.authorId,
                status: 'draft',
                viewCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return this.getArticleById(result[0].id);
    }

    /**
     * 更新文章
     *
     * @description 更新指定 ID 的文章，只更新提供的字段
     * @param {number} id - 文章 ID
     * @param {Object} data - 要更新的字段
     * @param {string} [data.title] - 新的标题
     * @param {string} [data.content] - 新的内容
     * @param {string} [data.status] - 新的状态
     * @returns {Promise<Object|null>} 更新后的文章对象，如果文章不存在则返回 null
     *
     * @example
     * const updated = await ArticleService.updateArticle(1, {
     *   title: '更新后的标题',
     *   status: 'published'
     * });
     */
    static async updateArticle(
        id: number,
        data: {
            title?: string;
            content?: string;
            status?: string;
        }
    ): Promise<any> {
        const result = await db
            .update(articlesTable)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(articlesTable.id, id))
            .returning();

        if (result.length === 0) {
            return null;
        }

        return this.getArticleById(id);
    }

    /**
     * 删除文章（软删除）
     *
     * @description 将文章标记为已删除，而不是从数据库中物理删除
     * @param {number} id - 文章 ID
     * @returns {Promise<Object|null>} 被删除的文章对象，如果文章不存在则返回 null
     *
     * @example
     * const deleted = await ArticleService.deleteArticle(1);
     */
    static async deleteArticle(id: number): Promise<any> {
        const article = await this.getArticleById(id);
        if (!article) {
            return null;
        }

        await db
            .update(articlesTable)
            .set({
                deletedAt: new Date(),
            })
            .where(eq(articlesTable.id, id));

        return article;
    }
}
```

## 🔗 复杂业务场景处理

### 多表关联查询
```typescript
/**
 * 获取文章及其评论
 */
static async getArticleWithComments(id: number) {
    const article = await this.getArticleById(id);
    if (!article) {
        return null;
    }

    const comments = await db
        .select()
        .from(commentsTable)
        .where(and(
            eq(commentsTable.articleId, id),
            isNull(commentsTable.deletedAt)
        ));

    return {
        ...article,
        comments,
    };
}
```

### 事务处理
```typescript
/**
 * 创建文章并自动发布（需要事务）
 */
static async createAndPublishArticle(data: {
    title: string;
    content: string;
    authorId: number;
}) {
    // 使用 Drizzle 的事务处理
    // 注意：需要根据实际项目的事务处理方式调整
    return await db.transaction(async (tx) => {
        const [article] = await tx
            .insert(articlesTable)
            .values({
                title: data.title,
                content: data.content,
                authorId: data.authorId,
                status: 'published',
                viewCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        // 记录文章发布日志
        await tx.insert(articleLogsTable).values({
            articleId: article.id,
            action: 'publish',
            createdAt: new Date(),
        });

        return article;
    });
}
```

### 复杂查询和筛选
```typescript
/**
 * 根据条件筛选文章
 */
static async getArticlesByFilter(filters: {
    status?: string;
    authorId?: number;
    search?: string;
    limit?: number;
    offset?: number;
}) {
    const conditions = [isNull(articlesTable.deletedAt)];

    if (filters.status) {
        conditions.push(eq(articlesTable.status, filters.status));
    }

    if (filters.authorId) {
        conditions.push(eq(articlesTable.authorId, filters.authorId));
    }

    if (filters.search) {
        // 使用 ilike 进行不区分大小写的模糊搜索
        conditions.push(
            or(
                ilike(articlesTable.title, `%${filters.search}%`),
                ilike(articlesTable.content, `%${filters.search}%`)
            )
        );
    }

    const articles = await db
        .select()
        .from(articlesTable)
        .where(and(...conditions))
        .orderBy(desc(articlesTable.createdAt))
        .limit(filters.limit || 10)
        .offset(filters.offset || 0);

    return articles;
}
```

## 📦 路由注册
```typescript
// src/index.ts
import articleController from './controllers/article.controller';

// 注册文章路由
app.route('/api/articles', articleController);
```