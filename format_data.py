import os
import json
import glob

dir = os.path.dirname(os.path.abspath(__file__))
files = glob.glob(dir + "/data/*.json")

for file in files:
    print("file", file)
    with open(file, encoding="utf-8") as f:
        data = json.load(f)
    with open(file, "w", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(data, indent=2, ensure_ascii=False))
