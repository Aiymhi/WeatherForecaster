(async function () {
    const chartEl = document.getElementById('aqiChart');
    if (!chartEl) return;

    const polSel = document.getElementById('pol');

    async function loadDataForPollutant(polLabel) {
        const label = (polLabel || '').toLowerCase();
        const key = label.includes('pm2.5') ? 'pm25'
            : label.includes('ozone') ? 'o3'
                : 'no2';
        const path = `artifacts/sample_forecast_${key}.json`;
        try {
            const r = await fetch(path, { cache: 'no-store' });
            if (r.ok) return await r.json();
        } catch (_) { }
        // fallback
        try {
            const r = await fetch('artifacts/sample_forecast.json', { cache: 'no-store' });
            if (r.ok) return await r.json();
        } catch (_) { }
        return [];
    }

    // initial load
    let data = await loadDataForPollutant(polSel ? polSel.value : 'PM2.5');
    const labels = data.map(d => new Date(d.ts).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: '2-digit' }));
    const series = data.map(d => (d.pred_aqi != null ? d.pred_aqi : Math.round(d.pred_pm25 ?? 0)));

    const ctx = chartEl.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: `Forecast (${polSel ? polSel.value : 'PM2.5'})`,
                data: series,
                borderWidth: 2,
                tension: 0.25,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: { y: { suggestedMin: 0, suggestedMax: 200, ticks: { stepSize: 50 } } }
        }
    });

    const countEl = document.getElementById('pointCount');
    if (countEl) countEl.textContent = `${data.length} points`;

    // optional: redraw when pollutant changes
    async function redraw() {
        const d = await loadDataForPollutant(polSel ? polSel.value : 'PM2.5');
        chart.data.labels = d.map(x => new Date(x.ts).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: '2-digit' }));
        chart.data.datasets[0].data = d.map(x => (x.pred_aqi != null ? x.pred_aqi : Math.round(x.pred_pm25 ?? 0)));
        chart.data.datasets[0].label = `Forecast (${polSel ? polSel.value : 'PM2.5'})`;
        chart.update();
        if (countEl) countEl.textContent = `${d.length} points`;
    }
    if (polSel) polSel.addEventListener('change', redraw);
})();




