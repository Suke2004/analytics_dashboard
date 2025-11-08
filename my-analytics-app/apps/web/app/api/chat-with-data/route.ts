import { NextRequest, NextResponse } from "next/server";

// Timeout helper (avoid stuck requests)
const TIMEOUT_MS = 20000;

/**
 * POST /api/chat-with-data
 * Forwards user natural-language query to the Vanna AI FastAPI backend.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body?.prompt || typeof body.prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt must be a non-empty string." },
        { status: 400 }
      );
    }

    const prompt = body.prompt.trim();

    // Determine base URL (local dev or production)
    const vannaApiUrl =
      process.env.VANNA_API_BASE_URL ??
      (process.env.NODE_ENV === "production"
        ? "https://your-vanna-service.onrender.com"
        : "http://localhost:8000");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Forward the prompt to FastAPI backend
    const response = await fetch(`${vannaApiUrl}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Vanna API returned error:", response.status, errorText);
      return NextResponse.json(
        {
          error: "Vanna AI service error",
          status: response.status,
          details: errorText,
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    // You could stream this in the future (for live token responses)
    // return new Response(data, { headers: { "Content-Type": "application/json" } });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ Error in /api/chat-with-data:", error);

    const message =
      error instanceof Error
        ? error.name === "AbortError"
          ? "Vanna AI request timed out"
          : error.message
        : "Unknown server error";

    return NextResponse.json(
      {
        error: "Failed to process chat query",
        message,
      },
      { status: 500 }
    );
  }
}
