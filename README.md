# TEMPO Air-Quality Forecaster — MVP Kit

This kit gives you a **runnable scaffold** to ingest data (stubs), fuse satellite/ground/weather,
train a minimal forecast model, and preview a simple wireframe.

## What’s inside
- `data_schema.yaml` — tidy data model for your warehouse/lakehouse.
- `etl_ml_mvp.ipynb` — end‑to‑end notebook: ingest (stub), clean, fuse, nowcast, forecast, and evaluate.
- `wireframe.html` — clickable, static UI mock with map and chart placeholders.
- `api_specs.openapi.yaml` — REST endpoints for serving tiles, timeseries, and alerts.
- `.env.example` — put your keys and settings here, copy to `.env` locally.
- `provenance_example.json` — how to attach source & timestamp to every pixel/value.
- `LICENSE` — MIT, do as you wish.
- `scripts/` — helper Python scripts used by the notebook.

## Quick start
1. Open **etl_ml_mvp.ipynb** and run all cells — it uses synthetic data so it works offline.
2. Open **wireframe.html** in your browser for a simple UI concept.
3. When ready to go live, replace the stub loaders with real API/NASA data in `scripts/loaders.py`
   and wire in your credentials using `.env`.

## Data sources (wire-in later)
- **TEMPO** (NO₂/HCHO, NRT). Convert netCDF → Parquet/Zarr and tile.
- **OpenAQ/AirNow** for ground PM₂.₅ & O₃.
- **NOAA/NWS/HRRR** for weather, winds, PBL height, alerts.

## Modeling
- **Nowcast**: Kalman-like smoother over latest fused signal.
- **Forecast 6–72h**: fast tree model (sklearn GradientBoostingRegressor) + rolling bias correction.
- **Explanations**: SHAP-ready features; in this MVP we show feature importances as a proxy.

## Serving (after MVP)
- Expose `/timeseries`, `/grid`, `/alerts` per **api_specs.openapi.yaml** via FastAPI/Flask.
- Render map tiles (PMTiles/mbtiles) and hit the timeseries endpoints for charts.

---
**Note**: This project is a scaffold; plug in the real endpoints and products for production use.
