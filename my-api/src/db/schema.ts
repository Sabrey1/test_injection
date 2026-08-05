import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer().primaryKey(),
  name: text().notNull(),
  password: text().notNull(),
});