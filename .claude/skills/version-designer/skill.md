---
name: version-designer
description: 需求拆分与版本规划器。读取 business/global 中的完整需求，将大需求拆分为多个独立的实现阶段，为每个阶段创建版本文件夹和设计文档。
---

# 版本设计器（需求拆分器）

这个技能的核心作用是**拆分需求**。它读取 `business/global/完整需求.md`，分析并拆分成多个可独立实现的阶段，每个阶段对应一个版本迭代。

## 🎯 技能核心职责

### 主要功能
- 📖 **需求分析**：读取 `business/global/完整需求.md` 理解项目全貌
- ✂️ **需求拆分**：将大需求拆分为多个独立的实现阶段
- 📁 **版本创建**：为每个实现阶段创建版本文件夹和设计文档
- 🔗 **依赖分析**：分析各阶段之间的依赖关系，确定执行顺序

### 输出结构
每个实现阶段生成：
```
business/iterations/{version}/
├── 需求.md           # 该阶段的需求（从大需求中提取）
├── 设计.md           # 该阶段的设计
├── 数据库.md         # 该阶段的数据库设计
└── 版本说明.md       # 该阶段的版本说明
```

### 前提条件
- ✅ `business/global/完整需求.md` 存在且包含完整需求描述
- ✅ `business/global/愿景与路线图.md` 存在
- ✅ `business/global/项目架构与技术栈.md` 存在

## 🔄 完整工作流程

### 第一阶段：读取全局需求

#### 1. 读取核心文档
```bash
# 必须读取的文档
Read business/global/完整需求.md
Read business/global/愿景与路线图.md
Read business/global/项目架构与技术栈.md
Read business/global/核心概念.md

# 可选读取
Read business/global/完整数据库设计.md
```

#### 2. 理解项目全景
从 `完整需求.md` 中提取：
- 项目的所有功能模块
- 功能的优先级（MUST/SHOULD/NICE TO HAVE）
- 功能之间的依赖关系
- 预期的交付节奏

### 第二阶段：需求拆分

#### 1. 分析功能模块
将完整需求按模块拆分，例如：
```
完整需求可能包含：
- 用户管理（注册、登录、个人资料）
- 认证授权（JWT、角色权限）
- 文章管理（CRUD、分类、标签）
- 评论系统
- 通知系统

拆分后的实现阶段：
- v0.1.0-MVP: 用户管理 + 基础认证
- v0.2.0: 文章管理
- v0.3.0: 评论系统
- v0.4.0: 通知系统 + 高级权限
```

#### 2. 确定拆分原则
- **独立交付**：每个阶段可独立开发、测试、部署
- **依赖最小化**：尽量减少阶段之间的依赖
- **MVP 优先**：第一阶段必须是最小可用版本
- **业务价值**：按业务价值排序，优先实现核心功能

#### 3. 创建实现阶段规划
```markdown
# 版本迭代规划

## 阶段 1: v0.1.0-MVP
**目标**: 最小可用版本
**包含功能**:
- [ ] 用户注册
- [ ] 用户登录
- [ ] JWT 认证
**依赖**: 无（基础阶段）
**预计工作量**: X 人天

## 阶段 2: v0.2.0
**目标**: 文章管理
**包含功能**:
- [ ] 文章 CRUD
- [ ] 分类管理
- [ ] 标签管理
**依赖**: v0.1.0-MVP（需要用户体系）
**预计工作量**: X 人天

## ...
```

### 第三阶段：生成版本文档

#### 1. 确定版本号
```bash
# 版本号规则
# 格式：v{major}.{minor}.{patch}-{tag}
# 示例：v0.1.0-MVP, v0.2.0, v1.0.0-release

# 版本递增规则
- patch: Bug 修复
- minor: 新增功能，向后兼容
- major: 重大变更
- tag: MVP, alpha, beta, rc, release
```

#### 2. 创建版本目录
为每个实现阶段创建目录：
```bash
# 为第一个阶段创建目录
mkdir -p "business/iterations/v0.1.0-MVP"

# 目录结构
business/iterations/v0.1.0-MVP/
├── 需求.md              # 从大需求中提取本阶段需求
├── 设计.md              # 本阶段系统设计
├── 数据库.md            # 本阶段数据库设计
└── 版本说明.md          # 版本说明
```

#### 3. 生成需求文档（从大需求中提取）
```markdown
# 需求文档

> v0.1.0-MVP 版本需求（从完整需求中提取）

## 迭代概览

**版本**: v0.1.0-MVP
**目标**: 用户管理和基础认证
**状态**: 📝 规划中

## 本阶段需求

### 用户注册
**描述**: 新用户可以通过邮箱注册账号
**验收标准**:
- [ ] 邮箱格式正确
- [ ] 密码强度符合要求
- [ ] 邮箱唯一性检查
- [ ] 返回注册成功响应

### 用户登录
**描述**: 已注册用户可以登录系统
**验收标准**:
- [ ] 正确的邮箱密码可以登录
- [ ] 错误的密码返回错误
- [ ] 不存在的邮箱返回错误
- [ ] 登录成功后返回 JWT Token

### JWT 认证
**描述**: 使用 JWT Token 保护需要认证的接口
**验收标准**:
- [ ] Token 有效期为 7 天
- [ ] Token 包含用户信息
- [ ] 过期 Token 返回 401

## 优先级

| 功能 | 优先级 | 依赖 |
|------|--------|------|
| 用户注册 | MUST | 无 |
| 用户登录 | MUST | 用户注册 |
| JWT 认证 | MUST | 用户登录 |

## 风险与问题

| 风险/问题 | 影响 | 缓解措施 |
|----------|------|----------|
| 密码安全 | 高 | 使用 bcrypt 加密 |
| Token 安全 | 高 | 使用合适的签名算法 |
```

#### 4. 生成设计文档
```markdown
# 设计文档

> v0.1.0-MVP 版本系统设计

## 架构概览

本版本在现有架构基础上新增以下模块：

```
┌─────────────┐
│   客户端     │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────────────┐
│   API Layer         │
│   auth.controller   │
│   user.controller   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Service Layer     │
│   auth.service      │
│   user.service      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Data Layer        │
│   users table       │
│   sessions table    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   PostgreSQL        │
└─────────────────────┘
```

## 模块设计

### Controller 层

#### User Controller
**路径**: `src/controllers/user.controller.ts`
**端点**:
- `POST /api/v1/users` - 用户注册
- `GET /api/v1/users/me` - 获取当前用户信息

#### Auth Controller
**路径**: `src/controllers/auth.controller.ts`
**端点**:
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/refresh` - 刷新 Token
- `POST /api/v1/auth/logout` - 登出

### Service 层

#### User Service
**方法**:
- `create(data)` - 创建用户
- `findByEmail(email)` - 通过邮箱查找用户
- `findById(id)` - 通过 ID 查找用户

#### Auth Service
**方法**:
- `login(email, password)` - 用户登录
- `refresh(token)` - 刷新 Token
- `logout(userId)` - 用户登出
- `verifyToken(token)` - 验证 Token

## API 接口定义

### 请求/响应格式

#### 注册请求
```typescript
interface RegisterRequest {
  email: string;
  password: string;
  nickname?: string;
}
```

#### 登录请求
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

#### 登录响应
```typescript
interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    nickname: string;
  };
}
```

## 安全设计

### 密码存储
- 使用 bcrypt 加密
- 盐值自动生成
- 加密轮数：10

### Token 设计
- Access Token：有效期 1 小时
- Refresh Token：有效期 7 天
- 签名算法：HS256
```

#### 5. 生成数据库文档
```markdown
# 数据库设计

> v0.1.0-MVP 版本数据库表结构

## 新增表

### users 表

**文件**: `src/db/schema/users.ts`

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | serial | PK | 主键 |
| email | varchar(255) | NOT NULL, UNIQUE | 邮箱 |
| password | varchar(255) | NOT NULL | 加密后的密码 |
| nickname | varchar(100) | NULL | 昵称 |
| created_at | timestamp | NOT NULL | 创建时间 |
| updated_at | timestamp | NOT NULL | 更新时间 |
| deleted_at | timestamp | NULL | 软删除时间 |

**索引**:
- `idx_users_email` on (email)

### sessions 表

**文件**: `src/db/schema/sessions.ts`

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | serial | PK | 主键 |
| user_id | integer | NOT NULL, FK | 用户 ID |
| refresh_token | text | NOT NULL | Refresh Token |
| expires_at | timestamp | NOT NULL | 过期时间 |
| created_at | timestamp | NOT NULL | 创建时间 |

**索引**:
- `idx_sessions_user_id` on (user_id)
- `idx_sessions_refresh_token` on (refresh_token)

**外键**:
- `sessions.user_id` → `users.id`

## 公共字段

所有表使用 `plugin/columns.helpers.ts` 中的公共字段：
```typescript
import { createdAt, updatedAt, deletedAt } from './plugin/columns.helpers';
```

## 软删除策略

所有查询必须添加软删除过滤：
```typescript
import { isNull } from 'drizzle-orm';
db.select().from(users).where(isNull(users.deleted_at))
```
```

#### 6. 生成版本说明文档
```markdown
# 版本说明

> v0.1.0-MVP 版本发布说明

## 版本概览

**版本号**: v0.1.0-MVP
**类型**: 最小可用版本
**目标**: 实现用户管理和基础认证功能

## 变更摘要

### 新增功能 ✨
- ✨ 用户注册：支持邮箱注册
- ✨ 用户登录：支持邮箱密码登录
- ✨ JWT 认证：基于 Token 的认证机制

### 新增 API
- `POST /api/v1/users` - 用户注册
- `GET /api/v1/users/me` - 获取当前用户
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/refresh` - 刷新 Token
- `POST /api/v1/auth/logout` - 用户登出

### 新增数据库表
- `users` - 用户表
- `sessions` - 会话表

## 升级指南

### 首次部署
1. 安装依赖：`pnpm install`
2. 推送 Schema：`pnpm drizzle-kit push`
3. 启动服务：`pnpm dev`

## 下一步计划

### v0.2.0 规划
- 文章管理功能
- 分类管理功能
- 标签管理功能
```

### 第四阶段：更新项目状态

#### 1. 更新 project-state.json
```json
{
  "currentVersion": "v0.1.0-MVP",
  "versions": [
    {
      "version": "v0.1.0-MVP",
      "status": "planned",
      "phases": {
        "design": { "status": "pending" },
        "schema": { "status": "pending" },
        "development": { "status": "pending" }
      }
    }
  ],
  "plannedVersions": [
    {
      "version": "v0.2.0",
      "target": "文章管理",
      "dependencies": ["v0.1.0-MVP"]
    },
    {
      "version": "v0.3.0",
      "target": "评论系统",
      "dependencies": ["v0.2.0"]
    }
  ]
}
```

## 🛡️ 约束和规则

### ⚠️ 绝对不能做的
- ❌ 不能修改 `business/global/` 中的任何文档
- ❌ 不能创建与全局需求冲突的版本
- ❌ 不能跳过读取全局需求的步骤
- ❌ 不能创建没有需求文档支持的版本

### ✅ 必须做的
- ✅ 必须读取 `business/global/完整需求.md`
- ✅ 必须分析功能模块之间的依赖
- ✅ 必须确保第一个版本是 MVP（可独立运行）
- ✅ 必须为每个版本创建完整的文档
- ✅ 必须在完成后展示所有规划好的版本

## 🎯 拆分原则

### 好的拆分
```
完整需求 → 用户管理 + 认证授权 + 文章管理 + 评论
     ↓
v0.1.0-MVP: 用户注册、登录、JWT（MVP，可独立运行）
v0.2.0: 文章 CRUD、分类、标签（依赖 v0.1.0）
v0.3.0: 评论功能（依赖 v0.2.0 的文章）
```

### 不好的拆分
```
v0.1.0: 用户注册 + 文章创建（耦合太高）
v0.2.0: 用户登录 + 文章查询（功能不完整，无法独立使用）
```

## 🗣️ 与用户交互要点

### 开始时确认
```
📋 开始版本设计

我需要先读取项目的完整需求，然后拆分成多个可实现的阶段。

请确认：
1. business/global/完整需求.md 是否包含了你所有的需求？
2. 你对实现顺序有什么特别的要求？
3. 是否有必须优先实现的功能？
```

### 拆分完成后展示
```
✅ 需求拆分完成

我已将完整需求拆分为以下实现阶段：

| 版本 | 目标 | 依赖 | 优先级 |
|------|------|------|--------|
| v0.1.0-MVP | 用户管理+认证 | 无 | P0 |
| v0.2.0 | 文章管理 | v0.1.0 | P1 |
| v0.3.0 | 评论系统 | v0.2.0 | P2 |

每个版本都是独立的，可以单独开发、测试和部署。

是否需要调整拆分方案？
```

### 确认第一个版本
```
📍 第一个版本：v0.1.0-MVP

包含功能：
- 用户注册
- 用户登录
- JWT 认证

生成文档：
- business/iterations/v0.1.0-MVP/需求.md
- business/iterations/v0.1.0-MVP/设计.md
- business/iterations/v0.1.0-MVP/数据库.md
- business/iterations/v0.1.0-MVP/版本说明.md

是否确认开始开发此版本？
```

## 📁 输出文件结构

```
business/
├── global/                          # 全局设计（已存在）
│   ├── 完整需求.md
│   ├── 愿景与路线图.md
│   └── ...
├── iterations/                      # 版本迭代
│   ├── v0.1.0-MVP/                  # 第一个实现阶段
│   │   ├── 需求.md                  # 提取的本阶段需求
│   │   ├── 设计.md                  # 本阶段设计
│   │   ├── 数据库.md                # 本阶段数据库
│   │   └── 版本说明.md              # 版本说明
│   ├── v0.2.0/                      # 第二个实现阶段
│   │   ├── 需求.md
│   │   ├── 设计.md
│   │   ├── 数据库.md
│   │   └── 版本说明.md
│   └── v0.3.0/                      # 第三个实现阶段
│       └── ...
└── .project-state.json              # 项目状态（更新）
```

## 🚀 使用示例

### 用户：开始新版本设计

**AI：**
好的，让我读取项目的完整需求，然后拆分成多个可实现的版本。

**[读取全局需求]**
正在读取 business/global/完整需求.md...

**[分析需求结构]**
完整需求包含：
- 用户管理（注册、登录、个人资料）
- 认证授权（JWT、角色、权限）
- 文章管理（CRUD、分类、标签）
- 评论系统
- 通知系统
- 搜索功能

**[拆分实现阶段]**

| 版本 | 目标 | 包含功能 | 依赖 |
|------|------|----------|------|
| v0.1.0-MVP | 用户+认证 | 用户注册、登录、JWT | 无 |
| v0.2.0 | 文章管理 | 文章 CRUD、分类、标签 | v0.1.0 |
| v0.3.0 | 评论系统 | 评论 CRUD、回复 | v0.2.0 |
| v0.4.0 | 通知系统 | 站内通知、邮件 | v0.1.0 |

**[生成第一个版本文档]**
正在为 v0.1.0-MVP 生成文档...

✅ **版本规划完成**

已创建版本文件夹：
- business/iterations/v0.1.0-MVP/
- business/iterations/v0.2.0/
- business/iterations/v0.3.0/
- business/iterations/v0.4.0/

是否确认从 v0.1.0-MVP 开始开发？

---

*version-designer 的核心价值：将大需求拆分为可独立交付的小版本，让后续的 schema-generator、business-generator 等技能可以按阶段执行。*
