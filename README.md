# Comparador de horarios

App para comparar horarios del **TEC, Sede Cartago · II Semestre 2026**. Elige 1, 2, 3 o todas las personas, ve el calendario superpuesto y los huecos en los que **todos los seleccionados** están libres.

Nadie edita el sitio desde el navegador: quien quiera entrar crea su horario, copia el JSON y te lo envía. Tú lo pegas en `data/profiles.json` y lo publicas.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173/mi-horario/` (el `base` de Vite es `/mi-horario/` para GitHub Pages).

Otros comandos:

```bash
npm run lint
npm run validate
npm run build
npm run preview
```

## Agregar a una persona

1. En el sitio, pestaña **Crear horario**.
2. Nombre, color, materias (puedes crear materias nuevas) y bloques de horario.
3. **Copiar JSON** y enviártelo.
4. Abre [`data/profiles.json`](data/profiles.json) y agrega el objeto al arreglo `profiles` (el `id` no debe repetirse).
5. Sube el cambio a `main`. GitHub Actions vuelve a publicar el sitio.

## Publicar en GitHub Pages

1. Crea un repo vacío llamado **`mi-horario`** (si usas otro nombre, cambia `base` en [`vite.config.js`](vite.config.js) a `/nombre-del-repo/`).
2. En esta carpeta:

```bash
git add .
git commit -m "Comparador de horarios para el grupo"
git remote add origin https://github.com/TU-USUARIO/mi-horario.git
git branch -M main
git push -u origin main
```

3. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. URL: `https://TU-USUARIO.github.io/mi-horario/`

El workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) corre `lint`, `validate` y `build` en cada push a `main`.
