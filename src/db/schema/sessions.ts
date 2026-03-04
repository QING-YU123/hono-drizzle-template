import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./plugin/columns.helpers";
import { usersTable } from "./users";

export const sessionsTable = pgTable("sessions", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    user_id: integer("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: 'cascade' }),
    refresh_token_hash: varchar({ length: 255 }).notNull().unique(),
    expires_at: timestamp({ withTimezone: true }).notNull(),
    ...timestamps
});
