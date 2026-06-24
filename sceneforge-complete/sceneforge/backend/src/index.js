import "dotenv/config";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────
app.use(express.json({ limit: "20mb" }));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from any vercel.app subdomain, localhost, and the configured FRONTEND_URL
    const allowed = [
      process.env.FRONTEND_URL,
      /\.vercel\.app$/,
      /^http:\/\/localhost/,
      /^http:\/\/127\.0\.0\.1/,
    ];
    if (!origin) return callback(null, true); // allow non-browser requests
    const ok = allowed.some(p => p instanceof RegExp ? p.test(origin) : p === origin);
    callback(ok ? null : new Error("CORS blocked"), ok);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.options("*", cors()); // handle preflight for all routes

// ── Env vars (set these in Railway dashboard) ─────────────────────
const EVOLINK_KEY    = process.env.EVOLINK_API_KEY    || "";
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY  || "";
const EVOLINK_BASE   = "https://api.evolink.ai";
const ANTHROPIC_BASE = "https://api.anthropic.com";

// ── Health check ──────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    evolink:   !!EVOLINK_KEY,
    anthropic: !!ANTHROPIC_KEY,
    timestamp: new Date().toISOString(),
  });
});

// ════════════════════════════════════════════════════════════════
// IMAGE GENERATION
// POST /api/generate/image
// Body: { prompt, model, size, quality, imageUrls? }
// ════════════════════════════════════════════════════════════════
app.post("/api/generate/image", async (req, res) => {
  if (!EVOLINK_KEY) return res.status(500).json({ error: "EvoLink API key not configured on server" });

  const { prompt, model = "gemini-3.1-flash-image-preview", size = "9:16", quality = "2K", imageUrls = [] } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  const body = { model, prompt, size, quality };
  if (imageUrls.length) body.image_urls = imageUrls;

  try {
    const evolinkRes = await fetch(`${EVOLINK_BASE}/v1/images/generations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${EVOLINK_KEY}` },
      body: JSON.stringify(body),
    });
    const data = await evolinkRes.json();
    if (!evolinkRes.ok) return res.status(evolinkRes.status).json({ error: data.error?.message || "EvoLink error" });
    res.json({ taskId: data.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════════════════════════════
// VIDEO GENERATION
// POST /api/generate/video
// Body: { prompt, imageUrl?, model, quality, aspect, duration, generateAudio }
// ════════════════════════════════════════════════════════════════
app.post("/api/generate/video", async (req, res) => {
  if (!EVOLINK_KEY) return res.status(500).json({ error: "EvoLink API key not configured on server" });

  const {
    prompt, imageUrl = null,
    model = "seedance-2.0-image-to-video",
    quality = "720p", aspect = "9:16",
    duration = 5, generateAudio = true,
  } = req.body;

  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  // I2V model list — these need an image
  const i2vModels = [
    "seedance-2.0-image-to-video", "kling-v3-image-to-video",
    "kling-v3-turbo-image-to-video", "wan2.6-image-to-video",
    "wan2.6-image-to-video-flash", "hailuo-2.3-image-to-video",
    "seedance-2.0-fast-image-to-video",
  ];
  const t2vFallbacks = {
    "seedance-2.0-image-to-video":   "seedance-2.0-text-to-video",
    "kling-v3-image-to-video":       "kling-v3-text-to-video",
    "kling-v3-turbo-image-to-video": "kling-v3-turbo-text-to-video",
    "wan2.6-image-to-video":         "wan2.6-text-to-video",
    "wan2.6-image-to-video-flash":   "wan2.6-text-to-video",
    "hailuo-2.3-image-to-video":     "seedance-2.0-text-to-video",
    "seedance-2.0-fast-image-to-video": "seedance-2.0-fast-text-to-video",
  };

  let usedModel = model;
  const isI2V = i2vModels.includes(model);

  // Auto-fallback: I2V model but no image → switch to T2V
  if (isI2V && !imageUrl) {
    usedModel = t2vFallbacks[model] || "seedance-2.0-text-to-video";
  }

  const body = { model: usedModel, prompt, duration, quality, aspect_ratio: aspect };

  if (isI2V && imageUrl) {
    if (usedModel.startsWith("kling")) {
      body.image_start = imageUrl;
    } else {
      body.image_urls = [imageUrl];
    }
  }

  if (!usedModel.startsWith("kling")) {
    body.generate_audio = generateAudio;
  }

  try {
    const evolinkRes = await fetch(`${EVOLINK_BASE}/v1/videos/generations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${EVOLINK_KEY}` },
      body: JSON.stringify(body),
    });
    const data = await evolinkRes.json();
    if (!evolinkRes.ok) return res.status(evolinkRes.status).json({ error: data.error?.message || "EvoLink error" });
    res.json({ taskId: data.id, usedModel, isI2V: isI2V && !!imageUrl });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════════════════════════════
// TASK STATUS POLLING
// GET /api/task/:taskId
// ════════════════════════════════════════════════════════════════
app.get("/api/task/:taskId", async (req, res) => {
  if (!EVOLINK_KEY) return res.status(500).json({ error: "EvoLink API key not configured on server" });

  try {
    const evolinkRes = await fetch(`${EVOLINK_BASE}/v1/tasks/${req.params.taskId}`, {
      headers: { "Authorization": `Bearer ${EVOLINK_KEY}` },
    });
    const data = await evolinkRes.json();
    if (!evolinkRes.ok) return res.status(evolinkRes.status).json({ error: data.error?.message || "Task error" });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════════════════════════════
// TEXT / SCRIPT GENERATION (Anthropic Claude)
// POST /api/generate/text
// Body: { system, messages?, prompt?, maxTokens? }
// ════════════════════════════════════════════════════════════════
app.post("/api/generate/text", async (req, res) => {
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: "Anthropic API key not configured on server" });

  const { system, messages, prompt, maxTokens = 4000 } = req.body;
  if (!system) return res.status(400).json({ error: "system prompt required" });

  // Accept either messages array or a single prompt string
  const msgs = messages || (prompt ? [{ role: "user", content: prompt }] : []);
  if (!msgs.length) return res.status(400).json({ error: "messages or prompt required" });

  try {
    const anthropicRes = await fetch(`${ANTHROPIC_BASE}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: maxTokens, system, messages: msgs }),
    });
    const data = await anthropicRes.json();
    if (!anthropicRes.ok) return res.status(anthropicRes.status).json({ error: data.error?.message || "Anthropic error" });
    res.json({ text: data.content?.[0]?.text || "" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════════════════════════════
// IMAGE DESCRIPTION (Anthropic vision — for model upload)
// POST /api/generate/describe-image
// Body: { imageBase64 }
// ════════════════════════════════════════════════════════════════
app.post("/api/generate/describe-image", async (req, res) => {
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: "Anthropic API key not configured on server" });

  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: "imageBase64 required" });

  try {
    const anthropicRes = await fetch(`${ANTHROPIC_BASE}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
          { type: "text", text: "Describe this person in detail for AI image generation. Include: gender, approximate age, skin tone, hair color/style, facial features, body type. Be specific and objective. Return only the description, no preamble." }
        ]}],
      }),
    });
    const data = await anthropicRes.json();
    if (!anthropicRes.ok) return res.status(anthropicRes.status).json({ error: data.error?.message || "Anthropic error" });
    res.json({ text: data.content?.[0]?.text || "" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✦ SceneForge API running on port ${PORT}`);
  console.log(`  EvoLink key:    ${EVOLINK_KEY   ? "✓ set" : "✗ missing"}`);
  console.log(`  Anthropic key:  ${ANTHROPIC_KEY ? "✓ set" : "✗ missing"}`);
});
