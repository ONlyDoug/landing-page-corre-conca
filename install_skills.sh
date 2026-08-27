#!/bin/bash
set -e
skills=(
  "specsfy-specialist-data-modeling"
  "specsfy-specialist-domain-modeling"
  "specsfy-specialist-software-architecture"
  "specsfy-specialist-reui"
  "specsfy-specialist-shadcn-ui"
  "specsfy-specialist-nextjs"
  "specsfy-specialist-react"
  "specsfy-specialist-react-ui-components"
  "specsfy-specialist-supabase"
  "specsfy-specialist-tailwind-css"
  "specsfy-specialist-typescript"
)
for skill in "${skills[@]}"; do
  echo "Instalando $skill..."
  npx skills add https://github.com/promovaweb/specsfy --skill "$skill" --agent universal --copy -y --full-depth
done
