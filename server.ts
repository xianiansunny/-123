import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize OpenAI client for NUWA
const client = new OpenAI({
  apiKey: process.env.NUWA_API_KEY || process.env.GEMINI_API_KEY || '',
  baseURL: "https://api.nuwaflux.com/v1"
});

// API Routes
app.post("/api/generate", async (req, res) => {
  try {
    const { ascii, style, aspectRatio = "1:1", apiConfig } = req.body;

    if (!ascii) {
      return res.status(400).json({ error: "Missing ASCII art" });
    }

    // Dynamic client configuration based on frontend override or server defaults
    const customApiKey = apiConfig?.apiKey?.trim() || process.env.NUWA_API_KEY || process.env.GEMINI_API_KEY;
    const customBaseUrl = apiConfig?.baseUrl?.trim() || "https://api.nuwaflux.com/v1";
    const customModelId = apiConfig?.modelId?.trim() || "gemini-3.1-flash-image-preview";
    const qualityLabel = req.body.quality === "ultra" ? "EXTREME DETAIL, 8K resolution, masterpiece" : req.body.quality === "hd" ? "high definition, detailed" : "standard quality";

    if (!customApiKey) {
      return res.status(400).json({ error: "API Key is required. Please set it in Settings or Environment." });
    }

    const client = new OpenAI({
      apiKey: customApiKey,
      baseURL: customBaseUrl
    });

    const prompt = `
      Please interpret the following ASCII character art and generate a high-quality, professional artistic image based on its structure and content.
      
      ART CONTENT (ASCII):
      ${ascii}
      
      REQUESTED STYLE:
      ${style || 'Cinematic, digital art, highly detailed'}

      IMAGE SPECIFICATIONS:
      - Ratio: ${aspectRatio}
      - Quality: ${qualityLabel}
      
      INSTRUCTIONS:
      - Recognize the shapes, subjects, and composition clearly defined by the ASCII characters.
      - Translate those shapes into a realistic or expressive visual representation.
      - Apply the specified style consistently.
      - Return the result.
    `;

    // Using chosen modelId
    const response = await client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: customModelId,
    });

    const content = response.choices[0]?.message?.content || "";
    
    // Most image generation models via chat completion return a URL or Markdown image link
    // We try to extract it. If it's a direct base64 or URL, we handle it.
    let imageUrl = null;
    
    // Check for markdown image format: ![alt](url)
    const mdMatch = content.match(/!\[.*?\]\((.*?)\)/);
    if (mdMatch && mdMatch[1]) {
      imageUrl = mdMatch[1];
    } else if (content.startsWith("http") || content.startsWith("data:image")) {
      imageUrl = content.trim();
    } else {
      // Sometimes it's just a raw URL in the text
      const urlMatch = content.match(/https?:\/\/[^\s)]+/);
      if (urlMatch) {
        imageUrl = urlMatch[0];
      }
    }

    if (!imageUrl) {
      // Fallback: search for any base64 looking string if not found
      if (content.length > 1000) {
        imageUrl = content; // Might be raw base64
      } else {
        return res.status(500).json({ error: "No image URL detected in model response.", debug: content });
      }
    }

    res.json({ imageUrl, message: content });
  } catch (error: any) {
    console.error("Error generating image via NUWA:", error);
    res.status(500).json({ error: error.message || "Failed to generate image" });
  }
});

// Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
