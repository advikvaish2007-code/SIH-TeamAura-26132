/**
 * State APMC Regulatory Board View Controller
 * White-labeled oversight, cess revenue tracking, price anomalies, dispute resolution
 */

async function initApmcDashboard() {
  const disputeForm = document.getElementById('apmc-dispute-form');
  if (disputeForm) {
    disputeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitApmcDispute();
    });
  }
}

async function loadApmcData() {
  try {
    const res = await fetch('/api/apmc/analytics?tenant_id=TEN-APMC-MH01');
    const data = await res.json();
    renderApmcAnalytics(data);

    const disputeRes = await fetch('/api/apmc/disputes?tenant_id=TEN-APMC-MH01');
    const disputes = await disputeRes.json();
    renderApmcDisputes(disputes);
  } catch (err) {
    console.error("Failed to load APMC analytics:", err);
  }
}

function renderApmcAnalytics(data) {
  // Stat cards
  const mandisCount = document.getElementById('apmc-stat-mandis');
  const cessDaily = document.getElementById('apmc-stat-cess-daily');
  const cessMonth = document.getElementById('apmc-stat-cess-monthly');
  const anomaliesCount = document.getElementById('apmc-stat-anomalies');

  if (mandisCount) mandisCount.textContent = "305 Active";
  if (cessDaily) cessDaily.textContent = `${(data.daily_cess_collection_inr / 100000).toFixed(2)} Lakhs`;
  if (cessMonth) cessMonth.textContent = `${data.monthly_projected_cess_cr.toFixed(2)} Cr`;
  if (anomaliesCount) anomaliesCount.textContent = `${data.anomalies.length} Flagged`;

  // Anomaly & Anti-Hoarding Alerts
  const anomalyContainer = document.getElementById('apmc-anomalies-list');
  if (anomalyContainer) {
    if (data.anomalies.length === 0) {
      anomalyContainer.innerHTML = `<div style="color: var(--text-muted); font-size: 13px;">No abnormal price manipulation or hoarding detected today.</div>`;
    } else {
      anomalyContainer.innerHTML = data.anomalies.map(a => `
        <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-md); padding: 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 11px; background: #ef4444; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: 700;">HOARDING ALERT</span>
              <strong style="color: #fff;">${a.crop_name} (${a.variety}) at ${a.mandi_name}</strong>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
              Abnormal Spread: Modal ${a.modal_price}/qtl vs Min ${a.min_price} (Volatility Index: ${a.volatility_index})
            </div>
          </div>
          <button class="btn btn-outline-danger" style="padding: 4px 10px; font-size: 11.5px;" onclick="dispatchEnforcementSquad('${a.mandi_name}', '${a.crop_name}')">
            🚨 Issue Mandi Audit
          </button>
        </div>
      `).join('');
    }
  }

  // Inter-mandi trade flow summary
  const tradeFlowContainer = document.getElementById('apmc-trade-flow-list');
  if (tradeFlowContainer && data.trade_flow_summary) {
    tradeFlowContainer.innerHTML = data.trade_flow_summary.map(flow => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--bg-surface-elevated); border-radius: var(--radius-md); margin-bottom: 8px; border: 1px solid var(--border-subtle);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 18px;">🚛</span>
          <div>
            <div style="font-weight: 600; color: #fff;">${flow.from}  ${flow.to}</div>
            <div style="font-size: 11.5px; color: var(--text-muted);">${flow.commodity}  Volume: <strong>${flow.volume_tons} MT</strong></div>
          </div>
        </div>
        <span style="font-size: 11px; padding: 3px 8px; border-radius: var(--radius-full); font-weight: 600; ${flow.transit_status === 'NORMAL' ? 'background: rgba(16,185,129,0.15); color: #34d399;' : 'background: rgba(245,158,11,0.15); color: #fbbf24;'}">
          ${flow.transit_status}
        </span>
      </div>
    `).join('');
  }

  // Top Mandi Arrivals & Cess Table
  const arrivalsTbody = document.getElementById('apmc-arrivals-tbody');
  if (arrivalsTbody && data.top_arrivals) {
    arrivalsTbody.innerHTML = data.top_arrivals.map(arr => `
      <tr>
        <td><strong>${arr.name}</strong> <span style="font-size: 11px; color: var(--text-dim); display: block;">${arr.district}</span></td>
        <td>${arr.crop_name}</td>
        <td><strong>${arr.modal_price.toLocaleString()}</strong> / qtl</td>
        <td>${arr.arrivals_tons.toLocaleString()} MT</td>
        <td><span style="color: #38bdf8;">${arr.base_cess_pct}%</span></td>
        <td style="color: #34d399; font-weight: 700;">${parseFloat(arr.est_daily_cess).toLocaleString()}</td>
      </tr>
    `).join('');
  }
}

function renderApmcDisputes(disputes) {
  const container = document.getElementById('apmc-disputes-tbody');
  if (!container) return;

  container.innerHTML = disputes.map(d => {
    let badgeClass = 'rgba(245,158,11,0.15); color: #fbbf24;';
    if (d.status === 'RESOLVED') badgeClass = 'rgba(16,185,129,0.15); color: #34d399;';

    return `
      <tr>
        <td><span style="font-family: monospace; font-weight: 700; color: #38bdf8;">${d.id}</span></td>
        <td>
          <strong>${d.complainant_name}</strong>
          <span style="font-size: 11px; color: var(--text-dim); display: block;">Role: ${d.complainant_role}</span>
        </td>
        <td>${d.respondent_name}</td>
        <td style="max-width: 240px; font-size: 12px;">${d.issue_type}</td>
        <td><strong>${d.claim_amount.toLocaleString()}</strong></td>
        <td>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: var(--radius-full); font-weight: 600; background: ${badgeClass}">
            ${d.status}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

async function submitApmcDispute() {
  const compName = document.getElementById('disp-complainant').value;
  const compRole = document.getElementById('disp-role').value;
  const respName = document.getElementById('disp-respondent').value;
  const mandiId = document.getElementById('disp-mandi').value;
  const issue = document.getElementById('disp-issue').value;
  const amount = document.getElementById('disp-amount').value;

  try {
    const res = await fetch('/api/apmc/disputes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: 'TEN-APMC-MH01',
        mandi_id: mandiId,
        complainant_name: compName,
        complainant_role: compRole,
        respondent_name: respName,
        issue_type: issue,
        claim_amount: parseFloat(amount)
      })
    });
    const result = await res.json();
    showToast(`Grievance ${result.dispute_id} lodged with Mandi Board`, 'success');
    closeModal('apmc-dispute-modal');
    loadApmcData();
  } catch (err) {
    showToast('Failed to lodge dispute', 'error');
  }
}

function dispatchEnforcementSquad(mandi, crop) {
  showToast(`Enforcement Inspection Order Dispatched to ${mandi} for ${crop}`, 'warning');
}

// ==================== GOVT ANALYST HEATMAP (LEAFLET) ====================

let apmcMap = null;

async function initApmcLeafletMap() {
  const mapContainer = document.getElementById('apmc-leaflet-map');
  if (!mapContainer || typeof L === 'undefined') return;

  if (apmcMap) {
    apmcMap.invalidateSize();
    return;
  }

  try {
    // Center of Maharashtra
    apmcMap = L.map('apmc-leaflet-map').setView([19.5, 75.5], 7);

    // Dark-themed tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 18
    }).addTo(apmcMap);

    // Fetch district density data
    const res = await fetch('/api/apmc/map-density');
    const districts = await res.json();

    districts.forEach(d => {
      const radius = Math.max(16000, Math.min(50000, d.arrivals_tons * 35));
      const circle = L.circle([d.lat, d.lng], {
        color: d.color,
        fillColor: d.color,
        fillOpacity: 0.35,
        radius: radius
      }).addTo(apmcMap);

      const isAlert = d.status === 'HOARDING_ALERT';

      circle.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.5;">
          <div style="font-weight: 700; font-size: 14px; color: #fff; margin-bottom: 4px;">
            ${d.name}
          </div>
          <div style="color: #94a3b8; margin-bottom: 6px;">
            Arrivals Today: <strong style="color: #fff;">${d.arrivals_tons} MT</strong>
          </div>
          <div style="color: #94a3b8; margin-bottom: 6px;">
            Daily Cess Accrued: <strong style="color: #34d399;">${d.cess_accrual_lakhs} Lakhs</strong>
          </div>
          <div>
            Status: <span style="padding: 2px 6px; border-radius: 3px; font-weight: 700; font-size: 10px; background: ${isAlert ? 'rgba(239,68,68,0.2); color: #f87171;' : 'rgba(16,185,129,0.2); color: #34d399;'}">${d.status}</span>
          </div>
        </div>
      `);
    });
  } catch (err) {
    console.error("Leaflet map initialization failed:", err);
  }
}

// Extend loadApmcData to trigger map
const prevLoadApmcData = loadApmcData;
loadApmcData = async function() {
  await prevLoadApmcData();
  setTimeout(initApmcLeafletMap, 300);
};

window.initApmcDashboard = initApmcDashboard;
window.loadApmcData = loadApmcData;
window.dispatchEnforcementSquad = dispatchEnforcementSquad;
window.initApmcLeafletMap = initApmcLeafletMap;
