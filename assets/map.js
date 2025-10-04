// Simple Leaflet map + AQI grid overlay
(function () {
    const mapEl = document.getElementById('leafletMap');
    if (!mapEl) return;

    // init map (Seattle-ish)
    const map = L.map('leafletMap', { zoomControl: true }).setView([47.6062, -122.3321], 9);

    // basemap (OSM)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18
    }).addTo(map);

    // AQI color scale
    function aqiColor(aqi) {
        if (aqi <= 50) return '#00e400';
        if (aqi <= 100) return '#ffff00';
        if (aqi <= 150) return '#ff7e00';
        if (aqi <= 200) return '#ff0000';
        if (aqi <= 300) return '#8f3f97';
        return '#7e0023';
    }

    let layers = { nowcast: null, forecast24: null, tempo: null, stations: null };

    async function loadGeoJSON(url, fallbackMaker) {
        try {
            const r = await fetch(url, { cache: 'no-store' });
            if (r.ok) return await r.json();
        } catch (_) { }
        return fallbackMaker();
    }

    function gridFallback() {
        // tiny 12x8 pseudo-grid around Seattle with a gentle gradient
        const lat0 = 47.3, lat1 = 47.95, lon0 = -122.6, lon1 = -121.9;
        const rows = 8, cols = 12;
        const features = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const y0 = lat0 + (lat1 - lat0) * (r / rows);
                const y1 = lat0 + (lat1 - lat0) * ((r + 1) / rows);
                const x0 = lon0 + (lon1 - lon0) * (c / cols);
                const x1 = lon0 + (lon1 - lon0) * ((c + 1) / cols);
                const aqi = Math.max(0, Math.min(200, 40 + 0.2 * (r * cols + c) + 12 * Math.sin((r + c) / 3)));
                features.push({
                    type: 'Feature',
                    properties: { aqi, pm25: aqi / 2.0, provenance: 'demo' },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]]
                    }
                });
            }
        }
        return { type: 'FeatureCollection', features };
    }

    function drawLayer(geojson, key) {
        if (layers[key]) { map.removeLayer(layers[key]); layers[key] = null; }
        layers[key] = L.geoJSON(geojson, {
            style: f => ({ color: '#00000000', weight: 0, fillOpacity: 0.55, fillColor: aqiColor(f.properties.aqi ?? 0) }),
            onEachFeature: (f, layer) => {
                const aqi = f.properties.aqi?.toFixed?.(0);
                const pm = f.properties.pm25?.toFixed?.(1);
                layer.bindTooltip(`AQI: ${aqi}<br>PM2.5: ${pm}`, { sticky: true });
            }
        }).addTo(map);
    }

    async function showNowcast() {
        const js = await loadGeoJSON('artifacts/nowcast_grid.geojson', gridFallback);
        drawLayer(js, 'nowcast');
    }

    async function showForecast24() {
        const js = await loadGeoJSON('artifacts/forecast_24h.geojson', gridFallback);
        drawLayer(js, 'forecast24');
    }

    // radio buttons
    document.querySelectorAll('input[name="layer"]').forEach(r => {
        r.addEventListener('change', async (e) => {
            // clear all current layers
            Object.keys(layers).forEach(k => { if (layers[k]) { map.removeLayer(layers[k]); layers[k] = null; } });
            if (e.target.value === 'nowcast') await showNowcast();
            else if (e.target.value === 'forecast24') await showForecast24();
            else if (e.target.value === 'tempo') {
                // placeholder: you can load a TEMPO NO2 overlay here when ready
                await showNowcast();
            } else if (e.target.value === 'stations') {
                await showNowcast();
            }
        });
    });

    // initial draw
    showNowcast();
})();

// --- AQI legend ---
const legend = L.control({ position: 'bottomright' });
legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'aqi-legend');
    div.innerHTML = `
    <div style="font:12px/1.2 system-ui, sans-serif; background: rgba(255,255,255,.9); padding:8px 10px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,.1)">
      <b>AQI</b><br>
      <i style="display:inline-block;width:12px;height:12px;background:#00e400;border-radius:2px;margin-right:6px"></i>0–50<br>
      <i style="display:inline-block;width:12px;height:12px;background:#ffff00;border-radius:2px;margin-right:6px"></i>51–100<br>
      <i style="display:inline-block;width:12px;height:12px;background:#ff7e00;border-radius:2px;margin-right:6px"></i>101–150<br>
      <i style="display:inline-block;width:12px;height:12px;background:#ff0000;border-radius:2px;margin-right:6px"></i>151–200<br>
      <i style="display:inline-block;width:12px;height:12px;background:#8f3f97;border-radius:2px;margin-right:6px"></i>201–300<br>
      <i style="display:inline-block;width:12px;height:12px;background:#7e0023;border-radius:2px;margin-right:6px"></i>301+
    </div>`;
    return div;
};
legend.addTo(map);


const polSel = document.getElementById('pol');
if (polSel) {
    polSel.addEventListener('change', async (e) => {
        const v = e.target.value;
        // clear current grid layers
        Object.keys(layers).forEach(k => { if (layers[k]) { map.removeLayer(layers[k]); layers[k] = null; } });
        if (v.includes('Nitrogen')) {
            // auto-check the TEMPO radio
            document.querySelector('input[name="layer"][value="tempo"]').checked = true;
            await showNowcast(); // placeholder until you wire real TEMPO
        } else {
            document.querySelector('input[name="layer"][value="nowcast"]').checked = true;
            await showNowcast();
        }
    });
}
