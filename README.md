# All U Moves — Matriz Maestra

App Web Premium para selección y análisis de ejercicios basado en 17 dimensiones técnicas y clínicas.

## Stack
- **Framework**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + Shadcn UI (Tokens: Ink Blue, Sandstone, Taupe)
- **Data**: Local JSON (`src/data/exercises.sample.json`)
- **Logic**: Custom Heuristics for Risk Analysis + Fuse.js for Fuzzy Search
- **Deployment**: GitHub Pages (Auto-build via Actions)

## Instrucciones Local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Correr modo desarrollo:
   ```bash
   npm run dev
   ```
3. Abrir en `http://localhost:5173`

## Instrucciones Publicación

1. Asegúrate de estar en la rama `main`.
2. Push a GitHub.
   ```bash
   git add .
   git commit -m "feat: initial release"
   git push origin main
   ```
3. GitHub Actions detectará el push y construirá la app.
4. En Settings -> Pages del repositorio, verifica que la fuente sea "GitHub Actions".

## Edición de Datos
Para agregar ejercicios, editar `src/data/exercises.sample.json`. El sistema recalculará automáticamente los Flags de Riesgo (HYP_ADV, ONLINE_RISK, PF_RISK) basado en las reglas heurísticas definidas en `src/lib/heuristics.ts`.
