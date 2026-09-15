import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy GenAI initialization
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please set your Gemini API key in AI Studio Secrets."
    );
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    models: ["lyria-3-clip-preview", "lyria-3-pro-preview"],
  });
});

// Lyria Music Generation Endpoint
app.post("/api/generate-music", async (req, res) => {
  try {
    const { prompt, model = "lyria-3-clip-preview" } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "A valid prompt string is required." });
    }

    const targetModel =
      model === "lyria-3-pro-preview" ? "lyria-3-pro-preview" : "lyria-3-clip-preview";

    console.log(`[Music Generation] Generating with model ${targetModel}...`);

    const ai = getGenAI();

    // Stream from Lyria model using @google/genai SDK
    const responseStream = await ai.models.generateContentStream({
      model: targetModel,
      contents: prompt,
    });

    let audioBase64 = "";
    let lyrics = "";
    let mimeType = "audio/wav";

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;

      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    if (!audioBase64) {
      return res.status(500).json({
        error: "No audio data was generated. Check API quota, prompt safety, or try again.",
      });
    }

    console.log(`[Music Generation] Successfully generated ${audioBase64.length} base64 chars of audio.`);

    return res.json({
      success: true,
      audioBase64,
      mimeType,
      lyrics,
      model: targetModel,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("[Music Generation] Error generating track:", error);
    const message = error?.message || "Music generation failed.";
    return res.status(500).json({
      error: message,
      details: error?.status || error?.code || "GENAI_ERROR",
    });
  }
});

// Vite middleware & static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
