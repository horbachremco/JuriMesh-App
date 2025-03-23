const Fastify = require("fastify");
const fastify = Fastify();
const cors = require("@fastify/cors");
const db = require("./database");

fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
});

async function initializeTables() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS risk_assignments (
        risk_id INTEGER REFERENCES risks(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (risk_id, user_id)
      );
    `);
  } catch (error) {
    throw new Error("Failed to initialize tables: " + error.message);
  }
}

db.query("SELECT NOW()")
  .then(() => initializeTables())
  .catch((err) => {
    console.error("Database initialization error:", err);
    process.exit(1);
  });

fastify.get("/", async (req, reply) => {
  reply.send({ message: "Server is running" });
});

fastify.get("/users", async (req, reply) => {
  try {
    const result = await db.query("SELECT * FROM users ORDER BY id");
    reply.send(result.rows);
  } catch (error) {
    reply.status(500).send({ error: "Failed to fetch users" });
  }
});

fastify.get("/risks", async (req, reply) => {
  try {
    const result = await db.query(`
      WITH risk_users AS (
        SELECT risk_id, array_agg(user_id) as assigned_user_ids
        FROM risk_assignments
        GROUP BY risk_id
      )
      SELECT 
        risks.*, 
        users.username,
        risk_users.assigned_user_ids
      FROM risks
      LEFT JOIN users ON risks.user_id = users.id
      LEFT JOIN risk_users ON risks.id = risk_users.risk_id
      ORDER BY risks.id DESC
    `);
    reply.send(result.rows);
  } catch (error) {
    reply.status(500).send({ error: "Failed to fetch risks" });
  }
});

fastify.post("/risks", async (req, reply) => {
  const { title, description, score, category, user_id } = req.body;

  if (!title || !score || !category || !user_id) {
    return reply.status(400).send({ error: "All fields are required" });
  }

  try {
    const insertResult = await db.query(`
      INSERT INTO risks (title, description, score, category, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [title, description || "", score, category, user_id]);

    const risk = insertResult.rows[0];
    const userResult = await db.query(
      "SELECT username FROM users WHERE id = $1", 
      [user_id]
    );
    const username = userResult.rows[0]?.username || "Unknown";
    reply.status(201).send({ ...risk, username });
  } catch (error) {
    reply.status(500).send({ error: "Failed to add risk" });
  }
});

fastify.put("/risks/:id", async (req, reply) => {
  const { id } = req.params;
  const { title, description, score, category, user_id } = req.body;

  if (!title || !score || !category || !user_id) {
    return reply.status(400).send({ error: "All fields are required" });
  }

  try {
    const result = await db.query(`
      UPDATE risks
      SET title = $1, description = $2, score = $3, category = $4, user_id = $5
      WHERE id = $6
      RETURNING *
    `, [title, description || "", score, category, user_id, id]);

    if (result.rows.length === 0) {
      return reply.status(404).send({ error: "Risk not found" });
    }

    const risk = result.rows[0];
    const userResult = await db.query(
      "SELECT username FROM users WHERE id = $1",
      [risk.user_id]
    );

    const username = userResult.rows[0]?.username || "Unknown";
    reply.send({ ...risk, username });
  } catch (error) {
    reply.status(500).send({ error: "Failed to update risk" });
  }
});

fastify.delete("/risks/:id", async (req, reply) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM risks WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({ error: "Risk not found" });
    }

    reply.send({ message: "Risk deleted successfully" });
  } catch (error) {
    reply.status(500).send({ error: "Failed to delete risk" });
  }
});

fastify.get("/risks/:id/comments", async (req, reply) => {
  const { id } = req.params;

  try {
    const result = await db.query(`
      SELECT comments.*, users.username
      FROM comments
      LEFT JOIN users ON comments.user_id = users.id
      WHERE comments.risk_id = $1
      ORDER BY comments.created_at ASC
    `, [id]);

    reply.send(result.rows);
  } catch (error) {
    reply.status(500).send({ error: "Failed to fetch comments" });
  }
});

fastify.post("/risks/:id/comments", async (req, reply) => {
  const { id } = req.params;
  const { user_id, comment } = req.body;

  if (!user_id || !comment || !comment.trim()) {
    return reply.status(400).send({ error: "User and comment text are required" });
  }

  try {
    const insertResult = await db.query(`
      INSERT INTO comments (risk_id, user_id, comment)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [id, user_id, comment]);

    const userResult = await db.query(
      "SELECT username FROM users WHERE id = $1",
      [user_id]
    );

    const username = userResult.rows[0]?.username || "Unknown";
    reply.status(201).send({ ...insertResult.rows[0], username });
  } catch (error) {
    reply.status(500).send({ error: "Failed to add comment" });
  }
});

fastify.delete("/comments/:id", async (req, reply) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM comments WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({ error: "Comment not found" });
    }

    reply.send({ message: "Comment deleted" });
  } catch (error) {
    reply.status(500).send({ error: "Failed to delete comment" });
  }
});

fastify.get("/risks/:id/assignments", async (req, reply) => {
  const { id } = req.params;

  try {
    const result = await db.query(`
      SELECT users.id, users.username
      FROM risk_assignments
      JOIN users ON risk_assignments.user_id = users.id
      WHERE risk_assignments.risk_id = $1
      ORDER BY risk_assignments.assigned_at DESC
    `, [id]);
    reply.send(result.rows);
  } catch (error) {
    reply.status(500).send({ error: "Failed to fetch assigned users" });
  }
});

fastify.post("/risks/:id/assignments", async (req, reply) => {
  const { id } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return reply.status(400).send({ error: "User ID is required" });
  }

  try {
    const existingResult = await db.query(
      "SELECT * FROM risk_assignments WHERE risk_id = $1 AND user_id = $2",
      [id, user_id]
    );

    if (existingResult.rows.length > 0) {
      return reply.status(400).send({ error: "User is already assigned to this risk" });
    }

    await db.query(
      "INSERT INTO risk_assignments (risk_id, user_id) VALUES ($1, $2)",
      [id, user_id]
    );

    const userResult = await db.query(
      "SELECT id, username FROM users WHERE id = $1",
      [user_id]
    );

    reply.status(201).send(userResult.rows[0]);
  } catch (error) {
    reply.status(500).send({ error: "Failed to assign user" });
  }
});

fastify.delete("/risks/:id/assignments/:userId", async (req, reply) => {
  const { id, userId } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM risk_assignments WHERE risk_id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({ error: "Assignment not found" });
    }

    reply.send({ message: "User unassigned successfully" });
  } catch (error) {
    reply.status(500).send({ error: "Failed to unassign user" });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log("Server is running on http://localhost:3000");
  } catch (err) {
    console.error("Server startup error:", err);
    process.exit(1);
  }
};

start();
