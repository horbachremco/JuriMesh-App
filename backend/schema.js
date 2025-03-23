const { pgTable, text, integer, serial, timestamp } = require('drizzle-orm/pg-core');

const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: text('username').notNull(),
    created_at: timestamp('created_at').defaultNow()
});

const risks = pgTable('risks', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    score: integer('score').notNull(),
    category: text('category').notNull(),
    user_id: integer('user_id').notNull().references(() => users.id),
    created_at: timestamp('created_at').defaultNow()
});

const comments = pgTable('comments', {
    id: serial('id').primaryKey(),
    risk_id: integer('risk_id').notNull().references(() => risks.id).onDelete('cascade'),
    user_id: integer('user_id').notNull().references(() => users.id),
    comment: text('comment').notNull(),
    created_at: timestamp('created_at').defaultNow()
});

const risk_assignments = pgTable('risk_assignments', {
    risk_id: integer('risk_id').notNull().references(() => risks.id).onDelete('cascade'),
    user_id: integer('user_id').notNull().references(() => users.id),
    assigned_at: timestamp('assigned_at').defaultNow(),
    primary: ['risk_id', 'user_id']
});

module.exports = { users, risks, comments, risk_assignments };
