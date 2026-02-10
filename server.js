// server.js — Silver Lining Intelligence Core v1.0
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Pinecone } from "@pinecone-database/pinecone";
import pkg from "pg";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// --- Environment Config ---
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX || "concept-memory";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// --- Postgres Setup (NeonDB) ---
const { Pool } = pkg;
const pool = new Pool({ connectionString: DATABASE_URL });

// --- Pinecone Setup ---
const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

// --- OpenAI Setup ---
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// --- Health Check Route ---
app.get("/", (req, res) => {
  res.send("🧠 Silver Lining Intelligence Core is online.");
  });

  // --- Example Query Route ---
  app.post("/query", async (req, res) => {
    try {
        const { message } = req.body;

            // Example LLM response
                const response = await openai.chat.completions.create({
                      model: "gpt-4o-mini",
                            messages: [{ role: "user", content: message }],
                                });

                                    res.json({
                                          success: true,
                                                reply: response.choices[0].message.content,
                                                    });
                                                      } catch (error) {
                                                          console.error("Query error:", error);
                                                              res.status(500).json({ success: false, error: error.message });
                                                                }
                                                                });

                                                                // --- Start Server ---
                                                                app.listen(PORT, () =>
                                                                  console.log(`🚀 Server running on port ${PORT}\n🧠 Core active and listening...`)
                                                                  );