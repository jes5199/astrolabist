"""Curation sheet: for each glossed-section form not on the modern skip list, show candidate
entries from the EETS (1872) and Oxford vol. 6 (1894) glossaries.
usage: python3 -I sheet.py CONTENT_DIR eets.json oxf.json > sheet.txt"""
import json, re, sys, collections

cdir, ej, oj = sys.argv[1:4]
SKIP = set("""a an and any as be but by cause causes child day divided every for from god good hand have he him i in is it
king labour large lord man me my now of on or other out same save so some space table tables than that the there this thou three
to two under upon with which ten ring plate plates hole net english latin greek rome instrument figure figures degree centre
bodies possibly purpose suppose taken taking taught perceived translated excused many mortal noble part general only right here
lo hard declare divided thing meekly ii iii iv v c n hand fast another age signe celestial""".split())
forms = collections.Counter()
for f in (["00-prologue.md"] + [f"p1-{i:02d}.md" for i in range(1, 24)] + [f"p2-{i:02d}.md" for i in range(1, 47)]
          + ["p2-41a.md", "p2-41b.md", "p2-42a.md", "p2-42b.md", "p2-43a.md"]):
    body = open(f"{cdir}/{f}").read().split("---", 2)[2]
    for w in re.findall(r"[A-Za-z]+(?:-[A-Za-z]+)*", body):
        forms[w.lower()] += 1
E = json.load(open(ej))
O = json.load(open(oj))
norm = lambda s: s.lower().replace("v", "u").replace("y", "i").replace("j", "i").replace("-", "")


def idx(entries):
    d = collections.defaultdict(list)
    for k, e in enumerate(entries):
        d[norm(e["head"])].append(k)
        for m in re.finditer(r"(?:^|[;.] )([A-Z][a-z\-]+),", e["text"]):
            d[norm(m.group(1))].append(k)
    return d


EI, OI = idx(E), idx(O)
for w in sorted(forms):
    if w in SKIP:
        continue
    n = norm(w)
    print(f"### {w} ({forms[w]})")
    for k in dict.fromkeys(EI.get(n, []))[:3] if False else list(dict.fromkeys(EI.get(n, [])))[:3]:
        print(f"  E[{k}] p{E[k]['page']} L{E[k]['line']}: {E[k]['text'][:230]}")
    for k in list(dict.fromkeys(OI.get(n, [])))[:3]:
        print(f"  O[{k}] L{O[k]['line']}: {O[k]['text'][:230]}")
