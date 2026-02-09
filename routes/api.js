import express from "express";
import { Pool } from "pg";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.Index(process.env.PINECONE_INDEX);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Test query route ---
router.get("/ping", (req, res) => res.json({ status: "ok" }));

// --- Memory recall and reasoning ---
router.post("/query", async (req, res) => {
  const { query } = req.body;
  try {
    const embedding = await openai.embeddings.create({
      model: process.env.EMBEDDING_MODEL,
      input: query,
    });

    const results = await index.query({
      vector: embedding.data[0].embedding,
      topK: 3,
      includeMetadata: true,
    });

    res.json({ matches: results.matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Query failed" });
  }
});

export default router;
