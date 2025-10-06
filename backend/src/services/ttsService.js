const sdk = require("microsoft-cognitiveservices-speech-sdk");

function createSynthesizer() {
  const key = process.env.SPEECH_KEY;
  const region = process.env.SPEECH_REGION;
  if (!key || !region) {
    throw new Error("Speech service credentials not configured");
  }
  const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
  speechConfig.speechSynthesisOutputFormat =
    sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;
  return new sdk.SpeechSynthesizer(speechConfig, null);
}

async function synthesizeToBuffer(text) {
  if (!text || typeof text !== "string" || !text.trim()) {
    const err = new Error("Missing or invalid 'text'");
    err.status = 400;
    throw err;
  }
  return new Promise((resolve, reject) => {
    let synthesizer;
    try {
      synthesizer = createSynthesizer();
    } catch (e) {
      e.status = 500;
      return reject(e);
    }
    synthesizer.speakTextAsync(
      text,
      (result) => {
        try {
          synthesizer.close();
          if (!result) return reject(new Error("Empty synthesis result"));
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            const audioData = Buffer.from(result.audioData);
            if (!audioData || audioData.length === 0) {
              return reject(new Error("No audio data returned"));
            }
            return resolve(audioData);
          }
          const details = sdk.CancellationDetails.fromResult(result);
          return reject(
            new Error(details?.errorDetails || "Synthesis canceled")
          );
        } catch (err) {
          return reject(err);
        }
      },
      (error) => {
        try {
          synthesizer.close();
        } catch {}
        return reject(error);
      }
    );
  });
}

module.exports = { synthesizeToBuffer };
