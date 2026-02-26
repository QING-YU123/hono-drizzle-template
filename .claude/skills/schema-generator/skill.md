---
name: schema-generator
description: 设计和创建 Drizzle ORM 数据库表结构。基于现有项目的编码风格，帮助用户设计新的数据库 schema，考虑表间关系和业务需求。
---

# 数据库表结构设计器

这个技能帮助你设计和创建新的数据库表结构，基于项目现有的编码风格和架构模式。

## 📋 项目分析（动态读取）

### ⚠️ 重要：每次使用前必须先分析当前项目

在开始设计新表之前，**必须先读取并分析当前项目的实际状态**：

#### 1. 分析现有 Schema 编码风格
```bash
# 读取现有的 schema 文件
Read src/db/schema/*.ts
```

**分析要点：**
- 主键定义方式（是否使用 `generatedAlwaysAsIdentity()`）
- 字符串字段长度规范
- 是否使用 timestamps 插件
- 时间戳字段的具体定义（`created_at`, `updated_at`, `deleted_at`）
- 外键引用的写法
- 约束条件的表达方式

#### 2. 分析现有数据库表
```bash
# 扫描 schema 目录，了解现有表结构
Glob src/db/schema/*.ts
Read src/db/schema/plugin/*.ts  # 如果存在插件文件
```

**分析要点：**
- 有哪些表
- 每个表的字段和用途
- 表之间的关联关系
- 是否使用了软删除模式

#### 3. 分析项目架构
```bash
# 了解项目的分层架构
Glob src/controllers/*.ts
Glob src/services/*.ts
Read src/index.ts  # 了解应用入口和路由配置
```

**分析要点：**
- 是否采用分层架构（Controller → Service → Schema）
- 现有的路由设计
- 软删除是否在查询中被过滤
- 错误处理模式
- 参数验证方式

### 📝 分析结果记录

在开始设计新表之前，先记录分析结果：

```
当前项目编码风格：
- 主键定义：[从实际文件中总结]
- 字符串字段：[从实际文件中总结]
- 时间戳处理：[从实际文件中总结]
- 外键关系：[从实际文件中总结]

现有数据库表：
- [列出所有现有表及其主要字段]

项目架构模式：
- [总结分层架构和其他架构特点]
```

## PostgreSQL 字段类型参考

### 基础类型
```typescript
// 整数
integer()                    // 32位整数
serial()                     // 自增整数
bigInt()                     // 64位整数

// 字符串
varchar({ length: 255 })     // 可变长度字符串
text()                       // 无限长度文本
char({ length: 10 })         // 固定长度字符串

// 布尔值
boolean()                    // true/false

// 日期时间
timestamp()                  // 时间戳
date()                       // 日期
time()                       // 时间
interval()                   // 时间间隔

// 数值
decimal({ precision: 10, scale: 2 })  // 精确小数
numeric({ precision: 10, scale: 2 })  // 同上
real()                       // 单精度浮点数
doublePrecision()            // 双精度浮点数

// JSON
json()                       // JSON 数据
jsonb()                      // 二进制 JSON（性能更好）

// 数组
varchar({ length: 255 }).array()  // 字符串数组
integer().array()            // 整数数组

// 其他
uuid()                       // UUID 类型
enum(['value1', 'value2'])   // 枚举类型
```

### 字段修饰符
```typescript
.notNull()                   // 非空约束
.unique()                    // 唯一约束
.default(value)              // 默认值
.defaultNow()                // 默认当前时间
.generatedAlwaysAsIdentity() // 自增主键
.references(() => table.column)  // 外键引用
```

## 表间关系设计(举例)

### 一对多关系
```typescript
// 用户表（一方）
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  // ...
});

// 订单表（多方）
export const ordersTable = pgTable("orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().references(() => usersTable.id),  // 外键
  total: decimal({ precision: 10, scale: 2 }).notNull(),
  // ...
});
```

### 多对多关系（需要中间表）
```typescript
// 文章表
export const postsTable = pgTable("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  // ...
});

// 标签表
export const tagsTable = pgTable("tags", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 50 }).notNull().unique(),
  // ...
});

// 文章-标签关联表（中间表）
export const postTagsTable = pgTable("post_tags", {
  postId: integer().references(() => postsTable.id).notNull(),
  tagId: integer().references(() => tagsTable.id).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
```

### 自引用关系（如分类树）
```typescript
export const categoriesTable = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  parentId: integer().references(() => categoriesTable.id),  // 自引用
  // ...
});
```

### 外键约束选项
```typescript
.references(() => table.column, {
  onDelete: 'cascade',     // 级联删除：删除主表记录时，同时删除子表记录
  onUpdate: 'cascade',     // 级联更新
  onDelete: 'set null',    // 删除主表记录时，子表外键设为 null
  onDelete: 'restrict',    // 禁止删除（默认）
})
```

## 🎯 工作模式

本技能采用 **Plan → Agent** 两阶段工作模式，确保设计方案充分讨论和确认后再编写代码。

### 模式说明

#### Plan 模式（设计方案阶段）
**目标：** 理解需求、分析可行性、设计方案、达成共识

**工作内容：**
1. 分析当前项目状态
2. 收集用户需求
3. 讨论设计合理性
4. 生成完整的设计方案简报
5. 等待用户确认或修改

**不执行操作：**
- ❌ 不创建任何文件
- ❌ 不修改任何代码
- ❌ 不执行任何数据库操作

#### Agent 模式（执行创建阶段）
**目标：** 按照确认的方案创建 schema 文件

**工作内容：**
1. 按照确认的方案创建 schema 文件
2. 确保符合项目编码风格
3. 设置正确的字段类型和约束
4. 处理表间关系

**执行条件：**
- ✅ 必须在用户确认设计方案后
- ✅ 必须在用户明确表示同意后

## 🔄 完整工作流程

### 第一阶段：项目分析（Plan 模式开始）

#### 1. 分析当前项目状态
```bash
# 读取现有的 schema 文件
Read src/db/schema/*.ts

# 扫描 schema 目录
Glob src/db/schema/*.ts

# 了解项目架构
Glob src/controllers/*.ts
Glob src/services/*.ts
Read src/index.ts
```

**分析结果记录：**
```
当前项目编码风格：
- 主键定义：[总结]
- 字符串字段：[总结]
- 时间戳处理：[总结]
- 外键关系：[总结]

现有数据库表：
- [列出所有表]

项目架构模式：
- [总结架构特点]
```

### 第二阶段：需求收集和设计（Plan 模式继续）

#### 1. 收集用户需求
向用户询问以下信息，**若用户已经明确，则无须询问**：

**基本信息：**
- 表的用途是什么？
- 表的英文名称是什么？
- 需要哪些字段？（字段名、类型、是否必填、默认值）

**表间关系：**
- 是否需要与现有表建立关联？
- 是一对多、多对多还是其他关系？
- 关系的具体含义是什么？

**业务需求：**
- 这个表会被哪些接口使用？
- 是否需要与现有表进行联合查询？
- 是否有特殊的业务规则？

#### 2. 讨论设计的合理性
基于用户提供的信息，与用户讨论：

**字段设计：**
- 字段类型是否合适？
- 是否需要添加索引？
- 是否需要唯一约束？
- 外键约束如何设置（cascade、restrict 等）？

**表间关系：**
- 关系是否合理？
- 是否需要中间表（多对多）？
- 级联删除策略是否合适？

**架构整合评估：**
- 是否需要创建对应的 controller、service？
- 是否需要修改现有的接口？
- **注意：** 只能将评估结果告知用户，提醒用户后续修改，不能自己修改

### 第三阶段：生成设计方案简报（Plan 模式关键）

在完成需求收集和设计讨论后，**必须生成完整的设计方案简报**：

```
📋 数据库表设计方案简报

表名：[表名]
用途：[简要说明]

字段设计：
- id: [主键定义方式]
- [字段名]: [类型] [约束] [说明]
- [字段名]: [类型] [约束] [说明]
- ...

表间关系：
- [关系1]：[说明]
- [关系2]：[说明]

外键约束：
- [外键1]：[级联策略]
- [外键2]：[级联策略]

特殊处理：
- [特殊处理1]
- [特殊处理2]

架构影响评估：
- [是否需要创建 controller/service]
- [是否需要修改现有接口]

编码风格确认：
- ✅ 主键定义与现有表一致
- ✅ 字段命名与现有表一致
- ✅ 字段类型与现有代码一致
- ✅ 时间戳处理与现有表一致
- ✅ 外键引用与现有代码一致

后续操作提醒：
⚠️ 设计确认后，需要执行：npx drizzle-kit push

请确认此设计方案，或提出修改意见。
```

**等待用户确认或修改设计方案，不要直接创建文件。**

### 第四阶段：创建 Schema 文件（Agent 模式开始）

**⚠️ 重要：只有在用户明确确认设计方案后，才能进入 Agent 模式开始创建文件。**

**⚠️ 创建前检查：**
- [ ] 已经完成项目编码风格分析
- [ ] 已经确认当前项目使用的字段类型和约束方式
- [ ] 已经了解时间戳字段的处理方式
- [ ] 已经查看现有表的外键引用写法

**创建 schema 文件：**
```typescript
// src/db/schema/[table-name].ts
import { pgTable, integer, varchar, text, decimal } from "drizzle-orm/pg-core";
import { timestamps } from "./plugin/columns.helpers";

export const [tableName]Table = pgTable("[table-name]", {
    // 根据分析得出的主键定义方式创建主键
    // 注意：必须与现有表的主键定义方式完全一致
    // 根据用户需求添加字段
    // 确保与现有代码风格完全一致
    ...timestamps
});

// 如果项目使用了 relations，根据现有代码的模式添加关系定义
// 如果没有使用，则跳过这一部分
```

**编码风格检查清单：**
- [ ] 主键定义与现有表一致
- [ ] 字段命名与现有表一致（驼峰、下划线等）
- [ ] 字段类型选择与现有代码一致
- [ ] 时间戳字段处理与现有表一致
- [ ] 外键引用写法与现有代码一致
```

### 第四步：提醒用户执行
创建完成后，提醒用户：

```bash
# 推送 schema 到数据库
npx drizzle-kit push

# 或者生成迁移文件
npx drizzle-kit generate
```

最终提醒用户新创建的表格与现有接口的影响，这一部分不需要你修改任何代码，你只需要告知用户即可

## 设计原则

### 1. 字段命名规范
- 使用小写字母和下划线：`created_at`, `user_id`
- 外键字段：`[关联表名]_id`，如 `user_id`, `category_id`
- 布尔字段：使用 `is_` 前缀，如 `is_active`, `is_published`
- 时间字段：使用 `_at` 后缀，如 `created_at`, `updated_at`

### 2. 数据类型选择
- 文本短于 255 字符：使用 `varchar`
- 长文本（如文章内容）：使用 `text`
- 金额：使用 `decimal` 或 `numeric`
- 只有少量固定值的字段：考虑使用 `enum`
- JSON 数据：优先使用 `jsonb`（性能更好）

### 3. 索引考虑
- 频繁查询的字段：建议添加索引
- 外键字段：自动创建索引
- 唯一约束：自动创建索引

### 4. 软删除设计
- 所有表都应包含 `deleted_at` 字段
- 业务查询都应过滤 `deleted_at IS NOT NULL` 的记录
- 物理删除只在必要时使用

### 5. 时间戳设计
- `created_at`：创建时间，使用 `defaultNow().notNull()`
- `updated_at`：更新时间，可选
- `deleted_at`：软删除标记，可选

## 注意事项

### ⚠️ 不能自行决定的内容
- ❌ 表名（必须由用户提供）
- ❌ 字段名（必须由用户提供）
- ❌ 字段类型（必须由用户提供）
- ❌ 表间关系（必须由用户提供）
- ❌ 业务逻辑（必须由用户提供）

### ✅ 可以提供的建议
- ✅ 字段类型是否合适
- ✅ 是否需要添加约束
- ✅ 表间关系设计是否合理
- ✅ 是否需要索引
- ✅ 外键约束策略
- ✅ 是否需要考虑软删除

### 📋 需要讨论的内容
- 字段的必要性和合理性
- 表间关系的设计
- 与现有接口的影响
- 业务规则的实现
- 数据完整性约束

## 示例对话

### 用户：我想创建一个商品表

**助手：** 好的，我来帮你设计商品表。让我先分析一下当前项目的情况，然后了解你的需求。

**[首先进行项目分析]**
正在读取现有 schema 文件...
正在分析项目编码风格...
正在扫描现有数据库表...

**分析完成。现在让我了解你的需求：**

1. **表名**：你希望表名是什么？比如 `products`？
2. **字段需求**：商品需要哪些字段？比如：
   - 商品名称（text）
   - 价格（decimal）
   - 库存数量（integer）
   - 描述（text）
   - 是否上架（boolean）
   - 还需要其他字段吗？
3. **关联关系**：
   - 根据项目分析，当前有以下表：[列出分析得出的现有表]
   - 是否需要关联其中某些表（如用户表作为创建人）？
   - 是否需要新的关联表（如分类、标签）？
4. **业务需求**：
   - 这个表会被哪些接口使用？
   - 是否需要与现有表进行联合查询？

### 用户：表名是 products，字段有 name, price, stock, description, is_active

**助手：** 明白了。让我继续了解：

1. **字段类型确认**：
   - `name`：varchar(255) 是否足够？
   - `price`：需要用什么精度？比如 decimal(10, 2) 表示最多 8 位整数，2 位小数？
   - `stock`：integer 类型可以吗？
   - `description`：内容会比较长吗？需要用 text 类型吗？
   - `is_active`：boolean 类型，默认值为 true？

2. **关联关系**：
   - 根据现有表结构，是否需要关联某些表？
   - 是否需要记录创建人？

3. **特殊需求**：
   - 商品名称是否需要唯一？
   - 价格是否不能为负数？
   - 库存是否不能为负数？

**说明：** 我会根据项目分析得出的编码风格来创建 schema，确保与现有代码完全一致。

## 完整示例

**⚠️ 注意：以下示例仅用于演示流程，实际创建时必须根据项目分析结果调整代码风格。**

### 创建订单表（与用户表关联）

**第一步：项目分析**
```
读取现有 schema 文件 → 分析编码风格 → 扫描现有表 → 了解架构模式
```

**第二步：需求收集**
（与用户讨论表结构、字段、关系等）

**第三步：创建 Schema**
```typescript
// src/db/schema/orders.ts
import { pgTable, integer, varchar, decimal, text } from "drizzle-orm/pg-core";
import { timestamps } from "./plugin/columns.helpers";

// ⚠️ 主键定义方式必须与现有表一致
// ⚠️ 外键引用写法必须与现有表一致
// ⚠️ 时间戳处理必须与现有表一致

export const ordersTable = pgTable("orders", {
    // 根据项目分析结果确定主键定义方式
    userId: integer().references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
    orderNumber: varchar({ length: 50 }).notNull().unique(),
    total: decimal({ precision: 10, scale: 2 }).notNull(),
    status: varchar({ length: 20 }).notNull().default('pending'),
    shippingAddress: text().notNull(),
    notes: text(),
    ...timestamps  // 根据项目分析确定是否使用 timestamps 插件
});

// 如果项目使用了 relations，则添加关系定义
// 如果项目没有使用 relations，则跳过
export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [ordersTable.userId],
        references: [usersTable.id],
    }),
    items: many(orderItemsTable),
}));
```

**第四步：提醒用户执行**
```bash
npx drizzle-kit push
```

## 💡 使用示例

### 示例 1：创建简单的用户表（Plan → Agent 完整流程）

**用户：** 我想创建一个用户表

**AI（Plan 模式）：**
好的，我来帮你设计用户表。让我先分析一下当前项目的情况。

**[项目分析阶段]**
正在读取 src/db/schema/*.ts...
正在分析现有数据库表...
正在了解项目架构模式...

**分析完成。当前项目状态：**
- 数据库表：users 表（id, name, email, timestamps）
- 编码风格：主键使用 generatedAlwaysAsIdentity()、软删除模式、timestamps 插件

现在让我了解你的需求：

1. **表名确认**：
   - 你希望表名是什么？比如 `users`？

2. **字段需求**：
   - 用户表需要哪些字段？比如：
     - name（用户名）
     - email（邮箱）
     - 其他字段？

3. **关联关系**：
   - 是否需要关联其他表？

4. **特殊需求**：
   - 是否需要软删除？
   - 是否需要唯一约束？

**用户：** 表名是 users，字段有 name, email

**AI（Plan 模式）：**
明白了。让我继续了解：

1. **字段类型确认**：
   - `name`：varchar(255) 是否足够？
   - `email`：需要唯一约束吗？

2. **软删除**：
   - 项目使用了软删除模式，users 表也需要吗？

3. **关联关系**：
   - 不需要关联其他表，对吗？

**设计方案简报：**
```
📋 数据库表设计方案简报

表名：users
用途：存储用户基本信息信息

字段设计：
- id: integer().primaryKey().generatedAlwaysAsIdentity() [自增主键]
- name: varchar({ length: 255 }).notNull() [用户名称，必填]
- email: varchar({ length: 255 }).notNull().unique() [用户邮箱，必填，唯一]
- timestamps 插件字段：
  - created_at: timestamp().defaultNow().notNull() [创建时间]
  - updated_at: timestamp() [更新时间]
  - deleted_at: timestamp() [软删除标记]

表间关系：
- 无关联关系

外键约束：
- 无外键

特殊处理：
- 使用软删除模式
- email 字段添加唯一约束

架构影响评估：
- 需要创建对应的 user.controller.ts 和 user.service.ts
- 需要在 src/index.ts 中添加路由配置

编码风格确认：
- ✅ 主键定义与现有表一致
- ✅ 字段命名与现有表一致
- ✅ 字段类型与现有代码一致
- ✅ 时间戳处理与现有表一致（使用 timestamps 插件）

后续操作提醒：
⚠️ 设计确认后，需要执行：npx drizzle-kit push

请确认此设计方案，或提出修改意见。
```

**用户：** 确认，开始创建

**AI（Agent 模式）：**
好的，现在开始创建 users 表的 schema 文件。

**[创建文件...]**
✅ 文件创建完成：src/db/schema/users.ts

**提醒：** 请执行以下命令将 schema 推送到数据库：
```bash
npx drizzle-kit push
```

### 示例 2：创建订单表（涉及关联关系）

**用户：** 我需要创建一个订单表

**AI（Plan 模式）：**
好的，我来帮你设计订单表。让我先分析当前项目。

**[项目分析完成]**

现在让我了解你的需求：

1. **基本信息**：
   - 表名：`orders`？
   - 需要哪些字段？

2. **关联关系**：
   - 订单是否需要关联用户（users 表）？
   - 是否需要订单项（order_items）？
   - 级联删除策略是什么？

3. **特殊字段**：
   - 是否需要订单号？
   - 是否需要订单状态（如 pending, paid, shipped）？
   - 是否需要总金额字段？

**用户：** 表名是 orders，字段有 order_number, total_amount, status，需要关联 users 表

**AI（Plan 模式）：**
明白了。让我继续确认细节：

1. **字段类型确认**：
   - `order_number`：varchar(50) 够用吗？需要唯一约束吗？
   - `total_amount`：decimal(10, 2) 精度够吗？
   - `status`：有哪些状态值？

2. **关联关系确认**：
   - 外键字段名：`user_id`？
   - 级联删除策略：
     - 删除用户时，订单怎么处理？
     - cascade（删除订单）
     - set null（设为 null）
     - restrict（禁止删除）

3. **软删除**：
   - 订单表也需要软删除吗？

**设计方案简报：**
```
📋 数据库表设计方案简报

表名：orders
用途：存储用户订单信息

字段设计：
- id: integer().primaryKey().generatedAlwaysAsIdentity()
- user_id: integer().notNull().references(() => usersTable.id, { onDelete: 'restrict' })
- order_number: varchar({ length: 50 }).notNull().unique()
- total_amount: decimal({ precision: 10, scale: 2 }).notNull()
- status: varchar({ length: 20 }).notNull().default('pending')
- timestamps 插件字段

表间关系：
- 多对一：一个订单属于一个用户（user_id 外键）

外键约束：
- user_id：删除用户时禁止删除订单（restrict）

特殊处理：
- order_number 添加唯一约束
- status 默认值为 'pending'

架构影响评估：
- 需要创建 order.controller.ts 和 order.service.ts
- 需要考虑用户删除时的订单处理逻辑

编码风格确认：
- ✅ 符合项目现有编码风格

请确认此设计方案，或提出修改意见。
```

**用户：** 我希望删除用户时级联删除订单

**AI（Plan 模式）：**
明白了，我修改设计方案：

```
📋 数据库表设计方案简报（更新）

外键约束：
- user_id：删除用户时同时删除订单（cascade）

⚠️ 重要提醒：
使用 cascade 级联删除会自动删除用户的所有订单，请确认这是你想要的业务逻辑。

请确认此修改后的设计方案。
```

**用户：** 确认，创建吧

**AI（Agent 模式）：**
好的，现在开始创建 orders 表的 schema 文件。

**[创建文件...]**
✅ 文件创建完成：src/db/schema/orders.ts

**提醒：** 请执行以下命令将 schema 推送到数据库：
```bash
npx drizzle-kit push
```

## 📝 设计方案模板

在 Plan 模式结束时，**必须**生成包含以下内容的设计方案简报：

```markdown
📋 数据库表设计方案简报

表名：[表名]
用途：[简要说明]

字段设计：
[完整的字段列表，包含类型、约束、说明]

表间关系：
[列出所有关系及其说明]

外键约束：
[列出所有外键及其级联策略]

特殊处理：
[任何特殊的约束或处理]

架构影响评估：
[对现有代码的影响评估]

编码风格确认：
[列出所有编码风格检查项]

后续操作提醒：
[提醒用户执行数据库更新命令]

请确认此设计方案，或提出修改意见。
```

**⚠️ 关键规则：**
- 必须等待用户明确确认
- 用户可以要求修改设计方案
- 只有确认后才能进入 Agent 模式
- 不得跳过设计方案简报直接创建文件

## 验证清单

创建 schema 后，验证以下内容：

### ✅ 项目分析阶段
- [ ] 已读取现有所有 schema 文件
- [ ] 已分析当前项目的编码风格
- [ ] 已列出所有现有数据库表
- [ ] 已了解项目的架构模式
- [ ] 已确认主键定义方式与现有表一致
- [ ] 已确认时间戳处理方式与现有表一致
- [ ] 已确认外键引用写法与现有表一致

### ✅ 需求收集阶段
- [ ] 表名由用户提供
- [ ] 所有字段名由用户提供
- [ ] 字段类型与用户确认
- [ ] 外键关系已与用户确认
- [ ] 级联删除策略已讨论
- [ ] 索引需求已讨论
- [ ] 约束需求已讨论

### ✅ 创建完成阶段
- [ ] 创建的 schema 文件符合项目编码风格
- [ ] 包含 timestamps（如果项目使用）
- [ ] 外键关系按用户要求正确实现
- [ ] 与现有接口的影响已评估并告知用户
- [ ] 已提醒用户执行 drizzle-kit push
