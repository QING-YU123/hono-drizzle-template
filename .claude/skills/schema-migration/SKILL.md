---
name: schema-migration
description: Automate Drizzle ORM schema creation and database push operations for Hono + Drizzle projects. Creates new table definitions with proper timestamps and soft delete, then pushes to database.
---

# Schema Migration

This skill helps create new database schemas using Drizzle ORM and push them to the PostgreSQL database.

## When to Use This Skill

Use this skill when the user asks to:
- "Create a new table" or "Add a new schema"
- "Add a database migration"
- "Create a model for X"
- "Push schema changes to database"

## What This Skill Does

1. Creates a new schema file in `src/db/schema/`
2. Includes standard timestamp fields (`created_at`, `updated_at`, `deleted_at`)
3. Runs `npx drizzle-kit push` to apply changes to database
4. Confirms successful migration

## How to Use

### Step 1: Ask for Table Details

Ask the user for:
- **Table name** (singular, e.g., "product", "order")
- **Fields** with types and constraints

Example prompt:
```
I'll create a new database table for you. Please provide:
1. Table name (singular): e.g., "product"
2. Fields with types: e.g., "name (string, 255, required, unique), price (numeric 10,2, required), description (text, optional)"
```

### Step 2: Create Schema File

Create `src/db/schema/[table].ts`:

```typescript
import { pgTable, serial, varchar, text, integer, numeric, boolean, timestamp } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt, deletedAt } from './plugin/columns.helpers';

export const [table]Table = pgTable('[table_name]', {
  id: serial('id').primaryKey(),

  // Add user fields here
  name: varchar('name', { length: 255 }).notNull().unique(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  is_active: boolean('is_active').notNull().default(true),

  ...createdAt,
  ...updatedAt,
  ...deletedAt,
});

export type [Table] = typeof [table]Table.$inferSelect;
export type New[Table] = typeof [table]Table.$inferInsert;
```

### Step 3: Push to Database

Run the migration command:

```bash
npx drizzle-kit push
```

### Step 4: Confirm Success

Report back to the user:
- What table was created
- What fields were added
- Confirmation that database was updated

## Column Type Reference

| Type | Drizzle Syntax | Example |
|------|----------------|---------|
| Auto-increment ID | `serial('id').primaryKey()` | Primary key |
| String (short) | `varchar('name', { length: n })` | Email, names |
| String (long) | `text('description')` | Descriptions, content |
| Integer | `integer('count')` | Counters, IDs |
| Decimal/Money | `numeric('price', { precision: 10, scale: 2 })` | Prices, measurements |
| Boolean | `boolean('is_active')` | Flags, states |
| Timestamp | `timestamp('published_at')` | Dates, times |

## Column Modifiers

| Modifier | Syntax | Description |
|----------|--------|-------------|
| Required | `.notNull()` | Field cannot be null |
| Unique | `.unique()` | Field must be unique |
| Default | `.default(value)` | Default value |
| Optional | (no modifier) | Field can be null |

## Timestamp Helpers

Always import and use the timestamp helpers from `columns.helpers.ts`:

```typescript
import { createdAt, updatedAt, deletedAt } from './plugin/columns.helpers';

// These add:
// created_at timestamp with default now()
// updated_at timestamp with default now()
// deleted_at timestamp (nullable, for soft delete)
```

## Common Patterns

### Product Table
```typescript
export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  sku: varchar('sku', { length: 100 }).unique(),
  stock: integer('stock').notNull().default(0),
  ...createdAt,
  ...updatedAt,
  ...deletedAt,
});
```

### Order Table
```typescript
export const ordersTable = pgTable('orders', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  ...createdAt,
  ...updatedAt,
  ...deletedAt,
});
```

### Category Table
```typescript
export const categoriesTable = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  parent_id: integer('parent_id').references(() => categoriesTable.id),
  ...createdAt,
  ...updatedAt,
  ...deletedAt,
});
```

## Foreign Key References

To reference another table:

```typescript
import { usersTable } from './users';

export const ordersTable = pgTable('orders', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  // ... other fields
  ...createdAt,
  ...updatedAt,
  ...deletedAt,
});
```

## Export Types

Always export TypeScript types for better type safety:

```typescript
export type Product = typeof productsTable.$inferSelect;
export type NewProduct = typeof productsTable.$inferInsert;
```

These types can be used in services and controllers:
- `Product` - For reading data (all fields including defaults)
- `NewProduct` - For creating data (only required/insertable fields)

## Verification Checklist

After creating a schema, verify:
- [ ] Table name is plural snake_case (e.g., `products`, `user_profiles`)
- [ ] All fields have appropriate types
- [ ] Required fields have `.notNull()`
- [ ] Unique fields have `.unique()`
- [ ] Timestamp helpers are included
- [ ] Types are exported
- [ ] `drizzle-kit push` was run successfully
- [ ] Table appears in database

## Example Complete Schema

```typescript
import { pgTable, serial, varchar, numeric, integer, text } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt, deletedAt } from './plugin/columns.helpers';

export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  stock: integer('stock').notNull().default(0),
  category_id: integer('category_id'),
  ...createdAt,
  ...updatedAt,
  ...deletedAt,
});

export type Product = typeof productsTable.$inferSelect;
export type NewProduct = typeof productsTable.$inferInsert;
```
