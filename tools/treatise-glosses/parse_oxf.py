"""Parse the Glossarial Index of Skeat's Oxford Chaucer vol. 6 (1894; 1926 photographic
impression) from IA djvu.txt into entries, keeping OCR line numbers and printed page.
usage: python3 -I parse_oxf.py DJVU_TXT OUT_JSON"""
import json, re, sys
src, out = sys.argv[1], sys.argv[2]
START_LINE = int(sys.argv[3]) if len(sys.argv) > 3 else 5160
END_RE = sys.argv[4] if len(sys.argv) > 4 else r"INDEX\s+OF\s+PROPER"
L = open(src, encoding="utf-8").read().split("\n")
start = START_LINE - 1
end = next(i for i in range(start + 1, len(L)) if re.match(END_RE, L[i].strip()))
page = 1
entries = []
cur = None
START = re.compile(r'^["\'“]?([A-Z][A-Za-z\-À-ſ]*(?:[ -][a-z][A-Za-z\-]*)*)(?:\s+[({][^)}]{1,24}[)}])?[,;.]\s')
lastnum = None
for i in range(start, end):
    s = L[i].strip()
    if not s:
        continue
    m = re.match(r"^(\d{1,3})\s+GLOSSARIAL", s)
    if m:
        page = int(m.group(1))
        continue
    if s.startswith("GLOSSARIAL"):
        # odd page: number usually on a nearby line
        for j in range(i + 1, min(i + 4, end)):
            t = L[j].strip()
            if re.fullmatch(r"\d{1,3}", t):
                page = int(t)
                break
        else:
            page += 1
        continue
    if re.fullmatch(r"\d{1,3}", s):
        continue
    m = START.match(s)
    # a line ending mid-phrase ("... ; in") continues on the next line
    cont = cur is not None and re.search(r"\b(?:in|of|to|the|a|and|or)$", cur["text"].strip())
    if m and len(m.group(1)) > 1 and not cont:
        cur = {"head": m.group(1), "page": page, "line": i + 1, "text": s}
        entries.append(cur)
    elif cur:
        cur["text"] += " " + s
for e in entries:
    e["text"] = re.sub(r"\s+", " ", e["text"])
    e["text"] = re.sub(r"(\w)- (\w)", r"\1\2", e["text"])
json.dump(entries, open(out, "w"), indent=0, ensure_ascii=False)
print(len(entries), "entries; lines", start + 1, end)
