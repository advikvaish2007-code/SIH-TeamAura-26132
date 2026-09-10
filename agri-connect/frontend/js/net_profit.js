/**
 * Net Profit Mandi Routing Optimization Engine
 * The Core SIH 2026 PS-132 Breakthrough
 */

let currentOptimizationResult = null;

function initNetProfitRouter() {
  const form = document.getElementById('profit-optimizer-form');
  const qtySlider = document.getElementById('opt-quantity');
  const qtyVal = document.getElementById('opt-quantity-val');
  const dieselSlider = document.getElementById('opt-diesel');
  const dieselVal = document.getElementById('opt-diesel-val');

  if (qtySlider && qtyVal) {
    qtySlider.addEventListener('input', (e) => {
      qtyVal.textContent = `${e.target.value} Quintals (${(e.target.value * 0.1).toFixed(1)} MT)`;
    });
  }

  if (dieselSlider && dieselVal) {
    dieselSlider.addEventListener('input', (e) => {
      dieselVal.textContent = `${parseFloat(e.target.value).toFixed(1)} / Liter`;
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await runProfitOptimization();
    });
  }

  // Trigger initial calculation with defaults
  runProfitOptimization();
}

async function runProfitOptimization() {
  const cropSelect = document.getElementById('opt-crop');
  const originSelect = document.getElementById('opt-origin');
  const qtySlider = document.getElementById('opt-quantity');
  const vehicleSelect = document.getElementById('opt-vehicle');
  const dieselSlider = document.getElementById('opt-diesel');

  const crop = cropSelect ? cropSelect.value : 'Onion';
  const origin = originSelect ? JSON.parse(originSelect.value) : { name: "Niphad, Nashik, MH", lat: 20.0110, lng: 74.0520 };
  const quantity = qtySlider ? parseFloat(qtySlider.value) : 150.0;
  const vehicle = vehicleSelect ? vehicleSelect.value : 'canter_5t';
  const diesel = dieselSlider ? parseFloat(dieselSlider.value) : 92.5;

  const btn = document.getElementById('opt-submit-btn');
  if (btn) {
    btn.innerHTML = `<span> Optimizing Mandi Routes...</span>`;
    btn.disabled = true;
  }

  try {
    const res = await fetch('/api/optimize-profit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crop_name: crop,
        quantity_qtl: quantity,
        origin_lat: origin.lat,
        origin_lng: origin.lng,
        origin_location: origin.name,
        vehicle_type: vehicle,
        diesel_price: diesel
      })
    });

    const data = await res.json();
    currentOptimizationResult = data;
    renderOptimizationResults(data);
    showToast(`Calculated Net Profit across ${data.rankings.length} Mandis for ${quantity} Qtl ${crop}`, 'success');
  } catch (err) {
    console.error("Optimization failed:", err);
    showToast("Error computing profit routing", "error");
  } finally {
    if (btn) {
      btn.innerHTML = `<span> Calculate Net Profit Route</span>`;
      btn.disabled = false;
    }
  }
}

function renderOptimizationResults(data) {
  const rankings = data.rankings;
  if (!rankings || rankings.length === 0) return;

  const resultsContainer = document.getElementById('mandi-comparison-tbody');
  if (resultsContainer) {
    resultsContainer.innerHTML = rankings.map((r, idx) => {
      const isOptimal = r.is_optimal_net;
      
      return `
        <div class="mandi-card ${isOptimal ? 'optimal' : ''}">
          <div class="mc-rank">${idx + 1}</div>
          <div>
            <div class="mc-name">${r.mandi_name} ${isOptimal ? '<span style="font-size: 0.75rem; background: var(--farmer-forest); color: #fff; padding: 2px 6px; border-radius: 4px; margin-left: 8px; vertical-align: middle;">OPTIMAL</span>' : ''}</div>
            <div class="mc-dist"><i class="ph ph-map-pin"></i> ${r.distance_km} km (${r.est_transit_hours} hrs) | ${r.district}, ${r.state}</div>
          </div>
          <div>
            <div class="mc-metric-label">Gross Listed</div>
            <div style="font-size: 1.1rem; font-weight: 600;">₹${r.modal_price.toLocaleString()}</div>
            <div style="font-size: 0.8rem; color: var(--danger);">-${r.deductions.total.toLocaleString()} freight/cess</div>
          </div>
          <div style="text-align: right;">
            <div class="mc-metric-label">True Net Profit</div>
            <div class="mc-net-profit">₹${r.net_profit.toLocaleString()}</div>
            <button class="farmer-btn" style="padding: 8px 12px; font-size: 0.75rem; margin-top: 8px;" onclick="bookGatePass('${r.mandi_id}', '${r.mandi_name}', ${r.net_profit}, ${r.quantity_qtl})">Book Token</button>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Gate Pass Booking QR Generator Modal
function bookGatePass(mandiId, mandiName, netProfit, qty) {
  const token = `PASS-${mandiId.substring(0, 6)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const modal = document.getElementById('gate-pass-modal');
  const modalContent = document.getElementById('gate-pass-content');

  if (modal && modalContent) {
    modalContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="width: 52px; height: 52px; background: rgba(16,185,129,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 26px; color: #10b981; margin-bottom: 8px;">
          
        </div>
        <h3 style="font-size: 20px; font-weight: 700;">APMC Mandi Priority Gate Token</h3>
        <p style="font-size: 13px; color: var(--text-muted);">Verified Electronic Transit Token under National e-NAM Gateway</p>
      </div>

      <div style="background: var(--bg-surface-elevated); border: 1px dashed var(--primary-500); border-radius: var(--radius-lg); padding: 20px; text-align: center; margin-bottom: 20px;">
        <!-- Simulated QR Code SVG -->
        <div style="width: 140px; height: 140px; margin: 0 auto 12px; background: #fff; padding: 10px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 100 100" width="120" height="120">
            <rect width="100" height="100" fill="#fff"/>
            <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" fill="#000"/>
            <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" fill="#000"/>
            <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" fill="#000"/>
            <rect x="45" y="15" width="8" height="20" fill="#000"/>
            <rect x="45" y="45" width="15" height="15" fill="#000"/>
            <rect x="70" y="55" width="15" height="8" fill="#000"/>
            <rect x="55" y="75" width="25" height="10" fill="#000"/>
          </svg>
        </div>
        <div style="font-family: monospace; font-size: 16px; font-weight: 700; color: #38bdf8; letter-spacing: 1px;">
          ${token}
        </div>
        <div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">Present at APMC Ingate Weighbridge for Zero-Demurrage Priority Entry</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; margin-bottom: 20px;">
        <div style="background: var(--bg-main); padding: 10px 14px; border-radius: var(--radius-md);">
          <span style="color: var(--text-muted); font-size: 11px; display: block;">Destination APMC</span>
          <strong>${mandiName}</strong>
        </div>
        <div style="background: var(--bg-main); padding: 10px 14px; border-radius: var(--radius-md);">
          <span style="color: var(--text-muted); font-size: 11px; display: block;">Reserved Date</span>
          <strong>${dateStr} (Slot: 06:00 - 10:00 AM)</strong>
        </div>
        <div style="background: var(--bg-main); padding: 10px 14px; border-radius: var(--radius-md);">
          <span style="color: var(--text-muted); font-size: 11px; display: block;">Quantity Reserved</span>
          <strong>${qty} Quintals</strong>
        </div>
        <div style="background: var(--bg-main); padding: 10px 14px; border-radius: var(--radius-md);">
          <span style="color: var(--text-muted); font-size: 11px; display: block;">Expected Net Realization</span>
          <strong style="color: #34d399;">${netProfit.toLocaleString()}</strong>
        </div>
      </div>

      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button class="btn btn-secondary" onclick="closeModal('gate-pass-modal')">Close</button>
        <button class="btn btn-primary" onclick="printGatePass('${token}')">🖨️ Download / Print Gate Pass</button>
      </div>
    `;
    modal.classList.add('open');
  }
}

function printGatePass(token) {
  showToast(`Gate Pass ${token} downloaded to device wallet`, 'success');
  closeModal('gate-pass-modal');
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('open');
}

function toggleExplainabilityFormula() {
  const card = document.getElementById('explainability-formula-card');
  if (card) {
    card.style.display = (card.style.display === 'none' || card.style.display === '') ? 'block' : 'none';
  }
}

async function renderPriceForecast(cropName = "Onion") {
  const container = document.getElementById('price-forecast-container');
  if (!container) return;

  try {
    const res = await fetch(`/api/price-forecast?crop=${encodeURIComponent(cropName)}`);
    const data = await res.json();

    const isHold = data.decision_code === 'HOLD';

    container.innerHTML = `
      <div class="decision-advisory-banner ${isHold ? 'decision-hold' : 'decision-sell'}">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">${isHold ? '📈' : ''}</span>
          <span><strong>AI Forecast Advisory (Beta):</strong> ${data.recommendation}</span>
        </div>
        <span class="brand-badge" style="background: rgba(0,0,0,0.25); color: #fff; font-size: 11px;">
          ${data.model} (${data.confidence_index}% Confidence)
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; text-align: center; font-size: 11px; margin-top: 10px;">
        ${data.history.slice(-4).map(h => `
          <div style="background: rgba(255,255,255,0.03); padding: 6px 4px; border-radius: var(--radius-sm);">
            <div style="color: var(--text-dim); font-size: 10px;">${h.date}</div>
            <strong style="color: var(--text-muted);">${h.price}</strong>
          </div>
        `).join('')}

        <div style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; padding: 6px 4px; border-radius: var(--radius-sm);">
          <div style="color: #34d399; font-size: 10px; font-weight: 700;">TODAY</div>
          <strong style="color: #34d399;">${data.current_price}</strong>
        </div>

        ${data.forecast.slice(0, 2).map(f => `
          <div style="background: rgba(56,189,248,0.1); border: 1px dashed #38bdf8; padding: 6px 4px; border-radius: var(--radius-sm);">
            <div style="color: #38bdf8; font-size: 10px; font-weight: 600;">${f.day} (AI)</div>
            <strong style="color: #38bdf8;">${f.price}</strong>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    console.error("Forecast rendering failed:", err);
  }
}

window.initNetProfitRouter = initNetProfitRouter;
window.runProfitOptimization = runProfitOptimization;
window.bookGatePass = bookGatePass;
window.closeModal = closeModal;
window.printGatePass = printGatePass;
window.toggleExplainabilityFormula = toggleExplainabilityFormula;
window.renderPriceForecast = renderPriceForecast;
