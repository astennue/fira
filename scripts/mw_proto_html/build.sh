#!/usr/bin/env bash
# MatchWise Clickable Prototype — build single self-contained HTML
set -e
cd "$(dirname "$0")"
OUT="/home/z/my-project/download/MatchWise-Clickable-Prototype.html"

{
  cat p01-head.html
  echo '<style>'
  cat p02-css.css
  echo '</style>'
  echo '</head>'
  echo '<body>'
  # shared SVG gradient defs (ring gauge + brand strip reference these)
  cat <<'SVGDEFS'
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="g-royal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1F3FA6"/><stop offset="1" stop-color="#3D6BE0"/></linearGradient>
<linearGradient id="g-brand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1f3fa6"/><stop offset=".55" stop-color="#3d6be0"/><stop offset="1" stop-color="#f6c615"/></linearGradient>
</defs></svg>
SVGDEFS
  echo '<div id="app"></div>'
  echo '<div id="toasts" class="toasts"></div>'
  echo '<div id="modal-root"></div>'
  echo '<script>'
  cat p03-data.js p04-core.js p05-login.js p06-applicant.js p07-employer.js p08-agency.js p09-fira.js p10-tail.js
  echo '</script>'
  echo '</body>'
  echo '</html>'
} > "$OUT"

SIZE=$(du -h "$OUT" | cut -f1)
LINES=$(wc -l < "$OUT")
echo "Built $OUT ($SIZE, $LINES lines)"
