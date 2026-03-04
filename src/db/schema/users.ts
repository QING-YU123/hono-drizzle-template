import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./plugin/columns.helpers";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    password_hash: varchar({ length: 255 }).notNull(),
    is_admin: boolean().default(false).notNull(),
    ...timestamps
});
