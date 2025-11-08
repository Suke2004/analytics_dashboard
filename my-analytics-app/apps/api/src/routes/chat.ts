import { Router } from "express";
import { prisma } from "../index.js";

const router = Router();

// POST /chat-with-data - Forward chat query to Vanna AI service
router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Forward to Vanna AI service
    const vannaApiUrl =
      process.env.VANNA_API_BASE_URL || "http://localhost:8000";
    const response = await fetch(`${vannaApiUrl}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Vanna API error: ${response.statusText}`);
    }

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("Error in chat-with-data:", error);
    res.status(500).json({
      error: "Failed to process chat query",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
