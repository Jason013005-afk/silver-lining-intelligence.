import express from "express";
import dotenv from "dotenv";
import { Pool } from "pg";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(express.json());

// --- NeonDB Connection ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- Pinecone Setup ---
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = pinecone.Index(process.env.PINECONE_INDEX);

// --- OpenAI Setup ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Test Route ---
app.get("/", (req, res) => {
  res.send("Silver Lining Intelligence Core active.");
});

// --- Sample Embedding Insertion ---
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

// --- Server Start ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
