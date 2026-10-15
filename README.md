# The Office DK — Oficina Virtual DataKnow

Oficina virtual en 2D para el onboarding del equipo de DataKnow (DK): misiones guiadas, mini-quiz, simulador de proyectos y conversaciones con compañeros para que cada colaborador conozca su rol y sus responsabilidades.

La documentación completa del juego está en [`2D/README.md`](2D/README.md).

## Puesta en marcha

El proyecto usa *npm workspaces*, así que basta un único `install` en la raíz:

```bash
npm install
```

```bash
npm run dev
```

Abre `http://localhost:3001`. Para compilar la versión de producción en `2D/dist/`:

```bash
npm run build
```

Para publicarlo en Azure, ver [`DESPLIEGUE_AZURE.md`](DESPLIEGUE_AZURE.md).

## Estructura

```
The Office DK CL/
├── 2D/                  El juego (React + Vite + Canvas 2D) — ver 2D/README.md
├── base/                Fuente de datos original (datos.xlsx)
├── _legacy/             Código retirado, no se compila (incluye la antigua versión 3D). Ver su README.
├── DESPLIEGUE_AZURE.md  Cómo publicar el juego en Azure
└── package.json         Workspace + scripts de arranque
```

## Historia

El juego tuvo una versión 3D (three.js) en paralelo. Se retiró para concentrar el desarrollo en la 2D; su código quedó en [`_legacy/3D`](_legacy/3D) por si se quiere consultar.
