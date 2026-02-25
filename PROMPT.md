# 后端业务开发完整指南

本指南详细介绍如何使用 Hono + Drizzle 模板构建完整的后端业务系统。

## 📋 目录

1. [快速开始](#快速开始)
2. [完整开发流程](#完整开发流程)
3. [技能调用完整提示词](#技能调用完整提示词)
4. [实战案例](#实战案例)
5. [最佳实践](#最佳实践)

---

## 🚀 快速开始

### 构建完整后端需要 **5 个主要步骤**

每个资源/实体的开发流程：

1. **规划** - 设计数据模型和关系
2. **创建数据库表** - 定义数据库结构
3. **生成 CRUD** - 创建服务层和 API 接口
4. **添加验证** - 实现请求验证
5. **种子数据** - 填充测试数据（可选）

**预计时间**：每个资源约 15 分钟

---

## 📖 完整开发流程

### 阶段一：规划阶段

#### 1.1 识别业务实体

列出业务所需的所有资源：

**电商业务示例：**
- 用户（客户、管理员）
- 商品
- 分类
- 订单
- 订单项
- 支付
- 评论

**博客业务示例：**
- 用户（作者、读者）
- 文章
- 分类
- 标签
- 评论
- 点赞

#### 1.2 定义关系

映射实体之间的关系：
- **一对多**：用户 → 订单（一个用户有多个订单）
- **多对多**：文章 ↔ 标签（通过关联表）
- **一对一**：用户 → 个人资料

#### 1.3 规划字段

为每个实体列出：
- 必填字段（名称、类型、约束）
- 可选字段
- 唯一字段（邮箱、用户名、别名）
- 外键（关系）

---

## 🎯 技能调用完整提示词

### 技能 1：创建数据库表（Schema Migration）

**⭐ 重要提示：使用完整配置节省时间**

当您需要创建数据库表时，请一次性提供**完整的字段配置**，这样 AI 可以一次性生成完美代码，无需反复修改。

#### 📝 完整提示词模板

```
创建数据库表 [资源名称_单数形式]，包含以下字段配置：

【必填字段】
- 字段名 (数据类型, 约束条件)
- 字段名 (数据类型, 约束条件)

【可选字段】
- 字段名 (数据类型, 约束条件)

【关系字段】
- 外键名 (integer, references 关联表名)

【唯一字段】
- 字段名 (数据类型, unique)
```

#### 💡 完整配置示例

```
创建数据库表 product，包含以下完整字段配置：

【必填字段】
- name (string, required, max 255, comment: 商品名称)
- slug (string, required, max 255, unique, comment: URL友好的标识)
- price (decimal, required, precision 10, scale 2, comment: 价格)
- description (text, optional, comment: 商品描述)
- stock (integer, required, default 0, min 0, comment: 库存数量)
- is_active (boolean, required, default true, comment: 是否上架)
- category_id (integer, optional, references categories.id, comment: 所属分类)

【索引】
- 在 slug 字段创建索引
- 在 category_id 字段创建索引

【备注】
- 这是一个商品表，用于电商系统
- price 需要支持小数点后两位
- slug 用于生成 SEO 友好的 URL
```

#### 📋 数据类型参考

| 用户输入 | Drizzle 类型 | 示例 |
|---------|-------------|------|
| 字符串（短） | `varchar(n)` | `varchar('name', { length: 255 })` |
| 字符串（长） | `text` | `text('description')` |
| 整数 | `integer` | `integer('count')` |
| 小数/金额 | `numeric` | `numeric('price', { precision: 10, scale: 2 })` |
| 布尔值 | `boolean` | `boolean('is_active')` |
| 日期时间 | `timestamp` | `timestamp('published_at')` |
| 自增ID | `serial` | `serial('id').primaryKey()` |

#### 📝 字段约束参考

| 约束 | 说明 | 示例 |
|------|------|------|
| required | 必填 | `.notNull()` |
| optional | 可选 | 无约束 |
| unique | 唯一 | `.unique()` |
| default | 默认值 | `.default(value)` |
| min/max | 范围 | 在验证层处理 |
| max length | 最大长度 | `varchar('name', { length: 255 })` |

#### ✅ 完整提示词案例集合

**案例 1：用户表**
```
创建数据库表 user，包含以下完整字段配置：

- name (string, required, max 100, comment: 用户姓名)
- email (string, required, max 255, unique, comment: 邮箱地址)
- password (string, required, max 255, comment: 密码哈希)
- role (string, required, max 50, default: 'customer', comment: 用户角色)
- avatar_url (string, optional, max 500, comment: 头像URL)
- phone (string, optional, max 20, comment: 手机号)

【唯一索引】
- email 字段唯一索引
```

**案例 2：分类表**
```
创建数据库表 category，包含以下完整字段配置：

- name (string, required, max 100, unique, comment: 分类名称)
- slug (string, required, max 100, unique, comment: URL标识)
- description (text, optional, comment: 分类描述)
- parent_id (integer, optional, references categories.id, comment: 父分类ID)
- icon_url (string, optional, max 500, comment: 图标URL)
- sort_order (integer, required, default 0, comment: 排序序号)

【索引】
- parent_id 索引（用于查询子分类）
- sort_order 索引（用于排序）
```

**案例 3：订单表**
```
创建数据库表 order，包含以下完整字段配置：

- user_id (integer, required, references users.id, comment: 用户ID)
- order_number (string, required, max 50, unique, comment: 订单编号)
- total_amount (decimal, required, precision 10, scale 2, comment: 订单总金额)
- status (string, required, max 50, default: 'pending', comment: 订单状态)
- payment_method (string, optional, max 50, comment: 支付方式)
- payment_status (string, required, max 50, default: 'unpaid', comment: 支付状态)
- shipping_address (text, required, comment: 收货地址)
- shipping_city (string, required, max 100, comment: 收货城市)
- shipping_phone (string, required, max 20, comment: 收货电话)
- notes (text, optional, comment: 订单备注)

【唯一索引】
- order_number 唯一索引
- user_id + status 组合索引（用于查询用户订单）
```

**案例 4：文章表（博客）**
```
创建数据库表 post，包含以下完整字段配置：

- title (string, required, max 255, comment: 文章标题)
- slug (string, required, max 255, unique, comment: URL标识)
- content (text, required, comment: 文章内容)
- excerpt (text, optional, comment: 文章摘要)
- author_id (integer, required, references users.id, comment: 作者ID)
- category_id (integer, optional, references categories.id, comment: 分类ID)
- status (string, required, max 50, default: 'draft', comment: 发布状态)
- featured_image_url (string, optional, max 500, comment: 特色图片)
- view_count (integer, required, default 0, comment: 浏览次数)
- published_at (timestamp, optional, comment: 发布时间)

【索引】
- slug 唯一索引
- author_id 索引
- category_id 索引
- status + published_at 组合索引
```

#### 🎯 提示词最佳实践

✅ **一次性提供完整配置**
- 列出所有字段
- 指定数据类型
- 说明约束条件
- 标注必填/可选
- 提供业务说明

✅ **包含关系字段**
- 外键引用
- 级联删除规则
- 关系说明

✅ **指定索引需求**
- 唯一索引
- 组合索引
- 性能优化索引

❌ **避免的做法**
- 不要分多次添加字段
- 不要使用模糊描述（如"一些字段"）
- 不要遗漏必填字段的约束

---

### 技能 2：生成完整 CRUD（CRUD Generator）

#### 📝 完整提示词模板

```
为 [资源名称_单数] 创建完整的 CRUD 功能。

【表结构】
- 使用 [表名] 数据库表
- 包含字段：列出所有字段

【功能需求】
- 创建：需要哪些字段必填
- 更新：哪些字段可以部分更新
- 删除：使用软删除

【额外需求】（可选）
- 需要按某个字段搜索
- 需要按某个字段过滤
- 需要按某个字段排序
- 需要分页功能
```

#### 💡 完整提示词示例

```
为 product 创建完整的 CRUD 功能。

【表结构】
- 使用 products 数据库表
- 包含字段：id, name, slug, price, description, stock, category_id, is_active, created_at, updated_at, deleted_at

【功能需求】
- 创建：name, price, category_id 必填；description, stock 可选
- 更新：所有字段都可以部分更新
- 删除：使用软删除
- 查询：只返回未删除的记录

【额外需求】
- 添加按 name 字段搜索功能（模糊匹配）
- 添加按 category_id 过滤功能
- 添加按 price 范围过滤功能
- 添加按 created_at 降序排序
- 添加分页功能（每页 20 条）
```

#### 🎯 CRUD 完整提示词案例

**案例 1：用户 CRUD**
```
为 user 创建完整的 CRUD 功能。

【表结构】
- 使用 users 数据库表
- 包含字段：id, name, email, password, role, avatar_url, phone, created_at, updated_at, deleted_at

【功能需求】
- 创建：name, email, password 必填；avatar_url, phone 可选
- 更新：允许更新 name, avatar_url, phone；不允许更新 email 和 role
- 删除：使用软删除
- 列表：只返回 role 为 'customer' 的普通用户
- 详情：不返回 password 字段

【安全需求】
- password 字段在创建时需要加密（使用 bcrypt）
- email 在创建时检查唯一性
```

**案例 2：订单 CRUD**
```
为 order 创建完整的 CRUD 功能。

【表结构】
- 使用 orders 数据库表
- 包含字段：id, user_id, order_number, total_amount, status, payment_method, payment_status, shipping_address, shipping_city, shipping_phone, notes, created_at, updated_at, deleted_at

【功能需求】
- 创建：user_id, shipping_address, shipping_city, shipping_phone 必填
- 更新：只允许更新 status, payment_status, payment_method, notes
- 删除：使用软删除
- 列表：添加按 user_id, status, payment_status 过滤
- 详情：返回订单及其订单项（关联查询）

【业务逻辑】
- 创建订单时自动生成唯一的 order_number
- 更新 status 为 'cancelled' 时恢复商品库存
```

**案例 3：文章 CRUD**
```
为 post 创建完整的 CRUD 功能。

【表结构】
- 使用 posts 数据库表
- 包含字段：id, title, slug, content, excerpt, author_id, category_id, status, featured_image_url, view_count, published_at, created_at, updated_at, deleted_at

【功能需求】
- 创建：title, content, author_id 必填；其他可选
- 更新：允许更新所有字段
- 删除：使用软删除
- 列表：
  - 默认只返回 status 为 'published' 的文章
  - 添加按 category_id 过滤
  - 添加按 author_id 过滤
  - 添加按 title 或 content 搜索
  - 按 published_at 降序排序
  - 支持分页
- 详情：浏览时自动增加 view_count

【业务逻辑】
- 创建时自动生成 slug（基于 title）
- 发布时（status 改为 published）自动设置 published_at
```

---

### 技能 3：添加输入验证（Validator Generator）

#### 📝 完整提示词模板

```
为 [资源名称] 的 API 接口添加完整的输入验证。

【验证需求】
字段名:
  - 类型: string/number/boolean/email
  - 必填: 是/否
  - 长度限制: min/max
  - 格式要求: 正则表达式或特殊格式
  - 自定义验证规则

【使用方式】
- 使用内联验证（不使用 Zod）
- 或使用 Zod 验证
```

#### 💡 完整提示词示例

```
为 product 的 API 接口添加完整的输入验证。

【创建验证】
name:
  - 类型: string
  - 必填: 是
  - 最小长度: 3
  - 最大长度: 255
  - 不能包含特殊字符

slug:
  - 类型: string
  - 必填: 是
  - 最大长度: 255
  - 格式: 只能包含小写字母、数字、连字符

price:
  - 类型: number
  - 必填: 是
  - 必须大于: 0
  - 小数位数: 最多 2 位

description:
  - 类型: string
  - 必填: 否
  - 最大长度: 5000

stock:
  - 类型: integer
  - 必填: 否
  - 最小值: 0
  - 必须是整数

category_id:
  - 类型: integer
  - 必填: 否
  - 必须是正整数

is_active:
  - 类型: boolean
  - 必填: 否
  - 默认值: true

【使用方式】
使用内联验证（TypeScript 验证函数）
```

#### 🎯 验证完整提示词案例

**案例 1：用户验证**
```
为 user 的 API 接口添加完整的输入验证。

【注册验证】
name:
  - 类型: string
  - 必填: 是
  - 最小长度: 2
  - 最大长度: 100

email:
  - 类型: email
  - 必填: 是
  - 必须是有效的邮箱格式

password:
  - 类型: string
  - 必填: 是
  - 最小长度: 8
  - 最大长度: 255
  - 必须包含: 至少一个大写字母、一个小写字母、一个数字

phone:
  - 类型: string
  - 必填: 否
  - 格式: 手机号格式（可选）

【登录验证】
email:
  - 类型: email
  - 必填: 是

password:
  - 类型: string
  - 必填: 是

【更新验证】
所有字段都是可选的，但提供的字段必须符合上述规则
```

**案例 2：订单验证**
```
为 order 的 API 接口添加完整的输入验证。

【创建订单验证】
user_id:
  - 类型: integer
  - 必填: 是
  - 必须是正整数

shipping_address:
  - 类型: string
  - 必填: 是
  - 最小长度: 10
  - 最大长度: 500

shipping_city:
  - 类型: string
  - 必填: 是
  - 最大长度: 100

shipping_phone:
  - 类型: string
  - 必填: 是
  - 格式: 手机号格式
  - 必须是 11 位数字

notes:
  - 类型: string
  - 必填: 否
  - 最大长度: 1000

【更新订单验证】
status:
  - 类型: string
  - 必填: 否
  - 允许的值: pending, confirmed, shipped, delivered, cancelled

payment_status:
  - 类型: string
  - 必填: 否
  - 允许的值: unpaid, paid, refunded, failed

payment_method:
  - 类型: string
  - 必填: 否
  - 允许的值: credit_card, paypal, bank_transfer, cash_on_delivery
```

---

### 技能 4：生成种子数据（Seeder Generator）

#### 📝 完整提示词模板

```
为 [资源名称] 创建种子数据脚本。

【数据需求】
- 数量: 多少条记录
- 字段值: 具体的数据内容或数据生成规则
- 业务场景: 描述需要什么样的测试数据

【关系数据】
- 如果有关联表，说明如何关联
- 如果需要父表数据先存在，说明依赖关系
```

#### 💡 完整提示词示例

```
为 product 创建种子数据脚本。

【数据需求】
- 数量: 50 条商品记录
- 分类:
  * 电子产品: 15 条
  * 服装鞋帽: 15 条
  * 图书文具: 10 条
  * 家居用品: 10 条

【字段值】
name:
  - 使用真实的产品名称
  * 电子产品: iPhone 15, MacBook Pro, AirPods, Samsung Galaxy, 等
  * 服装: T恤, 牛仔裤, 运动鞋, 夹克, 等
  * 图书: 编程书籍, 小说, 教材, 等

slug:
  - 根据 name 自动生成（小写、连字符）

price:
  - 电子产品: 500-10000 之间
  - 服装: 50-500 之间
  - 图书: 30-200 之间
  - 家居: 100-1000 之间

description:
  - 生成真实的产品描述（50-200 字）

stock:
  - 随机 0-100 之间

is_active:
  - 全部设置为 true

category_id:
  - 根据分类分配对应的 category_id
  * 电子产品: category_id = 1
  * 服装: category_id = 2
  * 图书: category_id = 3
  * 家居: category_id = 4

【业务场景】
生成一个电商平台可用的测试数据，数据要真实可信，方便测试前端展示和搜索功能
```

#### 🎯 种子数据完整提示词案例

**案例 1：用户种子数据**
```
为 user 创建种子数据脚本。

【数据需求】
- 数量: 20 条用户记录
- 角色:
  * 普通用户: 17 个
  * 管理员: 3 个

【字段值】
name:
  - 使用真实的中文名字
  - 示例: 张三, 李四, 王五, 等

email:
  - 格式: 用户名@数字.example.com
  - 示例: zhangsan1@example.com, lisi2@example.com

password:
  - 统一设置为: Password123!
  - 说明: 这是测试密码

role:
  * 前 17 个设置为 'customer'
  * 后 3 个设置为 'admin'

avatar_url:
  - 使用随机的头像图片 URL
  - 示例: https://i.pravatar.cc/150?img=1, https://i.pravatar.cc/150?img=2

phone:
  - 随机生成 11 位手机号
  - 以 1 开头

【业务场景】
用于测试用户注册、登录、权限管理功能
```

**案例 2：分类种子数据**
```
为 category 创建种子数据脚本。

【数据需求】
- 数量: 15 条分类记录
- 层级: 2 级分类（父分类和子分类）

【顶级分类】(5 个)
1. 电子产品 - electronics
2. 服装鞋帽 - clothing
3. 图书文具 - books
4. 家居用品 - home
5. 美妆护肤 - beauty

【子分类】(每个顶级分类 2 个)
电子产品:
  - 手机数码 - mobile
  - 电脑办公 - computer

服装鞋帽:
  - 男装 - men
  - 女装 - women

图书文具:
  - 文学小说 - fiction
  - 教育读物 - education

家居用品:
  - 厨房用品 - kitchen
  - 家纺 - textile

美妆护肤:
  - 护肤 - skincare
  - 彩妆 - makeup

【字段值】
name: 上面列出的中文名称
slug: 上面列出的英文标识
description: 为每个分类生成 20-50 字的描述
parent_id: 顶级分类为 NULL，子分类设置为对应父分类的 ID
sort_order: 按顺序设置为 1, 2, 3...
icon_url: 可选

【业务场景】
用于测试分类展示、商品分类筛选、面包屑导航等功能
```

**案例 3：订单种子数据**
```
为 order 创建种子数据脚本。

【数据需求】
- 数量: 30 条订单记录
- 状态分布:
  * pending: 5 个
  * confirmed: 8 个
  * shipped: 7 个
  * delivered: 8 个
  * cancelled: 2 个

【字段值】
user_id:
  - 从现有的用户中随机选择
  * 可以使用 user_id: 1-20
  * 少数用户会有多个订单

order_number:
  - 格式: ORD + 年月日 + 4位随机数
  - 示例: ORD20250225001, ORD20250225002

total_amount:
  - 随机生成 50-5000 之间
  - 保留两位小数

status:
  - 按上述状态分布设置

payment_method:
  - credit_card: 40%
  - paypal: 30%
  - bank_transfer: 20%
  - cash_on_delivery: 10%

payment_status:
  * 如果 status 是 pending 或 cancelled: unpaid
  * 如果 status 是 confirmed/shipped/delivered: 90% paid, 10% refunded

shipping_address:
  - 生成真实的中国地址
  * 示例: 北京市朝阳区某某街道123号

shipping_city:
  - 示例: 北京, 上海, 广州, 深圳, 杭州

shipping_phone:
  - 生成 11 位手机号

notes:
  - 80% 为空，20% 有简单的备注
  - 示例: "请周末配送", "请提前联系"

【业务场景】
用于测试订单列表、订单详情、订单状态流转、订单统计等功能
```

---

### 技能 5：添加高级功能

#### 🔍 搜索功能

```
为 [资源名称] 添加搜索功能。

【搜索需求】
- 搜索字段: 列出可搜索的字段
- 搜索方式: 精确匹配/模糊匹配/全文搜索
- 大小写敏感: 是/否

【示例】
为 product 添加搜索功能。
搜索字段: name, description
搜索方式: 模糊匹配（使用 LIKE）
大小写敏感: 否
```

#### 📄 分页功能

```
为 [资源名称] 的列表接口添加分页功能。

【分页需求】
- 默认每页数量: 20
- 最大每页数量: 100
- 返回总页数和总记录数
```

#### 🔏 权限控制

```
为 [资源名称] 添加基于角色的权限控制。

【权限需求】
- 角色: admin, user, guest
- 权限规则:
  * admin: 可以做所有操作
  * user: 只能创建和查看自己的数据
  * guest: 只能查看公开数据
```

---

## 💼 实战案例：构建电商后端系统

### 完整开发流程

#### 第 1 步：规划实体

```
实体列表：Users, Categories, Products, Orders, OrderItems

关系图：
User → Orders (一对多)
Category → Products (一对多)
Order → OrderItems (一对多)
Product → OrderItems (一对多)
```

#### 第 2 步：创建数据库表（按依赖顺序）

**1. 用户表**
```
创建数据库表 user，包含以下完整字段配置：

- name (string, required, max 100, comment: 用户姓名)
- email (string, required, max 255, unique, comment: 邮箱)
- password (string, required, max 255, comment: 密码哈希)
- role (string, required, max 50, default: 'customer', comment: 角色)
- phone (string, optional, max 20, comment: 手机号)

【唯一索引】
- email 唯一索引
```

**2. 分类表**
```
创建数据库表 category，包含以下完整字段配置：

- name (string, required, max 100, unique, comment: 分类名称)
- slug (string, required, max 100, unique, comment: URL标识)
- description (text, optional, comment: 描述)
- parent_id (integer, optional, references categories.id, comment: 父分类)
- icon_url (string, optional, max 500, comment: 图标)
- sort_order (integer, required, default 0, comment: 排序)
```

**3. 商品表**
```
创建数据库表 product，包含以下完整字段配置：

- name (string, required, max 255, comment: 商品名称)
- slug (string, required, max 255, unique, comment: URL标识)
- price (decimal, required, precision 10, scale 2, comment: 价格)
- description (text, optional, comment: 描述)
- stock (integer, required, default 0, min 0, comment: 库存)
- is_active (boolean, required, default true, comment: 是否上架)
- category_id (integer, optional, references categories.id, comment: 分类)

【索引】
- slug 索引
- category_id 索引
```

**4. 订单表**
```
创建数据库表 order，包含以下完整字段配置：

- user_id (integer, required, references users.id, comment: 用户ID)
- order_number (string, required, max 50, unique, comment: 订单号)
- total_amount (decimal, required, precision 10, scale 2, comment: 总金额)
- status (string, required, max 50, default: 'pending', comment: 状态)
- payment_method (string, optional, max 50, comment: 支付方式)
- payment_status (string, required, max 50, default: 'unpaid', comment: 支付状态)
- shipping_address (text, required, comment: 收货地址)
- shipping_city (string, required, max 100, comment: 城市)
- shipping_phone (string, required, max 20, comment: 电话)
- notes (text, optional, comment: 备注)

【唯一索引】
- order_number 唯一索引
```

**5. 订单项表**
```
创建数据库表 order_item，包含以下完整字段配置：

- order_id (integer, required, references orders.id, comment: 订单ID)
- product_id (integer, required, references products.id, comment: 商品ID)
- quantity (integer, required, min 1, comment: 数量)
- price (decimal, required, precision 10, scale 2, comment: 单价)
- subtotal (decimal, required, precision 10, scale 2, comment: 小计)

【索引】
- order_id 索引
- product_id 索引
```

#### 第 3 步：生成 CRUD（每个实体）

```
为 user 创建完整的 CRUD 功能。
【表结构】使用 users 表
【功能】创建、更新、删除（软删除）、列表、详情
【安全】email 必须唯一，创建时加密密码

为 category 创建完整的 CRUD 功能。
【表结构】使用 categories 表
【功能】创建、更新、删除（软删除）、列表、详情
【排序】列表按 sort_order 升序

为 product 创建完整的 CRUD 功能。
【表结构】使用 products 表
【功能】创建、更新、删除（软删除）、列表、详情
【过滤】按 category_id 过滤，只显示 is_active=true
【搜索】按 name 模糊搜索

为 order 创建完整的 CRUD 功能。
【表结构】使用 orders 表
【功能】创建、更新（只允许更新状态）、删除（软删除）、列表、详情
【过滤】按 user_id, status 过滤
【业务】创建时生成唯一 order_number

为 order_item 创建完整的 CRUD 功能。
【表结构】使用 order_items 表
【功能】创建、更新、删除、列表（通过 order_id）
【业务】创建时自动计算 subtotal = price * quantity
```

#### 第 4 步：添加验证

```
为 user 的 API 接口添加完整的输入验证。
【注册】name(必填,2-100字符), email(必填,邮箱格式), password(必填,8-255字符)
【登录】email(必填), password(必填)

为 product 的 API 接口添加完整的输入验证。
【创建】name(必填), price(必填,>0), category_id(可选)
【更新】所有字段可选

为 order 的 API 接口添加完整的输入验证。
【创建】user_id(必填), shipping_address(必填), shipping_city(必填), shipping_phone(必填,手机号格式)
```

#### 第 5 步：生成种子数据

```
创建用户种子数据，20 条记录。
【分布】17个普通用户，3个管理员
【密码】统一为 Password123!

创建分类种子数据，15 条记录。
【层级】5个顶级分类，每个2个子分类

创建商品种子数据，50 条记录。
【分类】分布在各个分类中
【价格】50-10000之间随机
```

---

## 🎯 最佳实践

### 1. 依赖顺序

按依赖顺序创建实体：
- 独立表优先（Users, Categories）
- 依赖表其次（Products, Posts）
- 关联表最后（Posts_Tags, OrderItems）

### 2. 命名规范

- **表名**: 复数 snake_case (`products`, `order_items`)
- **字段名**: snake_case (`created_at`, `category_id`)
- **服务**: PascalCase (`ProductService`)
- **控制器**: camelCase (`productController`)
- **路由**: kebab-case (`/api/products`, `/api/order-items`)

### 3. 完整配置的重要性

✅ **一次性提供完整配置的好处：**
- 节省时间：无需反复修改
- 代码质量：一次性生成正确代码
- 减少错误：避免遗漏字段或约束
- 提高效率：AI 理解更准确

❌ **不完整配置的问题：**
- 需要多轮对话补全信息
- 可能产生不符合需求的代码
- 后续需要大量修改

### 4. 数据验证原则

- 永远不要信任客户端输入
- 验证所有请求体
- 返回清晰的错误信息
- 使用正确的 HTTP 状态码

### 5. 软删除模式

- 永远不真正删除记录
- 设置 `deleted_at` 时间戳
- 所有查询过滤 `isNull(table.deleted_at)`

---

## 📊 开发时间估算

| 任务 | 时间 |
|------|------|
| 规划表结构（一次性完整配置） | 5-10 分钟 |
| 创建数据库表 | 2 分钟 |
| 生成 CRUD | 2 分钟 |
| 添加验证 | 2 分钟 |
| 种子数据 | 2 分钟 |
| **每个资源总计** | **~15 分钟** |

**示例：**
- 5 个资源 × 15 分钟 = **约 75 分钟**完成完整后端

---

## ✅ 完成后您将获得

- ✅ **完整的 REST API**，包含所有实体的 CRUD 操作
- ✅ **类型安全**的 TypeScript 代码
- ✅ **输入验证**，带清晰的错误信息
- ✅ **软删除**，保证数据完整性
- ✅ **可扩展**的架构（MVC 模式）
- ✅ **测试数据**，方便开发调试
- ✅ **生产就绪**的代码，遵循最佳实践

---

## 📞 需要帮助？

使用以下提示词获取帮助：

- "显示 [资源名称] 的表结构"
- "解释 [功能名称] 是如何工作的"
- "为 [资源名称] 添加 [功能]"
- "调试 [资源名称] 的控制器"
- "重构 [资源名称] 的服务"

---

## 🎓 快速参考卡片

### 创建新资源的一套完整提示词

```
【第 1 步：创建表】
创建数据库表 [资源名]，包含以下完整字段配置：
- 列出所有字段及完整约束

【第 2 步：生成 CRUD】
为 [资源名] 创建完整的 CRUD 功能。
使用 [表名] 表，包含字段：列出所有字段

【第 3 步：添加验证】
为 [资源名] 的 API 接口添加完整的输入验证。
列出每个字段的验证规则

【第 4 步：种子数据】
为 [资源名] 创建种子数据脚本。
生成 [数量] 条记录，描述数据特征
```

---

**模板版本**: 1.0
**最后更新**: 2025-02-25
**技术栈**: Hono + Drizzle + PostgreSQL + TypeScript
