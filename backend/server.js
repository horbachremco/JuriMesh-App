const Fastify = require("fastify");
const fastify = Fastify();
const cors = require("@fastify/cors");
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { users, risks, comments, risk_assignments } = require("./schema");
const { eq, and, sql } = require('drizzle-orm');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  timezone: 'Europe/Brussels'
});

// Set timezone for the connection
pool.on('connect', (client) => {
  client.query('SET timezone = "Europe/Brussels";');
});

const db = drizzle(pool);

fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
});

fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
  try {
    const json = JSON.parse(body);
    done(null, json);
  } catch (err) {
    err.statusCode = 400;
    done(err, undefined);
  }
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    return true;
  } catch (err) {
    throw new Error("Database connection error: " + err.message);
  }
}

fastify.get("/", async (req, reply) => {
  reply.send({ message: "Server is running" });
});

fastify.get("/users", async (request, reply) => {
  try {
    const allUsers = await db.select().from(users);
    return allUsers;
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.get("/risks", async (request, reply) => {
  try {
    const allRisks = await db.select({
      id: risks.id,
      title: risks.title,
      description: risks.description,
      score: risks.score,
      category: risks.category,
      user_id: risks.user_id
    }).from(risks);
    
    const assignments = await db.select({
      risk_id: risk_assignments.risk_id,
      user_id: risk_assignments.user_id
    }).from(risk_assignments);
    
    const result = allRisks.map(risk => ({
      ...risk,
      assigned_user_ids: assignments
        .filter(a => a.risk_id === risk.id)
        .map(a => a.user_id)
    }));
    
    return result;
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.post("/risks", async (request, reply) => {
  try {
    const { title, description, score, category, user_id } = request.body;
    
    if (!title || !score || !category || !user_id) {
      reply.status(400).send({ error: "Missing required fields" });
      return;
    }
    
    if (typeof score !== 'number' || score < 0 || score > 10) {
      reply.status(400).send({ error: "Score must be a number between 0 and 10" });
      return;
    }
    
    const [newRisk] = await db.insert(risks).values({
      title,
      description,
      score,
      category,
      user_id
    }).returning();
    
    return newRisk;
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.put("/risks/:id", async (request, reply) => {
  try {
    const { id } = request.params;
    const { title, description, score, category } = request.body;
    
    if (!title || !score || !category) {
      reply.status(400).send({ error: "Missing required fields" });
      return;
    }
    
    if (typeof score !== 'number' || score < 0 || score > 10) {
      reply.status(400).send({ error: "Score must be a number between 0 and 10" });
      return;
    }
    
    const [updatedRisk] = await db
      .update(risks)
      .set({ title, description, score, category })
      .where(eq(risks.id, parseInt(id)))
      .returning();
      
    if (!updatedRisk) {
      reply.status(404).send({ error: "Risk not found" });
      return;
    }
    
    return updatedRisk;
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.delete("/risks/:id", async (request, reply) => {
  try {
    const { id } = request.params;
    const riskId = parseInt(id);


    await db.delete(comments).where(eq(comments.risk_id, riskId));
    

    await db.delete(risk_assignments).where(eq(risk_assignments.risk_id, riskId));
    

    await db.delete(risks).where(eq(risks.id, riskId));
    
    return { success: true };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});


fastify.get("/risks/:risk_id/comments", async (request, reply) => {
  try {
    const { risk_id } = request.params;
    const commentsWithUsers = await db
      .select({
        id: comments.id,
        risk_id: comments.risk_id,
        user_id: comments.user_id,
        comment: comments.comment,
        created_at: comments.created_at,
        username: users.username
      })
      .from(comments)
      .leftJoin(users, eq(comments.user_id, users.id))
      .where(eq(comments.risk_id, parseInt(risk_id)))
      .orderBy(comments.created_at);
    
    return commentsWithUsers;
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.post("/risks/:risk_id/comments", async (request, reply) => {
  try {
    const { risk_id } = request.params;
    const { user_id, comment } = request.body;
    
    if (!user_id || !comment) {
      reply.status(400).send({ error: "Missing required fields" });
      return;
    }
    
    const [newComment] = await db
      .insert(comments)
      .values({ risk_id: parseInt(risk_id), user_id, comment })
      .returning();
    
    const [commentWithUser] = await db
      .select({
        id: comments.id,
        risk_id: comments.risk_id,
        user_id: comments.user_id,
        comment: comments.comment,
        created_at: comments.created_at,
        username: users.username
      })
      .from(comments)
      .leftJoin(users, eq(comments.user_id, users.id))
      .where(eq(comments.id, newComment.id));
      
    return commentWithUser;
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.delete("/risks/:risk_id/comments/:comment_id", async (request, reply) => {
  try {
    const { risk_id, comment_id } = request.params;
    
    const commentExists = await db
      .select()
      .from(comments)
      .where(and(
        eq(comments.id, parseInt(comment_id)),
        eq(comments.risk_id, parseInt(risk_id))
      ))
      .limit(1);
      
    if (!commentExists.length) {
      reply.status(404).send({ error: "Comment not found or does not belong to this risk" });
      return;
    }
    
    await db.delete(comments).where(eq(comments.id, parseInt(comment_id)));
    return { success: true };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.get("/risks/:risk_id/assignments", async (request, reply) => {
  try {
    const { risk_id } = request.params;
    const assignments = await db
      .select({
        id: users.id,
        username: users.username
      })
      .from(risk_assignments)
      .leftJoin(users, eq(risk_assignments.user_id, users.id))
      .where(eq(risk_assignments.risk_id, parseInt(risk_id)));
    return assignments;
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.post("/risks/:risk_id/assignments", async (request, reply) => {
  try {
    const { risk_id } = request.params;
    const { user_id } = request.body;

    if (!user_id) {
      reply.status(400).send({ error: "Missing user_id" });
      return;
    }
    
    await db
      .insert(risk_assignments)
      .values({ risk_id: parseInt(risk_id), user_id })
      .onConflictDoNothing();
    return { success: true };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

fastify.delete("/risks/:risk_id/assignments/:user_id", async (request, reply) => {
  try {
    const { risk_id, user_id } = request.params;
    await db
      .delete(risk_assignments)
      .where(
        and(
          eq(risk_assignments.risk_id, parseInt(risk_id)),
          eq(risk_assignments.user_id, parseInt(user_id))
        )
      );
    return { success: true };
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
});

const start = async () => {
  try {
    await testConnection();
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    process.exit(1);
  }
};

start();
