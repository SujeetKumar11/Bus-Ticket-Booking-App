#!/bin/bash
cd "$(dirname "$0")"
OUT="../Milestone-pro.zip"
rm -f "$OUT"
zip -r "$OUT" . \
  -x "frontend/node_modules/*" \
  -x "frontend/.angular/*" \
  -x "frontend/dist/*" \
  -x "docs/*" \
  -x "*.pyc" \
  -x "__pycache__/*" \
  -x ".git/*"
echo "Created: $(realpath $OUT) ($(du -h $OUT | cut -f1))"
