---
name: crud-generator
description: Generate complete CRUD functionality (schema, service, controller) for new resources in Hono + Drizzle projects. Automatically creates database schema, service layer with soft delete patterns, and REST controller with validation.
---

# CRUD Generator

This skill generates complete CRUD (Create, Read, Update, Delete) functionality for new resources in Hono + Drizzle projects, following the established project patterns.

## When to Use This Skill

Use this skill when the user asks to:
- "Create a new resource" or "Add a new model"
- "Generate CRUD for products/orders/etc"
- "Add a new API endpoint for X"
- "Create a new table with full API"

## What This Skill Generates

For a given resource name (e.g., "products", "orders", "categories"), this skill creates:

1. **Database Schema** (`src/db/schema/[resource].ts`)
   - Table definition with id, timestamps, soft delete
   - Proper column types and constraints
   - Uses `columns.helpers.ts` for timestamp fields

2. **Service Layer** (`src/services/[resource].service.ts`)
   - `getAll[Resource]()`, `get[Resource]ById()`
   - `create[Resource]()`, `update[Resource]()`, `delete[Resource]()`
   - Soft delete implementation
   - All queries filter by `isNull(table.deleted_at)`

3. **Controller** (`src/controllers/[resource].controller.ts`)
   - GET `/api/[resource]` - List all
   - GET `/api/[resource]/:id` - Get by ID
   - POST `/api/[resource]` - Create new
   - PUT `/api/[resource]/:id` - Update
   - DELETE `/api/[resource]/:id` - Soft delete
   - Full validation and error handling

4. **Route Registration** (updates `src/index.ts`)
   - Auto-registers the new controller

## How to Use

### Step 1: Ask for Resource Details

Ask the user for:
- **Resource name** (singular form, e.g., "product", "order")
- **Fields** (name, type, required/optional)

Example prompt:
```
I'll create a new resource for you. Please provide:
1. Resource name (singular): e.g., "product"
2. Fields needed: e.g., "name (string, required), price (number, required), description (string, optional)"
```

### Step 2: Generate Schema File

Create `src/db/schema/[resource].ts` following the pattern from `users.ts`:

```typescript
import { pgTable, serial, text, varchar, integer } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt, deletedAt } from './plugin/columns.helpers';

export const [resource]Table = pgTable('[resource_table_name]', {
  id: serial('id').primaryKey(),
  // Add fields based on user input
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  ...createdAt,
  ...updatedAt,
  ...deletedAt,
});
```

**Important:**
- Use table name in snake_case plural form
- Use appropriate column types (text, varchar, integer, numeric, boolean, timestamp)
- Add `.notNull()` for required fields
- Add `.unique()` for unique constraints

### Step 3: Generate Service File

Create `src/services/[resource].service.ts` following the pattern from `user.service.ts`:

```typescript
import { db } from '../index';
import { [resource]Table as [resource] } from '../db/schema/[resource]';
import { and, eq, isNull } from 'drizzle-orm';

export const [Resource]Service = {
  async getAll[Resource]() {
    return await db
      .select()
      .from([resource])
      .where(isNull([resource].deleted_at));
  },

  async get[Resource]ById(id: number) {
    const result = await db
      .select()
      .from([resource])
      .where(and(eq([resource].id, id), isNull([resource].deleted_at)));
    return result[0] || null;
  },

  async create[Resource](data: { field1: string; field2: number }) {
    const result = await db
      .insert([resource])
      .values({ ...data, updated_at: new Date() })
      .returning();
    return result[0];
  },

  async update[Resource](id: number, data: Partial<{ field1: string; field2: number }>) {
    const result = await db
      .update([resource])
      .set({ ...data, updated_at: new Date() })
      .where(and(eq([resource].id, id), isNull([resource].deleted_at)))
      .returning();
    return result[0] || null;
  },

  async delete[Resource](id: number) {
    const result = await db
      .update([resource])
      .set({ deleted_at: new Date(), updated_at: new Date() })
      .where(and(eq([resource].id, id), isNull([resource].deleted_at)))
      .returning();
    return result[0] || null;
  }
};
```

### Step 4: Generate Controller File

Create `src/controllers/[resource].controller.ts` following the pattern from `user.controller.ts`:

```typescript
import { Hono } from 'hono';
import { [Resource]Service } from '../services/[resource].service';

const [resource]Controller = new Hono();

[resource]Controller.get('/', async (c) => {
  const data = await [Resource]Service.getAll[Resource]();
  return c.json(data);
});

[resource]Controller.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ message: 'Invalid id' }, 400);
  }
  const data = await [Resource]Service.get[Resource]ById(id);
  if (!data) {
    return c.json({ message: '[Resource] not found' }, 404);
  }
  return c.json(data);
});

[resource]Controller.post('/', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: 'Invalid JSON body' }, 400);
  }

  // Validate fields based on schema
  const { field1, field2 } = (body ?? {}) as { field1?: unknown; field2?: unknown };

  if (typeof field1 !== 'string' || field1.trim().length === 0) {
    return c.json({ message: 'field1 is required' }, 400);
  }

  try {
    const data = await [Resource]Service.create[Resource]({ field1: field1.trim(), field2 });
    return c.json(data, 201);
  } catch (err) {
    if (typeof err === 'object' && err && 'code' in err && (err as any).code === '23505') {
      return c.json({ message: 'Already exists' }, 409);
    }
    throw err;
  }
});

[resource]Controller.put('/:id', async (c) => {
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

  const { field1, field2 } = (body ?? {}) as { field1?: unknown; field2?: unknown };
  const payload: Partial<{ field1: string; field2: number }> = {};

  if (field1 !== undefined) {
    if (typeof field1 !== 'string' || field1.trim().length === 0) {
      return c.json({ message: 'field1 must be a non-empty string' }, 400);
    }
    payload.field1 = field1.trim();
  }

  if (field2 !== undefined) {
    payload.field2 = field2;
  }

  if (Object.keys(payload).length === 0) {
    return c.json({ message: 'Nothing to update' }, 400);
  }

  try {
    const data = await [Resource]Service.update[Resource](id, payload);
    if (!data) {
      return c.json({ message: '[Resource] not found' }, 404);
    }
    return c.json(data);
  } catch (err) {
    if (typeof err === 'object' && err && 'code' in err && (err as any).code === '23505') {
      return c.json({ message: 'Already exists' }, 409);
    }
    throw err;
  }
});

[resource]Controller.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ message: 'Invalid id' }, 400);
  }

  const data = await [Resource]Service.delete[Resource](id);
  if (!data) {
    return c.json({ message: '[Resource] not found' }, 404);
  }

  return c.json({ message: 'Deleted', data });
});

export default [resource]Controller;
```

### Step 5: Update Route Registration

Update `src/index.ts` to register the new route:

```typescript
import [resource]Controller from './controllers/[resource].controller';

// Add after existing routes
app.route('/api/[resource]s', [resource]Controller);
```

### Step 6: Push Schema to Database

After generating the schema, run:

```bash
npx drizzle-kit push
```

## Field Type Mappings

| User Input | Drizzle Type | Example |
|-----------|--------------|---------|
| string (short) | `varchar(n)` | `varchar('name', { length: 255 })` |
| string (long) | `text` | `text('description')` |
| number (int) | `integer` | `integer('count')` |
| number (decimal) | `numeric` | `numeric('price', { precision: 10, scale: 2 })` |
| boolean | `boolean` | `boolean('is_active')` |
| date | `timestamp` | `timestamp('created_at')` |
| email | `varchar` | `varchar('email', { length: 255 })` |

## Example Usage

User: "Create a product resource with name, price, and description"

Assistant generates:
- `src/db/schema/products.ts`
- `src/services/product.service.ts`
- `src/controllers/product.controller.ts`
- Updates `src/index.ts` with `/api/products` route

## Important Patterns to Follow

1. **Always use soft delete** - Set `deleted_at` instead of actual deletion
2. **Filter deleted records** - All queries must include `where(isNull(table.deleted_at))`
3. **Validate input** - Check types and trim strings
4. **Handle unique violations** - Return 409 for PostgreSQL error code 23505
5. **Use returning()** - Get inserted/updated data back from database
6. **Proper HTTP status codes** - 200 (OK), 201 (Created), 400 (Bad Request), 404 (Not Found), 409 (Conflict)
