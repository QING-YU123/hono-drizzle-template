# Hono-Drizzle Development Skills

This directory contains 6 custom skills for accelerating development of Hono + Drizzle ORM projects.

## Available Skills

### 1. CRUD Generator (`crud-generator`)
**Purpose**: Generate complete CRUD functionality (schema, service, controller) for new resources

**What it does**:
- Creates database schema with timestamps and soft delete
- Generates service layer with all CRUD operations
- Creates REST controller with validation
- Auto-registers routes in `src/index.ts`

**Usage**: Ask to "create CRUD for [resource]"

**Files**: `.claude/skills/crud-generator/SKILL.md`

---

### 2. Schema Migration (`schema-migration`)
**Purpose**: Automate Drizzle schema creation and database push

**What it does**:
- Creates new table definitions in `src/db/schema/`
- Includes standard timestamp fields
- Runs `npx drizzle-kit push`
- Confirms successful migration

**Usage**: Ask to "create a table for [resource]" or "add migration for [resource]"

**Files**: `.claude/skills/schema-migration/SKILL.md`

---

### 3. Route Generator (`route-generator`)
**Purpose**: Create REST API endpoints with proper validation

**What it does**:
- Generates Hono controller with GET, POST, PUT, DELETE
- Includes input validation and error handling
- Returns appropriate HTTP status codes
- Handles unique constraint violations

**Usage**: Ask to "create API endpoints for [resource]" or "add routes for [resource]"

**Files**: `.claude/skills/route-generator/SKILL.md`

---

### 4. Service Layer Generator (`service-generator`)
**Purpose**: Build service methods with database operations

**What it does**:
- Creates service with getAll, getById, create, update, delete
- Implements soft delete patterns
- Uses Drizzle query builder correctly
- Includes advanced query patterns (joins, pagination, filtering)

**Usage**: Ask to "create service for [resource]" or "add business logic for [resource]"

**Files**: `.claude/skills/service-generator/SKILL.md`

---

### 5. TypeScript Validator Generator (`validator-generator`)
**Purpose**: Create request validation schemas

**What it does**:
- Generates validation functions for request bodies
- Type-safe validation with clear error messages
- Supports inline validation (current pattern) or Zod
- Validates strings, numbers, emails, booleans, IDs

**Usage**: Ask to "create validation for [resource]" or "add input validation"

**Files**: `.claude/skills/validator-generator/SKILL.md`

---

### 6. Seeder Script Generator (`seeder-generator`)
**Purpose**: Generate database seed data scripts

**What it does**:
- Creates seeder scripts in `src/seeders/`
- Inserts sample records with duplicate checking
- Uses Drizzle insert patterns
- Can be run with `tsx seeders/[name].seeder.ts`

**Usage**: Ask to "create seeder for [resource]" or "add seed data"

**Files**: `.claude/skills/seeder-generator/SKILL.md`

---

## How to Use These Skills

These skills are project-local and will be automatically available when working in this project.

### Example Conversations

**Creating a complete resource**:
```
You: Create CRUD for products with name, price, description, and stock

AI: I'll create complete CRUD functionality for products...

[Generates schema, service, controller, and registers routes]
```

**Adding just validation**:
```
You: Add validation for the product endpoints

AI: I'll create validation functions for products...

[Generates validator file]
```

**Creating seed data**:
```
You: Create a seeder with 10 sample products

AI: I'll create a seeder script for products with 10 sample records...

[Generates seeder file]
```

## Project-Specific Patterns

These skills follow the project's established patterns:

✅ **Soft delete** - All queries filter by `deleted_at`
✅ **Timestamp helpers** - Use `columns.helpers.ts`
✅ **Hono patterns** - Controllers follow Hono conventions
✅ **Drizzle ORM** - Use query builder with `.returning()`
✅ **TypeScript** - Full type safety throughout
✅ **Error handling** - Proper HTTP status codes
✅ **Validation** - Input validation with clear errors

## What These Skills Don't Do

As specified in `CLAUDE.md`, these skills focus ONLY on code development:

❌ No test files (unit tests, integration tests, E2E tests)
❌ No CI/CD configurations
❌ No Docker files
❌ No deployment scripts
❌ No monitoring/logging setup

Testing, deployment, and infrastructure should be configured manually by your team.

## Skills Triggering

These skills will be automatically triggered based on context:

- When you ask to create resources/tables/endpoints
- When you need validation
- When you want seed data
- When you're working with database operations

The AI will automatically select the appropriate skill based on your request.

## Customization

Each skill can be customized by editing its `SKILL.md` file:

```
.claude/skills/
├── crud-generator/SKILL.md
├── route-generator/SKILL.md
├── schema-migration/SKILL.md
├── seeder-generator/SKILL.md
├── service-generator/SKILL.md
└── validator-generator/SKILL.md
```

## Verification

To verify skills are working, try:

```bash
# From your project directory
echo "Create a product resource with name and price" | claude
```

The AI should recognize the context and use the `crud-generator` skill.

---

**Created**: 2025-02-25
**Project**: Hono + Drizzle Template
**Skills Count**: 6
