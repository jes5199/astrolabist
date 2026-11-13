"""Parse the Glossarial Index of Skeat EETS ES16 (1872) from IA djvu.txt into entries.
usage: python3 -I parse_eets.py DJVU_TXT OUT_JSON"""
import json, re, sys
src, out = sys.argv[1], sys.argv[2]
L = open(src, encoding="utf-8").read().split("\n")
start = next(i for i in range(10400, len(L)) if L[i].strip().startswith("GLOSSARIAL"))
end = next(i for i in range(start, len(L)) if L[i].strip().startswith("EARLY  ENGLISH  TEXT  SOCIETY"))
page = 106
entries = []
cur = None
START = re.compile(r'^["\'“]?([A-Z3][A-Za-z\-À-ſ]*(?:[ -][a-z][A-Za-z\-]*)*)[,;.]\s')
for i in range(start + 1, end):
    s = L[i].strip()
    if not s:
        continue
    if s.startswith("GLOSSARIAL"):
        continue
    if re.fullmatch(r"\d{3}", s):
        page = int(s)
        continue
    m = START.match(s)
    if m and len(m.group(1)) > 1:
        cur = {"head": m.group(1), "page": page, "line": i + 1, "text": s}
        entries.append(cur)
    elif cur:
        cur["text"] += " " + s
for e in entries:
    e["text"] = re.sub(r"\s+", " ", e["text"])
    e["text"] = re.sub(r"(\w)- (\w)", r"\1\2", e["text"])
json.dump(entries, open(out, "w"), indent=1, ensure_ascii=False)
print(len(entries), "entries; lines", start + 1, end)
