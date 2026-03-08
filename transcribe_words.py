import json
from faster_whisper import WhisperModel

AUDIO_FILE = "temiz_kayit.mp3"
MODEL_SIZE = "medium"   # small / medium / large-v3 deneyebilirsin
LANGUAGE = "tr"

model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")

segments, info = model.transcribe(
    AUDIO_FILE,
    language=LANGUAGE,
    beam_size=5,
    word_timestamps=True,
    vad_filter=True,
)

words_out = []

for segment in segments:
    if segment.words:
        for w in segment.words:
            word = (w.word or "").strip()
            if not word:
                continue
            words_out.append({
                "word": word,
                "start": round(float(w.start), 2),
                "end": round(float(w.end), 2)
            })

with open("words.json", "w", encoding="utf-8") as f:
    json.dump(words_out, f, ensure_ascii=False, indent=2)

print("Tamamlandı: words.json üretildi")