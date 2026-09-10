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
      dieselVal.textContent = `₹${parseFloat(e.target.value).toFixed(1)} / Liter`;
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
    btn.innerHTML = `<span>⏳ Optimizing Mandi Routes...</span>`;
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
      btn.innerHTML = `<span>⚡ Calculate Net Profit Route</span>`;
      btn.disabled = false;
    }
  }
}

function renderOptimizationResults(data) {
  const rankings = data.rankings;
  if (!rankings || rankings.length === 0) return;

  const optimal = rankings[0];
  const deceptive = rankings.find(r => r.is_deceptive_gross) || (rankings.length > 1 ? rankings[rankings.length - 1] : null);

  // 1. Render Winner Highlight Card
  const winnerCard = document.getElementById('winner-card-container');
  if (winnerCard) {
    winnerCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div class="card-ribbon ribbon-green">
          <span>🏆 MAXIMUM NET IN-POCKET PROFIT</span>
        </div>
        <span class="co2-eco-badge" title="Carbon emissions saved compared to distant deceptive route">
          🌱 ${optimal.carbon_saved_kg} kg CO₂e Saved (Green Route)
        </span>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h3 style="font-size: 20px; font-weight: 700; color: #fff;">${optimal.mandi_name}</h3>
          <p style="font-size: 13px; color: var(--text-muted);">${optimal.district}, ${optimal.state} • ${optimal.distance_km} km away (~${optimal.est_transit_hours} hrs)</p>
        </div>
        <span style="font-size: 11px; background: rgba(16,185,129,0.2); color: #34d399; padding: 3px 8px; border-radius: 4px; font-weight: 600;">
          APMC Cess: ${optimal.cess_pct}%
        </span>
      </div>

      <div style="margin: 18px 0; padding: 14px; background: rgba(0,0,0,0.25); border-radius: var(--radius-md); border-left: 3px solid #10b981;">
        <div style="font-size: 11.5px; color: var(--text-muted); text-transform: uppercase;">True In-Pocket Realization</div>
        <div class="profit-num-large green">₹${optimal.net_profit.toLocaleString()}</div>
        <div style="font-size: 13px; color: #34d399; font-weight: 600;">
          Net Rate: ₹${optimal.net_rate_per_qtl.toLocaleString()} / Quintal
          <span style="color: var(--text-muted); font-weight: 400; font-size: 11.5px;"> (Listed Gross: ₹${optimal.modal_price.toLocaleString()})</span>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 12px; flex-wrap: wrap; gap: 8px;">
        <div>
          <span>Total Deductions: </span>
          <strong style="color: #f87171;">-₹${optimal.deductions.total.toLocaleString()}</strong>
          <span> (₹${optimal.deduction_per_qtl}/qtl)</span>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 11px;" onclick="simulateSmsDispatch('${optimal.crop_name || 'Onion'}', ${optimal.quantity_qtl}, ${optimal.net_profit}, '${optimal.mandi_name}')">
            📲 SMS Alert
          </button>
          <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 11px;" onclick="openTraceabilityModal('${optimal.crop_name || 'Onion'}')">
            📜 QR Trace
          </button>
          <button class="btn btn-primary" style="padding: 5px 12px; font-size: 11.5px;" onclick="bookGatePass('${optimal.mandi_id}', '${optimal.mandi_name}', ${optimal.net_profit}, ${optimal.quantity_qtl})">
            <span>🎫 Book Token</span>
          </button>
        </div>
      </div>
    `;
  }

  // 2. Render Deceptive Gross Price Warning Card
  const deceptiveCard = document.getElementById('deceptive-card-container');
  if (deceptiveCard && deceptive) {
    const grossLoss = deceptive.gross_trap_loss || (optimal.net_profit - deceptive.net_profit);
    const grossLossPerQtl = (grossLoss / optimal.quantity_qtl).toFixed(1);

    deceptiveCard.innerHTML = `
      <div class="card-ribbon ribbon-red">
        <span>⚠ DECEPTIVE HIGH GROSS PRICE TRAP</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h3 style="font-size: 20px; font-weight: 700; color: #fff;">${deceptive.mandi_name}</h3>
          <p style="font-size: 13px; color: var(--text-muted);">${deceptive.district}, ${deceptive.state} • ${deceptive.distance_km} km away (~${deceptive.est_transit_hours} hrs)</p>
        </div>
        <span style="font-size: 11px; background: rgba(239,68,68,0.2); color: #f87171; padding: 3px 8px; border-radius: 4px; font-weight: 600;">
          High Freight & Tolls
        </span>
      </div>

      <div style="margin: 18px 0; padding: 14px; background: rgba(0,0,0,0.25); border-radius: var(--radius-md); border-left: 3px solid #ef4444;">
        <div style="font-size: 11.5px; color: var(--text-muted); text-transform: uppercase;">
          Listed Gross: <strong style="color: #38bdf8;">₹${deceptive.modal_price.toLocaleString()}/qtl</strong> (Looks Attractive!)
        </div>
        <div class="profit-num-large red">₹${deceptive.net_profit.toLocaleString()}</div>
        <div style="font-size: 13px; color: #f87171; font-weight: 600;">
          Net Rate: ₹${deceptive.net_rate_per_qtl.toLocaleString()} / Qtl 
          <span style="color: #fca5a5; font-size: 12px;">(Loss: -₹${grossLoss.toLocaleString()} vs Optimal!)</span>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 12px;">
        <div>
          <span>Deductions Eaten by Distance: </span>
          <strong style="color: #f87171;">-₹${deceptive.deductions.total.toLocaleString()}</strong>
        </div>
        <span style="font-size: 11.5px; color: #fbbf24; font-weight: 600;">
          CO₂: +${deceptive.carbon_emissions_kg} kg vs +${optimal.carbon_emissions_kg} kg
        </span>
      </div>
    `;
  }

  // 3. Render Waterfall Cost Breakdown for Winner
  const waterfallBox = document.getElementById('waterfall-content');
  if (waterfallBox) {
    const gross = optimal.gross_revenue;
    const freightPct = ((optimal.deductions.freight / gross) * 100).toFixed(1);
    const tollsPct = ((optimal.deductions.tolls / gross) * 100).toFixed(1);
    const cessPct = ((optimal.deductions.mandi_cess / gross) * 100).toFixed(1);
    const handlingPct = ((optimal.deductions.handling / gross) * 100).toFixed(1);
    const spoilagePct = ((optimal.deductions.transit_spoilage / gross) * 100).toFixed(1);
    const netPct = ((optimal.net_profit / gross) * 100).toFixed(1);

    waterfallBox.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div style="font-size: 13px; color: var(--text-muted);">
          Cost Deductions for <strong>${optimal.mandi_name}</strong> (Gross Revenue: <strong>₹${gross.toLocaleString()}</strong>)
        </div>
        <button class="btn btn-secondary" style="font-size: 11px; padding: 3px 8px;" onclick="toggleExplainabilityFormula()">
          📐 Formula Explainability
        </button>
      </div>

      <!-- Collapsible Explainability Formula Card -->
      <div id="explainability-formula-card" class="explain-card" style="display: none; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <strong style="font-size: 13px; color: #38bdf8;">SIH 2026 PS-132 Algorithmic Proof:</strong>
          <span class="brand-badge" style="background: rgba(56,189,248,0.15); color: #38bdf8;">Exact Mathematical Derivation</span>
        </div>
        <div class="math-formula-box">
          Net Profit = (Mandi Price × Quantity) - [Freight + Tolls + Mandi Cess + Handling + Spoilage]
          <br>
          = (₹${optimal.modal_price} × ${optimal.quantity_qtl}) - [₹${optimal.deductions.freight} + ₹${optimal.deductions.tolls} + ₹${optimal.deductions.mandi_cess} + ₹${optimal.deductions.handling} + ₹${optimal.deductions.transit_spoilage}]
          <br>
          = ₹${gross.toLocaleString()} - ₹${optimal.deductions.total.toLocaleString()}
          <br>
          = ₹${optimal.net_profit.toLocaleString()} (Net Rate: ₹${optimal.net_rate_per_qtl}/Qtl)
        </div>
        <div style="font-size: 11.5px; color: var(--text-muted);">
          * Freight dynamically indexed to Diesel (₹${data.diesel_price}/L) and haulage vehicle type (${data.vehicle_info.name}).
        </div>
      </div>

      <div class="waterfall-bars">
        <div class="waterfall-item">
          <div class="waterfall-label">1. Diesel Freight</div>
          <div class="waterfall-bar-track">
            <div class="waterfall-bar-fill" style="width: ${Math.max(4, freightPct)}%; background: #f97316;"></div>
          </div>
          <div class="waterfall-val" style="color: #f97316;">-₹${optimal.deductions.freight.toLocaleString()}</div>
        </div>
        <div class="waterfall-item">
          <div class="waterfall-label">2. Highway Tolls (${optimal.toll_plazas_est} Plazas)</div>
          <div class="waterfall-bar-track">
            <div class="waterfall-bar-fill" style="width: ${Math.max(4, tollsPct)}%; background: #fbbf24;"></div>
          </div>
          <div class="waterfall-val" style="color: #fbbf24;">-₹${optimal.deductions.tolls.toLocaleString()}</div>
        </div>
        <div class="waterfall-item">
          <div class="waterfall-label">3. Mandi Cess (${optimal.cess_pct}%)</div>
          <div class="waterfall-bar-track">
            <div class="waterfall-bar-fill" style="width: ${Math.max(4, cessPct)}%; background: #38bdf8;"></div>
          </div>
          <div class="waterfall-val" style="color: #38bdf8;">-₹${optimal.deductions.mandi_cess.toLocaleString()}</div>
        </div>
        <div class="waterfall-item">
          <div class="waterfall-label">4. Handling & Weighing</div>
          <div class="waterfall-bar-track">
            <div class="waterfall-bar-fill" style="width: ${Math.max(4, handlingPct)}%; background: #c084fc;"></div>
          </div>
          <div class="waterfall-val" style="color: #c084fc;">-₹${optimal.deductions.handling.toLocaleString()}</div>
        </div>
        <div class="waterfall-item">
          <div class="waterfall-label">5. Transit Spoilage / Shrinkage</div>
          <div class="waterfall-bar-track">
            <div class="waterfall-bar-fill" style="width: ${Math.max(4, spoilagePct)}%; background: #f43f5e;"></div>
          </div>
          <div class="waterfall-val" style="color: #f43f5e;">-₹${optimal.deductions.transit_spoilage.toLocaleString()}</div>
        </div>
        <div class="waterfall-item" style="border-top: 1px solid var(--border-subtle); padding-top: 10px; margin-top: 6px;">
          <div class="waterfall-label"><strong style="color: #fff;">Net In-Pocket Profit</strong></div>
          <div class="waterfall-bar-track">
            <div class="waterfall-bar-fill" style="width: ${netPct}%; background: #10b981;"></div>
          </div>
          <div class="waterfall-val" style="color: #34d399; font-size: 14px;">₹${optimal.net_profit.toLocaleString()} (${netPct}%)</div>
        </div>
      </div>
    `;
  }

  // 4. Render Price Forecast Widget
  renderPriceForecast(data.crop_name);

  // 4. Render Mandi Comparison Matrix Table
  const tableBody = document.getElementById('mandi-comparison-tbody');
  if (tableBody) {
    tableBody.innerHTML = rankings.map((r, idx) => {
      const isOptimal = r.is_optimal_net;
      const isTrap = r.is_deceptive_gross;
      return `
        <tr class="${isOptimal ? 'optimal-row' : ''}">
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 700; color: ${isOptimal ? '#34d399' : 'var(--text-muted)'};">#${idx + 1}</span>
              <div>
                <strong>${r.mandi_name}</strong>
                <div style="font-size: 11px; color: var(--text-dim);">${r.district}, ${r.state}</div>
              </div>
              ${isOptimal ? '<span class="brand-badge" style="background: rgba(16,185,129,0.2);">OPTIMAL</span>' : ''}
              ${isTrap ? '<span class="brand-badge" style="background: rgba(239,68,68,0.2); color: #f87171; border-color: rgba(239,68,68,0.4);">GROSS TRAP</span>' : ''}
            </div>
          </td>
          <td>${r.distance_km} km <div style="font-size: 11px; color: var(--text-dim);">${r.est_transit_hours} hrs</div></td>
          <td><strong>₹${r.modal_price.toLocaleString()}</strong></td>
          <td style="color: #f87171;">-₹${r.deductions.total.toLocaleString()} <div style="font-size: 11px; color: var(--text-dim);">(₹${r.deduction_per_qtl}/q)</div></td>
          <td style="font-weight: 700; font-size: 14px; color: ${isOptimal ? '#34d399' : 'var(--text-main)'};">
            ₹${r.net_profit.toLocaleString()}
          </td>
          <td>
            <strong style="color: ${isOptimal ? '#34d399' : 'var(--text-main)'};">₹${r.net_rate_per_qtl.toLocaleString()}</strong> / qtl
          </td>
          <td>
            <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 11.5px;" onclick="bookGatePass('${r.mandi_id}', '${r.mandi_name}', ${r.net_profit}, ${r.quantity_qtl})">
              Book Pass
            </button>
          </td>
        </tr>
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
          ✓
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
          <strong style="color: #34d399;">₹${netProfit.toLocaleString()}</strong>
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
          <span style="font-size: 16px;">${isHold ? '📈' : '⚡'}</span>
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
            <strong style="color: var(--text-muted);">₹${h.price}</strong>
          </div>
        `).join('')}

        <div style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; padding: 6px 4px; border-radius: var(--radius-sm);">
          <div style="color: #34d399; font-size: 10px; font-weight: 700;">TODAY</div>
          <strong style="color: #34d399;">₹${data.current_price}</strong>
        </div>

        ${data.forecast.slice(0, 2).map(f => `
          <div style="background: rgba(56,189,248,0.1); border: 1px dashed #38bdf8; padding: 6px 4px; border-radius: var(--radius-sm);">
            <div style="color: #38bdf8; font-size: 10px; font-weight: 600;">${f.day} (AI)</div>
            <strong style="color: #38bdf8;">₹${f.price}</strong>
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
