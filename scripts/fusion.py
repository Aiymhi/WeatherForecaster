"""
Minimal fusion + AQI helpers.
"""
import numpy as np
import pandas as pd

def simple_kalman(nowcast_prev_mean, nowcast_prev_var, obs, obs_var=1.0):
    K = nowcast_prev_var / (nowcast_prev_var + obs_var)
    mean = nowcast_prev_mean + K*(obs - nowcast_prev_mean)
    var = (1 - K) * nowcast_prev_var
    return mean, var

def epa_aqi_pm25(ugm3: float) -> int:
    bps = [(0.0,12.0,0,50),(12.1,35.4,51,100),(35.5,55.4,101,150),
           (55.5,150.4,151,200),(150.5,250.4,201,300),(250.5,500.4,301,500)]
    for c_low,c_high, aqi_low, aqi_high in bps:
        if c_low <= ugm3 <= c_high:
            return round((aqi_high-aqi_low)/(c_high-c_low)*(ugm3-c_low)+aqi_low)
    return 500

def feature_engineer(df_merge: pd.DataFrame) -> pd.DataFrame:
    df = df_merge.copy()
    df["ts"] = pd.to_datetime(df["ts"])
    df["hour"] = df["ts"].dt.hour
    df["dow"] = df["ts"].dt.dayofweek
    if "NO2_column" in df.columns:
        df["NO2_column"] = df["NO2_column"].fillna(df["NO2_column"].median())
        std = df["NO2_column"].std(ddof=0) or 1.0
        df["no2_scaled"] = (df["NO2_column"] - df["NO2_column"].mean())/std
    else:
        df["no2_scaled"] = 0.0
    for v in ["U10","V10","PBLH","T2","RH2"]:
        if v in df.columns:
            df[v] = df[v].fillna(df[v].median())
            std = df[v].std(ddof=0) or 1.0
            df[v+"_norm"] = (df[v]-df[v].mean())/std
        else:
            df[v+"_norm"] = 0.0
    return df
