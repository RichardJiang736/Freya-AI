import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const userGenres = sqliteTable('user_genres', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  genre: text('genre').notNull(),
});
