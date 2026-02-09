import express from "express";
import dotenv from "dotenv";
import { Pool } from "pg";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import apiRoutes from "./routes/api.js";

dotenv.config();

const app = express();
app.use(express.json());

// --- NeonDB (Postgres) Connection ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- Pinecone Vector Memory ---
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = pinecone.Index(process.env.PINECONE_INDEX);

// --- OpenAI or Local AI Layer ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Root Test Route ---
app.get("/", (req, res) => {
  res.send("🧠 Silver Lining Intelligence Core active.");
});

// --- API Routes (Query, Memory, etc.) ---
app.use("/api", apiRoutes);

// --- Test Embedding Upload Route ---
app.post("/embed", async (req, res) => {
  const { text, id } = req.body;
  try {
    const embedding = await openai.embeddings.create({
      model: process.env.EMBEDDING_MODEL,
      input: text,
    });

    await index.upsert([
      {
        id: id || `text-${Date.now()}`,
        values: embedding.data[0].embedding,
        metadata: { text },
      },
    ]);

    res.json({ status: "stored", id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Embedding failed" });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
