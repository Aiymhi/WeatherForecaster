"""
Stub data loaders. Replace with real API/NASA/NOAA implementations.
"""
from dataclasses import dataclass
from typing import Tuple, Dict, Any, List
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, timezone

@dataclass
class BBox:
    minx: float; miny: float; maxx: float; maxy: float

def load_ground_observations(bbox: BBox, start: datetime, end: datetime, pollutant: str) -> pd.DataFrame:
    rng = pd.date_range(start, end, freq="1H", inclusive="left", tz=timezone.utc)
    stations = [
        {"station_id":"STN001","lat":47.25,"lon":-122.44},
        {"station_id":"STN002","lat":47.62,"lon":-122.33},
        {"station_id":"STN003","lat":47.57,"lon":-122.20},
    ]
    rows = []
    base = 8 if pollutant == "PM25" else 35
    for st in stations:
        signal = base + 4*np.sin(np.linspace(0, 8, len(rng))) + np.random.normal(0, 1.2, len(rng))
        for ts, val in zip(rng, signal):
            rows.append({
                "station_id": st["station_id"],
                "ts": ts,
                "pollutant": pollutant,
                "value": max(0, val),
                "units": "ug/m3" if pollutant=="PM25" else "ppb",
                "qa_flag": None,
                "source": "synthetic",
                "source_url": "about:blank",
                "ingested_at": datetime.now(timezone.utc)
            })
    return pd.DataFrame(rows)

def load_tempo_columns(bbox: BBox, start: datetime, end: datetime, var: str="NO2_column") -> pd.DataFrame:
    rng = pd.date_range(start, end, freq="1H", inclusive="left", tz=timezone.utc)
    tiles = [f"T{i:03d}" for i in range(1, 25)]
    data = []
    for tile in tiles:
        col = 0.25 + 0.1*np.sin(np.linspace(0, 3, len(rng))) + np.random.normal(0, 0.02, len(rng))
        for ts, v in zip(rng, col):
            data.append({
                "tile_id": tile,
                "ts": ts,
                "product": "TEMPO_L2_NO2_NRT_V02",
                "var": var,
                "value": max(0, v),
                "units": "mol/m2",
                "qa_flag": None,
                "geom_wkt": "POLYGON(...)",
                "source_url": "about:blank",
                "ingested_at": datetime.now(timezone.utc)
            })
    return pd.DataFrame(data)

def load_weather(bbox: BBox, start: datetime, end: datetime) -> pd.DataFrame:
    rng = pd.date_range(start, end, freq="1H", inclusive="left", tz=timezone.utc)
    tiles = [f"T{i:03d}" for i in range(1, 25)]
    rows = []
    for tile in tiles:
        for ts in rng:
            rows += [
                {"tile_id": tile, "ts": ts, "var":"U10", "value": 2.0, "units":"m/s", "model":"HRRR", "ingested_at": pd.Timestamp.utcnow()},
                {"tile_id": tile, "ts": ts, "var":"V10", "value": -1.0, "units":"m/s", "model":"HRRR", "ingested_at": pd.Timestamp.utcnow()},
                {"tile_id": tile, "ts": ts, "var":"PBLH","value": 450.0, "units":"m", "model":"HRRR", "ingested_at": pd.Timestamp.utcnow()},
                {"tile_id": tile, "ts": ts, "var":"T2",  "value": 293.0, "units":"K", "model":"HRRR", "ingested_at": pd.Timestamp.utcnow()},
                {"tile_id": tile, "ts": ts, "var":"RH2", "value": 55.0,  "units":"%", "model":"HRRR", "ingested_at": pd.Timestamp.utcnow()},
            ]
    return pd.DataFrame(rows)
