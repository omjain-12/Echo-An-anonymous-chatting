const express = require("express");
const router = express.Router();
const { synthesizeToBuffer } = require("../services/ttsService");

router.post("/synthesize-speech", async (req, res) => {
  try {
    const { text } = req.body || {};
    const audioBuffer = await synthesizeToBuffer(text);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.length);
    return res.status(200).end(audioBuffer);
  } catch (e) {
    const status = e.status || 500;
    return res.status(status).json({ error: e.message || "TTS error" });
  }
});

module.exports = router;
