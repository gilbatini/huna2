import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('records',{id:text('id').primaryKey(),kind:text('kind').notNull(),data:text('data').notNull()});
export const members = sqliteTable('members',{email:text('email').primaryKey(),userId:text('user_id'),role:text('role').notNull(),permissions:text('permissions').notNull(),tenant:text('tenant').notNull().default('')});
export const settings = sqliteTable('settings',{id:text('id').primaryKey(),value:text('value').notNull()});
