---
name: service-generator
description: Generate service layer with database operations for Hono + Drizzle projects. Creates services with CRUD methods, soft delete patterns, and proper Drizzle query builder usage.
---

# Service Layer Generator

This skill creates service layer files with database operations using Drizzle ORM, following the project's established patterns including soft delete implementation.

## When to Use This Skill

Use this skill when the user asks to:
- "Create a service" or "Add service layer"
- "Create database operations for X"
- "Add service methods for [resource]"
- "Create business logic for [table]"

## What This Skill Generates

A complete service with 5 CRUD methods:
1. `getAll[Resource]()` - Get all records (filtered by soft delete)
2. `get[Resource]ById(id)` - Get single record by ID
3. `create[Resource](data)` - Insert new record
4. `update[Resource](id, data)` - Update existing record
5. `delete[Resource](id)` - Soft delete record

## How to Use

### Step 1: Ask for Service Details

Ask the user for:
- **Resource name** (singular, e.g., "product", "order")
- **Table name** if different from resource
- **Fields** that will be inserted/updated

Example prompt:
```
I'll create a service layer for you. Please provide:
1. Resource name (singular): e.g., "product"
2. Fields for insert/update: e.g., "name, price, description, stock"
```

### Step 2: Create Service File

Create `src/services/[resource].service.ts`:

```typescript
import { db } from '../index';
import { [table]Table as [table] } from '../db/schema/[table]';
import { and, eq, isNull } from 'drizzle-orm';

export const [Resource]Service = {
  /**
   * Get all [resource] records
   * @returns Array of [resource] objects
   */
  async getAll[Resource]() {
    return await db
      .select()
      .from([table])
      .where(isNull([table].deleted_at));
  },

  /**
   * Get a single [resource] by ID
   * @param id - The [resource] ID
   * @returns [Resource] object or null if not found
   */
  async get[Resource]ById(id: number) {
    const result = await db
      .select()
      .from([table])
      .where(
        and(
          eq([table].id, id),
          isNull([table].deleted_at)
        )
      );
    return result[0] || null;
  },

  /**
   * Create a new [resource]
   * @param data - [Resource] data to insert
   * @returns Created [resource] object
   */
  async create[Resource](data: {
    field1: string;
    field2: number;
    field3?: string;
  }) {
    const result = await db
      .insert([table])
      .values({
        ...data,
        updated_at: new Date(),
      })
      .returning();
    return result[0];
  },

  /**
   * Update an existing [resource]
   * @param id - The [resource] ID
   * @param data - Partial [resource] data to update
   * @returns Updated [resource] object or null if not found
   */
  async update[Resource](
    id: number,
    data: Partial<{
      field1: string;
      field2: number;
      field3: string;
    }>
  ) {
    const result = await db
      .update([table])
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(
        and(
          eq([table].id, id),
          isNull([table].deleted_at)
        )
      )
      .returning();
    return result[0] || null;
  },

  /**
   * Soft delete a [resource]
   * @param id - The [resource] ID
   * @returns Deleted [resource] object or null if not found
   */
  async delete[Resource](id: number) {
    const result = await db
      .update([table])
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(
        and(
          eq([table].id, id),
          isNull([table].deleted_at)
        )
      )
      .returning();
    return result[0] || null;
  }
};
```

## Key Patterns

### 1. Always Use Soft Delete

All queries must filter by `deleted_at`:

```typescript
.where(isNull([table].deleted_at))

// Or with multiple conditions:
.where(
  and(
    eq([table].id, id),
    isNull([table].deleted_at)
  )
)
```

### 2. Use `.returning()` for Insert/Update/Delete

Get the modified data back:

```typescript
const result = await db
  .insert([table])
  .values(data)
  .returning();
return result[0]; // Drizzle returns array
```

### 3. Handle Array Results

Drizzle `select()` returns an array:

```typescript
const result = await db
  .select()
  .from([table])
  .where(eq([table].id, id));

return result[0] || null; // Get first item or null
```

### 4. Always Update `updated_at`

On insert and update:

```typescript
.insert([table])
.values({
  ...data,
  updated_at: new Date(), // Add this
})
```

### 5. Use Proper Drizzle Operators

Import from `drizzle-orm`:

```typescript
import { eq, and, or, ne, gt, gte, lt, lte, like, ilike, isNull, isNotNull } from 'drizzle-orm';
```

**Common operators:**
- `eq(table.column, value)` - equals
- `ne(table.column, value)` - not equals
- `gt(table.column, value)` - greater than
- `gte(table.column, value)` - greater than or equal
- `lt(table.column, value)` - less than
- `lte(table.column, value)` - less than or equal
- `like(table.column, pattern)` - LIKE (case-sensitive)
- `ilike(table.column, pattern)` - ILIKE (case-insensitive)
- `isNull(table.column)` - IS NULL
- `isNotNull(table.column)` - IS NOT NULL
- `and(...conditions)` - AND multiple conditions
- `or(...conditions)` - OR multiple conditions

## Advanced Query Patterns

### With Relationships (Joins)

```typescript
async get[Resource]WithUser(id: number) {
  const result = await db
    .select({
      // Select from main table
      id: [table].id,
      name: [table].name,
      // Select from joined table
      userName: usersTable.name,
      userEmail: usersTable.email,
    })
    .from([table])
    .innerJoin(usersTable, eq([table].user_id, usersTable.id))
    .where(
      and(
        eq([table].id, id),
        isNull([table].deleted_at)
      )
    );
  return result[0] || null;
}
```

### With Pagination

```typescript
async get[Resource]sPaginated(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;

  const results = await db
    .select()
    .from([table])
    .where(isNull([table].deleted_at))
    .limit(limit)
    .offset(offset);

  return results;
}
```

### With Sorting

```typescript
async get[Resource]sSorted(sortBy: string = 'created_at', order: 'asc' | 'desc' = 'desc') {
  return await db
    .select()
    .from([table])
    .where(isNull([table].deleted_at))
    .orderBy(order === 'asc' ? asc([table][sortBy]) : desc([table][sortBy]));
}

// Import asc/desc:
import { asc, desc } from 'drizzle-orm';
```

### With Filtering

```typescript
async get[Resource]sByStatus(status: string) {
  return await db
    .select()
    .from([table])
    .where(
      and(
        eq([table].status, status),
        isNull([table].deleted_at)
      )
    );
}

async search[Resource]s(searchTerm: string) {
  return await db
    .select()
    .from([table])
    .where(
      and(
        or(
          ilike([table].name, `%${searchTerm}%`),
          ilike([table].description, `%${searchTerm}%`)
        ),
        isNull([table].deleted_at)
      )
    );
}
```

### With Count

```typescript
async get[Resource]Count() {
  const result = await db
    .select({ count: count() })
    .from([table])
    .where(isNull([table].deleted_at));

  return result[0].count;
}

// Import count:
import { count } from 'drizzle-orm';
```

## Service Template

Use this template for quick generation:

```typescript
import { db } from '../index';
import { [table]Table as [table] } from '../db/schema/[table]';
import { and, eq, isNull } from 'drizzle-orm';

export const [Resource]Service = {
  async getAll[Resource]() {
    return await db
      .select()
      .from([table])
      .where(isNull([table].deleted_at));
  },

  async get[Resource]ById(id: number) {
    const result = await db
      .select()
      .from([table])
      .where(
        and(
          eq([table].id, id),
          isNull([table].deleted_at)
        )
      );
    return result[0] || null;
  },

  async create[Resource](data: {
    // Add fields here
    field1: string;
    field2: number;
  }) {
    const result = await db
      .insert([table])
      .values({
        ...data,
        updated_at: new Date(),
      })
      .returning();
    return result[0];
  },

  async update[Resource](
    id: number,
    data: Partial<{
      // Add fields here
      field1: string;
      field2: number;
    }>
  ) {
    const result = await db
      .update([table])
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(
        and(
          eq([table].id, id),
          isNull([table].deleted_at)
        )
      )
      .returning();
    return result[0] || null;
  },

  async delete[Resource](id: number) {
    const result = await db
      .update([table])
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(
        and(
          eq([table].id, id),
          isNull([table].deleted_at)
        )
      )
      .returning();
    return result[0] || null;
  }
};
```

## Verification Checklist

After creating a service, verify:
- [ ] Imports database from `../index`
- [ ] Imports table schema from correct path
- [ ] Imports Drizzle operators (`and`, `eq`, `isNull`)
- [ ] All queries filter by `isNull([table].deleted_at)`
- [ ] `getAll` returns array
- [ ] `getById` returns single item or null
- [ ] `create` uses `.returning()` and returns result[0]
- [ ] `update` includes `updated_at` and filters by soft delete
- [ ] `delete` sets `deleted_at` and `updated_at`
- [ ] TypeScript types are correct for input data
