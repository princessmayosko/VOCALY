import json

with open("syllables.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print("const heceTimings = {")

for i, item in enumerate(data):
    start = round(float(item["start"]), 2)
    end = round(float(item["end"]), 2)
    print(f'  {i}:[{start},{end}], // {item["syllable"]}')

print("};")