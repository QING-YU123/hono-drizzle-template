---
name: seeder-generator
description: Generate database seeder scripts using Drizzle Seed library. Creates automated seed data with drizzle-seed for deterministic, realistic test data generation.
---

# Drizzle Seeder Generator

This skill creates database seeder scripts using the official `drizzle-seed` library, which generates deterministic but realistic fake data for testing and development.

## What is drizzle-seed?

`drizzle-seed` is a TypeScript library that:
- Generates **deterministic** data (same seed = same data)
- Provides **realistic fake data** (names, emails, dates, etc.)
- Supports **relationships** between tables
- Uses **pseudo-random number generators** for reproducibility
- Works seamlessly with Drizzle ORM schemas

**Benefits:**
- ✅ Consistent test data across runs
- ✅ Easy debugging with predictable datasets
- ✅ Team collaboration via shared seed numbers
- ✅ No need to manually write sample data

## When to Use This Skill

Use this skill when the user asks to:
- "Create a seeder" or "Add seed data"
- "Populate database with fake data"
- "Generate test data for [resource]"
- "Create seed script for [resource]"

## Prerequisites

Install `drizzle-seed`:

```bash
npm install drizzle-seed
```

**Important:** Requires `drizzle-orm@0.33.0` or higher.

## How to Use

### Step 1: Create Seeder Directory (if doesn't exist)

```bash
mkdir -p src/seeders
```

### Step 2: Create Seeder Script

Create `src/seeders/[resource].seeder.ts` using the `drizzle-seed` library:

```typescript
import { db } from '../index';
import { seed, reset } from 'drizzle-seed';
import * as schema from '../db/schema';

/**
 * [Resource] Seeder
 *
 * Generates deterministic fake data using drizzle-seed.
 * Run with: tsx src/seeders/[resource].seeder.ts
 */

async function main() {
  console.log('🌱 Starting [resource] seeder...');

  // Reset table first (clears existing data)
  await reset(db, {
    [table]: schema.[table]Table
  });

  await seed(db, {
    [table]: schema.[table]Table
  }).refine((funcs) => ({
    [table]: {
      columns: {
        // Customize column data generation
        name: funcs.fullName(),
        email: funcs.email(),
        // IMPORTANT: Set deleted_at to null for active records
        deleted_at: funcs.default({ defaultValue: null }),
        // ... more columns
      },
      count: 10, // Number of records to generate
    },
  }));

  console.log('✅ Seeder completed!');
}

main().catch(console.error);
```

**Important:** Always set `deleted_at` to `null` using `funcs.default({ defaultValue: null })` to ensure records are active and will be returned by API queries that filter soft-deleted records.

### Step 3: Run the Seeder

```bash
tsx src/seeders/[resource].seeder.ts
```

## Available Generator Functions

`drizzle-seed` provides many generator functions via the `funcs` parameter:

### Basic Types
```typescript
// Numbers
funcs.int({ minValue: 1, maxValue: 100 })
funcs.number({ minValue: 1, maxValue: 100, precision: 100 })

// Strings
funcs.loremIpsum()
funcs.valuesFromArray({ values: ['a', 'b', 'c'] })

// Dates
funcs.date({ minDate: '2020-01-01', maxDate: '2024-12-31' })

// Defaults
funcs.default({ defaultValue: 'default-value' })
```

### Personal Data
```typescript
funcs.firstName()      // Random first name
funcs.lastName()       // Random last name
funcs.fullName()       // Full name
funcs.email()          // Random email
funcs.phoneNumber()    // Random phone number
funcs.jobTitle()       // Job title
```

### Location Data
```typescript
funcs.streetAddress()  // Street address
funcs.city()           // City name
funcs.state()          // State/region
funcs.country()        // Country name
funcs.postcode()       // Postal code
```

### Business Data
```typescript
funcs.companyName()    // Company name
```

### Advanced Features
```typescript
// Weighted random (choose between options with probabilities)
funcs.weightedRandom([
  { weight: 0.7, value: funcs.int({ minValue: 10, maxValue: 100 }) },
  { weight: 0.3, value: funcs.int({ minValue: 100, maxValue: 200 }) }
])

// Unique values
funcs.int({ minValue: 1000, maxValue: 2000, isUnique: true })

// Custom phone format
funcs.phoneNumber({ template: '(###) ###-####' })
```

## Seeder Options

### Global Options

```typescript
await seed(db, schema, {
  count: 100,    // Default count for all tables
  seed: 12345,   // Custom seed number for reproducibility
});
```

### Per-Table Options

```typescript
await seed(db, schema).refine((funcs) => ({
  users: {
    count: 50,  // Override global count for this table
    columns: { /* ... */ },
  },
}));
```

## Examples

### Example 1: Simple User Seeder

```typescript
import { db } from '../index';
import { seed } from 'drizzle-seed';
import { usersTable } from '../db/schema/users';

async function main() {
  console.log('🌱 Starting user seeder...');

  await seed(db, { users: usersTable }).refine((funcs) => ({
    users: {
      columns: {
        name: funcs.fullName(),
        email: funcs.email(),
        deleted_at: funcs.default({ defaultValue: null }),
      },
      count: 20,
    },
  }));

  console.log('✅ Seeder completed!');
}

main().catch(console.error);
```

### Example 2: Product Seeder with Custom Data

```typescript
import { db } from '../index';
import { seed } from 'drizzle-seed';
import { productsTable } from '../db/schema/products';

async function main() {
  console.log('🌱 Starting product seeder...');

  const productNames = [
    'Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones',
    'Webcam', 'Speaker', 'Tablet', 'Printer', 'Scanner'
  ];

  await seed(db, { products: productsTable }).refine((funcs) => ({
    products: {
      columns: {
        name: funcs.valuesFromArray({ values: productNames }),
        slug: funcs.valuesFromArray({
          values: productNames.map(n => n.toLowerCase())
        }),
        price: funcs.number({ minValue: 10, maxValue: 1000, precision: 100 }),
        description: funcs.loremIpsum(),
        stock: funcs.int({ minValue: 0, maxValue: 500 }),
      },
      count: 50,
    },
  }));

  console.log('✅ Seeder completed!');
}

main().catch(console.error);
```

### Example 3: Weighted Random for Prices

```typescript
await seed(db, { products: productsTable }).refine((funcs) => ({
  products: {
    columns: {
      name: funcs.companyName(),
      // 70% cheap products (10-100), 30% expensive (100-1000)
      price: funcs.weightedRandom([
        {
          weight: 0.7,
          value: funcs.number({ minValue: 10, maxValue: 100, precision: 100 })
        },
        {
          weight: 0.3,
          value: funcs.number({ minValue: 100, maxValue: 1000, precision: 100 })
        }
      ]),
      stock: funcs.int({ minValue: 0, maxValue: 500 }),
    },
    count: 100,
  },
}));
```

### Example 4: Related Tables with Relationships

```typescript
import { db } from '../index';
import { seed } from 'drizzle-seed';
import * as schema from '../db/schema';

async function main() {
  console.log('🌱 Starting seeder with relationships...');

  await seed(db, schema).refine((funcs) => ({
    users: {
      columns: {
        name: funcs.fullName(),
        email: funcs.email(),
      },
      count: 20,
      // Create 5-10 posts for each user
      with: {
        posts: funcs.int({ minValue: 5, maxValue: 10 })
      }
    },
    posts: {
      columns: {
        title: funcs.loremIpsum(),
        content: funcs.loremIpsum(),
      },
    },
  }));

  console.log('✅ Seeder completed!');
}

main().catch(console.error);
```

### Example 5: Complex Seeder with Multiple Tables

```typescript
import { db } from '../index';
import { seed } from 'drizzle-seed';
import * as schema from '../db/schema';

async function main() {
  console.log('🌱 Starting complex seeder...');

  await seed(db, schema).refine((funcs) => ({
    customers: {
      columns: {
        companyName: funcs.companyName(),
        contactName: funcs.fullName(),
        contactTitle: funcs.jobTitle(),
        address: funcs.streetAddress(),
        city: funcs.city(),
        postalCode: funcs.postcode(),
        country: funcs.country(),
        phone: funcs.phoneNumber({ template: '(###) ###-####' }),
      },
      count: 100,
      with: {
        orders: 10 // 10 orders per customer
      }
    },
    orders: {
      columns: {
        orderDate: funcs.date({ minDate: '2023-01-01', maxDate: '2024-12-31' }),
        freight: funcs.number({ minValue: 0, maxValue: 1000, precision: 100 }),
        shipAddress: funcs.streetAddress(),
        shipCity: funcs.city(),
        shipCountry: funcs.country(),
      },
      with: {
        details: [1, 2, 3, 4, 5] // 1-5 details per order
      }
    },
    details: {
      columns: {
        quantity: funcs.int({ minValue: 1, maxValue: 100 }),
        unitPrice: funcs.number({ minValue: 10, maxValue: 500, precision: 100 }),
      },
    },
  }));

  console.log('✅ Seeder completed!');
}

main().catch(console.error);
```

### Example 6: Seeder with Custom Seed for Reproducibility

```typescript
import { db } from '../index';
import { seed } from 'drizzle-seed';
import * as schema from '../db/schema';

async function main() {
  console.log('🌱 Starting deterministic seeder...');

  // Using a custom seed number ensures the same data every time
  await seed(db, schema, { seed: 42 }).refine((funcs) => ({
    users: {
      columns: {
        name: funcs.fullName(),
        email: funcs.email(),
      },
      count: 50,
    },
  }));

  console.log('✅ Seeder completed! (Same data every time with seed 42)');
}

main().catch(console.error);
```

## Reset Database

`drizzle-seed` provides a `reset` function to clear all tables before seeding:

```typescript
import { db } from '../index';
import { seed, reset } from 'drizzle-seed';
import * as schema from '../db/schema';

async function main() {
  console.log('🗑️  Resetting database...');

  // Clear all tables (uses TRUNCATE with CASCADE for PostgreSQL)
  await reset(db, schema);

  console.log('🌱 Seeding database...');
  await seed(db, schema).refine((funcs) => ({
    users: {
      columns: {
        name: funcs.fullName(),
        email: funcs.email(),
      },
      count: 50,
    },
  }));

  console.log('✅ Database reset and seeded!');
}

main().catch(console.error);
```

## Running Seeders

### Run Individual Seeder

```bash
tsx src/seeders/users.seeder.ts
tsx src/seeders/products.seeder.ts
```

### Run All Seeders

Create `src/seeders/index.ts`:

```typescript
import { db } from '../index';
import { seed, reset } from 'drizzle-seed';
import * as schema from '../db/schema';

async function seedAll(): Promise<void> {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Optional: Reset database first
    await reset(db, schema);
    console.log('✅ Database reset\n');

    // Seed all tables with relationships
    await seed(db, schema, { seed: 12345 }).refine((funcs) => ({
      users: {
        columns: {
          name: funcs.fullName(),
          email: funcs.email(),
        },
        count: 100,
        with: {
          posts: 10
        }
      },
      posts: {
        columns: {
          title: funcs.loremIpsum(),
          content: funcs.loremIpsum(),
        },
      },
      categories: {
        columns: {
          name: funcs.companyName(),
          slug: funcs.valuesFromArray({
            values: ['tech', 'news', 'sports', 'arts']
          }),
        },
        count: 10,
      },
    }));

    console.log('\n✨ All seeders completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedAll()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
```

Run with:
```bash
tsx src/seeders/index.ts
```

## Best Practices

### 1. Use Seed Numbers for Reproducibility

Always specify a seed number in production/testing:

```typescript
await seed(db, schema, { seed: 42 });
```

### 2. Seed Relationships Correctly

The `with` option only works for **one-to-many** relationships:

```typescript
// ✅ CORRECT: Users have many posts
users: {
  with: {
    posts: 10  // Each user gets 10 posts
  }
}

// ❌ WRONG: Posts don't have many users
posts: {
  with: {
    users: 1  // This won't work
  }
}
```

### 3. Handle Circular Dependencies

For tables with circular references, use separate seed calls:

```typescript
// First, seed parent tables
await seed(db, { users: usersTable }).refine(/* ... */);

// Then, seed child tables separately
await seed(db, { posts: postsTable }).refine(/* ... */);
```

### 4. Reset Before Seeding in Tests

Always reset database before running tests:

```typescript
beforeEach(async () => {
  await reset(db, schema);
  await seed(db, schema, { seed: 42 });
});
```

### 5. Use Weighted Random for Realistic Data

Create realistic distributions:

```typescript
// 70% regular users, 30% premium users
subscriptionType: funcs.weightedRandom([
  { weight: 0.7, value: funcs.default({ defaultValue: 'regular' }) },
  { weight: 0.3, value: funcs.default({ defaultValue: 'premium' }) }
])
```

### 6. Handle Soft Delete Fields (deleted_at)

**CRITICAL:** When using soft delete patterns (common in this template), always set `deleted_at` to `null` for active records:

```typescript
await seed(db, { users: usersTable }).refine((funcs) => ({
  users: {
    columns: {
      name: funcs.fullName(),
      email: funcs.email(),
      // IMPORTANT: Set deleted_at to null for active records
      deleted_at: funcs.default({ defaultValue: null }),
    },
    count: 50,
  },
}));
```

**Why this matters:**
- API queries typically filter out records where `deleted_at IS NOT NULL`
- If `deleted_at` has a value, records won't appear in `getAll()` responses
- Setting it to `null` ensures seeded data is visible and usable

**For testing soft delete functionality:**
```typescript
// Create mostly active records, some soft-deleted
deleted_at: funcs.weightedRandom([
  { weight: 0.9, value: funcs.default({ defaultValue: null }) },    // 90% active
  { weight: 0.1, value: funcs.date({ minDate: '2024-01-01', maxDate: '2024-12-31' }) } // 10% deleted
])
```

## Limitations

### Type Limitations

- The `with` option may show all tables in autocomplete (due to TypeScript limitations)
- You must manually select the correct one-to-many relationships
- Drizzle table third parameter types are not currently supported

### Relationship Limitations

- `with` only works for one-to-many relationships
- Cannot handle circular dependencies in a single `seed()` call
- Many-to-many relationships require separate seeding

## Troubleshooting

### Issue: "Cannot read property of undefined"

**Solution:** Make sure you're using `drizzle-orm@0.33.0` or higher:

```bash
npm update drizzle-orm
```

### Issue: Foreign key constraints failing

**Solution:** Use `reset()` before seeding, or seed in the correct order:

```typescript
// 1. Reset database
await reset(db, schema);

// 2. Seed parent tables first
await seed(db, { users: usersTable });

// 3. Then seed child tables
await seed(db, { posts: postsTable });
```

### Issue: Different data on each run

**Solution:** Use a fixed seed number:

```typescript
await seed(db, schema, { seed: 12345 });
```

## Verification Checklist

After creating a seeder, verify:
- [ ] `drizzle-seed` is installed
- [ ] `drizzle-orm` is version 0.33.0 or higher
- [ ] Seeder imports `db` from `../index`
- [ ] Seeder imports schema from `../db/schema`
- [ ] Uses `seed()` function with `.refine()`
- [ ] Specifies `count` for each table
- [ ] Uses appropriate generator functions
- [ ] Handles relationships correctly (one-to-many only)
- [ ] Can be run with `tsx`
- [ ] Provides console logging for feedback
