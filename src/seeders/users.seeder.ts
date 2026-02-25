import { db } from '../index';
import { seed, reset } from 'drizzle-seed';
import { usersTable } from '../db/schema/users';

/**
 * User Seeder
 *
 * Resets users table and generates deterministic fake user data using drizzle-seed.
 * Run with: npx tsx src/seeders/users.seeder.ts
 *
 * Features:
 * - Clears existing users first (reset)
 * - Generates 50 realistic user records
 * - Uses seed 42 for reproducibility (same data every time)
 * - Creates random full names and email addresses
 * - Sets deleted_at to null so records appear in API responses
 */

async function main() {
  console.log('🗑️  Resetting users table...');
  await reset(db, { users: usersTable });
  console.log('✅ Users table cleared\n');

  console.log('🌱 Starting user seeder...');
  console.log('📊 Will generate 50 users with seed 42 for reproducibility\n');

  await seed(db, { users: usersTable }, { seed: 42 }).refine((funcs) => ({
    users: {
      columns: {
        name: funcs.fullName(),
        email: funcs.email(),
        // CRITICAL: Set deleted_at to null so records are active
        // This ensures they will be returned by API getAll() methods
        deleted_at: funcs.default({ defaultValue: null }),
      },
      count: 50,
    },
  }));

  console.log('\n✅ User seeder completed successfully!');
  console.log('📦 Generated 50 users with realistic names and emails');
  console.log('✨ All users are active (deleted_at = null)');
  console.log('🔒 Use seed 42 to generate the same data again');
}

main().catch((error) => {
  console.error('❌ Seeder failed:', error);
  process.exit(1);
});
