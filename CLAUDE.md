# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 Hono + Drizzle ORM + PostgreSQL 的 TypeScript API 项目模板，集成了完整的 AI 辅助开发技能系统（Skills Chain）。

## 常用命令

### 开发
```bash
pnpm dev       # 启动开发服务器 (端口 3001)
pnpm build     # TypeScript 编译到 dist/
pnpm start     # 运行生产版本
```

### 数据库
```bash
pnpm drizzle-kit push     # 推送 schema 到数据库
pnpm drizzle-kit studio   # 打开数据库管理界面
```

### 测试
```bash
pnpm test               # 运行所有测试
pnpm test:ui            # 打开 Vitest UI
pnpm test:coverage      # 生成覆盖率报告
```

## 架构说明

### 分层架构
项目采用三层分离模式：

| 层 | 目录 | 职责 |
|---|---|---|
| **Controller** | `src/controllers/` | HTTP 请求处理、参数验证、响应格式化 |
| **Service** | `src/services/` | 业务逻辑、数据库操作 |
| **Schema** | `src/db/schema/` | 数据库表结构定义 |

### 项目结构
```
src/
├── index.ts                 # 应用入口，导出 app 供测试使用
├── controllers/             # API 路由控制器
│   └── user.controller.ts   # 遵循 RESTful 规范，含 JSDoc 注释
├── services/                # 业务逻辑层
│   └── user.service.ts
├── db/
│   ├── index.ts             # 数据库连接导出
│   └── schema/
│       ├── users.ts         # 表定义
│       └── plugin/
│           └── columns.helpers.ts  # 公共字段 (created_at, updated_at)
└── seeders/                 # 数据库种子数据

tests/                       # Vitest 测试
├── api/                     # API 集成测试
├── utils/                   # 测试辅助函数
└── vitest.config.ts         # 测试配置

business/                    # 业务文档和版本管理
├── global/                  # 全局设计文档
├── iterations/              # 版本迭代文档
├── .project-state.json      # 项目状态（由 Skills 管理）
└── SKILLS_CHAIN_GUIDE.md    # 技能链使用指南
```

### 数据库规范
- **方言**: PostgreSQL
- **公共字段**: 使用 `timestamps` helper 包含 `created_at`, `updated_at`, `deleted_at`
- **软删除**: 所有查询应过滤 `deleted_at IS NULL`
- **主键**: 使用 `generatedAlwaysAsIdentity()`
- **环境变量**: `DATABASE_URL` (从 `.env` 加载)

### Controller 编码规范
- 使用 Hono 路由，导出默认实例
- 路由前缀在 `src/index.ts` 中挂载
- 必须包含 JSDoc 注释：`@description`, `@route`, `@param`, `@returns`, `@throws`, `@example`
- 参数验证：ID 需检查 `Number.isInteger(id) && id > 0`
- 错误处理：唯一约束违反码 `23505` 返回 409
- 响应格式：`c.json(data, status)`

## AI 辅助开发 (Skills Chain)

项目内置完整的 AI 技能系统，按以下流程执行：

```
version-designer (版本设计)
    ↓
schema-generator (数据库设计)
    ↓
business-generator (业务开发)
    ↓
openapi-generator (API 文档)
    ↓
test-case-designer (测试用例)
    ↓
test-generator (测试执行)
    ↓
code-reviewer (代码审查)
```

### 快速开始
直接说 "开始新版本开发" 或使用 `/project-orchestrator` 启动自动化流程。

详细文档见 `business/SKILLS_CHAIN_GUIDE.md`

## TypeScript 配置
- **Target**: ESNext
- **Module**: NodeNext
- **JSX**: react-jsx (hono/jsx)
- **严格模式**: 已启用
- **路径别名**: 测试中 `@` 指向 `src/`

## 开发约束

❌ **不创建**:
- 测试文件（由 test-generator 技能生成）
- CI/CD、Docker、K8s 配置
- 监控日志配置

✅ **专注于**:
- 业务逻辑实现
- 数据库 Schema 和迁移
- API 路由和控制器
- 类型定义和验证
- 代码重构和 Bug 修复
