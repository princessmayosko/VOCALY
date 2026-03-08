import json
import re

VOWELS = "aeıioöuüAEIİOÖUÜ"

def clean_word(word):
    return re.sub(r"[^\wçğıöşüÇĞİÖŞÜ’']", "", word)

def split_turkish_syllables(word):

    word = clean_word(word)

    if not word:
        return []

    chars = list(word)
    vowel_positions = [i for i, ch in enumerate(chars) if ch in VOWELS]

    if len(vowel_positions) <= 1:
        return [word]

    syllables = []
    start = 0

    i = 0
    while i < len(vowel_positions):

        vpos = vowel_positions[i]

        if i == len(vowel_positions) - 1:
            syllables.append(word[start:])
            break

        next_vpos = vowel_positions[i + 1]
        consonant_count = next_vpos - vpos - 1

        if consonant_count == 0:
            cut = next_vpos
        elif consonant_count == 1:
            cut = vpos + 1
        else:
            cut = vpos + 2

        syllables.append(word[start:cut])
        start = cut
        i += 1

    return syllables


with open("words.json", "r", encoding="utf-8") as f:
    words = json.load(f)

result = []

for item in words:

    word = item["word"]
    start = item["start"]
    end = item["end"]

    duration = end - start

    syllables = split_turkish_syllables(word)

    if len(syllables) == 0:
        continue

    syl_duration = duration / len(syllables)

    t = start

    for syl in syllables:

        result.append({
            "syllable": syl,
            "start": round(t,2),
            "end": round(t + syl_duration,2)
        })

        t += syl_duration


with open("syllables.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("Tamamlandı → syllables.json üretildi")