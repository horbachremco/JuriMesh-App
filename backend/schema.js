const { pgTable, text, integer, serial, timestamp } = require('drizzle-orm/pg-core');

const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: text('username').notNull()
});

const risks = pgTable('risks', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    score: integer('score').notNull(),
    category: text('category').notNull(),
    user_id: integer('user_id').notNull().references(() => users.id)
});

const comments = pgTable('comments', {
    id: serial('id').primaryKey(),
    risk_id: integer('risk_id').notNull().references(() => risks.id),
    user_id: integer('user_id').notNull().references(() => users.id),
    comment: text('comment').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow()
});

const risk_assignments = pgTable('risk_assignments', {
    risk_id: integer('risk_id').notNull().references(() => risks.id),
    user_id: integer('user_id').notNull().references(() => users.id)
}, (table) => ({
    pk: { columns: [table.risk_id, table.user_id] }
}));

module.exports = { users, risks, comments, risk_assignments };
