# Hono + Drizzle ORM API 模板

基于 Hono + Drizzle ORM + PostgreSQL 的 TypeScript API 项目模板，集成完整的 AI 辅助开发技能系统。

## 快速开始

```bash
# 安装依赖
pnpm install

# 配置数据库
cp .env.example .env
# 编辑 .env 文件，设置 DATABASE_URL

# 推送数据库结构
pnpm drizzle-kit push

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3001

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 (端口 3001) |
| `pnpm build` | TypeScript 编译到 `dist/` |
| `pnpm start` | 运行生产版本 |
| `pnpm drizzle-kit push` | 推送 schema 到数据库 |
| `pnpm drizzle-kit studio` | 打开数据库管理界面 |
| `pnpm test` | 运行所有测试 |
| `pnpm test:ui` | 打开 Vitest UI |
| `pnpm test:coverage` | 生成覆盖率报告 |

## 项目结构

```
.
├── src/                       # 源代码
│   ├── controllers/           # API 路由控制器
│   ├── services/              # 业务逻辑层
│   ├── db/                    # 数据库配置
│   │   └── schema/            # 数据库表结构定义
│   └── seeders/               # 数据库种子数据
├── tests/                     # 测试代码
│   ├── api/                   # API 集成测试
│   └── utils/                 # 测试辅助函数
├── business/                  # 业务文档
│   ├── global/                # 全局业务文档
│   └── iterations/            # 版本迭代文档
└── .claude/skills/            # AI 辅助开发技能
```

## 技术栈

- **框架**: [Hono](https://hono.dev/) - 快速、轻量、类型安全的 Web 框架
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - 类型安全的 TypeScript ORM
- **数据库**: PostgreSQL
- **测试**: [Vitest](https://vitest.dev/)
- **语言**: TypeScript
- **包管理**: pnpm

## AI 辅助开发流程

项目内置完整的 Skills 系统，实现从设计到实现的自动化开发流程：

```
1. 📋 版本设计 (version-designer)
2. 🗄️ 数据库设计 (schema-generator)
3. 💼 业务逻辑实现 (business-generator)
4. 📚 API 文档生成 (openapi-generator)
5. 🧪 测试用例设计 (test-case-designer)
6. ✅ 测试代码生成 (test-generator)
7. 🔍 代码审查 (code-reviewer)
```

### 快速启动

```
开始新版本开发
```

或使用项目编排器：

```
/project-orchestrator
```

### Skills 快速参考

| Skill | 用途 |
|-------|------|
| `version-designer` | 设计新版本，评估兼容性 |
| `schema-generator` | 设计数据库表结构 |
| `business-generator` | 生成业务逻辑代码 |
| `openapi-generator` | 生成 API 文档 |
| `test-case-designer` | 设计测试用例 |
| `test-generator` | 生成测试代码并运行 |

详见 [Skills 链使用指南](./business/SKILLS_CHAIN_GUIDE.md)

## 开发规范

- **Controller 层**: 处理 HTTP 请求/响应，参数验证
- **Service 层**: 业务逻辑和数据库操作
- **软删除**: 所有表实现软删除（`deleted_at` 字段）
- **JSDoc 注释**: Controller 方法必须包含完整的 JSDoc 注释

详见 [CLAUDE.md](./CLAUDE.md)

## 数据库配置

确保 `.env` 文件中配置了正确的 `DATABASE_URL`：

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

## 更多文档

- [Skills 系统文档](./business/SKILLS_CHAIN_GUIDE.md) - AI 辅助开发技能完整指南
- [测试系统指南](./tests/README.md) - 测试流程和规范
- [业务文档](./business/) - 版本需求和设计
