#!/bin/sh
# Download the public-domain sources for the treatise glosses into a NEW directory.
# usage: tools/treatise-glosses/fetch_sources.sh DIR
# The files are data: they are parsed, never executed. See docs/treatise-glosses.md.
set -eu
dir=$1
if [ -e "$dir" ]; then echo "fetch_sources: $dir exists; give a new directory" >&2; exit 1; fi
mkdir -p "$dir"
cd "$dir"
EETS=https://archive.org/download/onastrol00chautreatiserich/onastrol00chautreatiserich
OX6=https://archive.org/download/completeworksofg06chauuoft/completeworksofg06chauuoft
for f in _djvu.txt _page_numbers.json _hocr_pageindex.json.gz _hocr_searchtext.txt.gz; do
  curl -sSfLO "$EETS$f"
  curl -sSfLO "$OX6$f"
done
curl -sSfL -o pg45027.txt https://www.gutenberg.org/cache/epub/45027/pg45027.txt
gunzip -f ./*.gz
ls -l
