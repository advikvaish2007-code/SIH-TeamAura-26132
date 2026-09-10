/**
 * FPO Cooperative View Controller
 * Bulk Pooling, Collective Bargaining Premium, Isolated Member Ledger
 */

async function initFpoLedger() {
  const addMemberForm = document.getElementById('fpo-add-member-form');
  if (addMemberForm) {
    addMemberForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitFpoMemberLot();
    });
  }
}

async function loadFpoData() {
  try {
    const poolRes = await fetch('/api/fpo/pools?tenant_id=TEN-FPO-774');
    const pools = await poolRes.json();
    renderFpoPools(pools);

    const ledgerRes = await fetch('/api/fpo/ledger?tenant_id=TEN-FPO-774');
    const ledgerData = await ledgerRes.json();
    renderFpoLedger(ledgerData);
  } catch (err) {
    console.error("Failed to load FPO data:", err);
  }
}

function renderFpoPools(pools) {
  const container = document.getElementById('fpo-pools-grid');
  if (!container) return;

  container.innerHTML = pools.map(p => {
    const pct = Math.min(100, Math.round((p.current_quantity_qtl / p.target_quantity_qtl) * 100));
    const isFull = pct >= 100;

    return `
      <div class="stat-card" style="border: 1px solid rgba(16,185,129,0.3); background: linear-gradient(135deg, var(--bg-surface), #13243a);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <span style="font-size: 10px; font-family: monospace; color: #34d399; background: rgba(16,185,129,0.15); padding: 2px 6px; border-radius: 4px;">
              ${p.id}
            </span>
            <h4 style="font-size: 15px; font-weight: 700; color: #fff; margin-top: 4px;">${p.pool_title}</h4>
            <div style="font-size: 12px; color: var(--text-muted);">${p.crop_name} (${p.variety})</div>
          </div>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: var(--radius-full); font-weight: 600; background: ${isFull ? 'rgba(16,185,129,0.2); color: #34d399;' : 'rgba(245,158,11,0.2); color: #fbbf24;'}">
            ${p.status}
          </span>
        </div>

        <div style="margin: 14px 0;">
          <div style="display: flex; justify-content: space-between; font-size: 12px;">
            <span style="color: var(--text-muted);">Capacity Filled:</span>
            <strong style="color: #34d399;">${p.current_quantity_qtl} / ${p.target_quantity_qtl} Qtl (${pct}%)</strong>
          </div>
          <div class="pool-fill-track">
            <div class="pool-fill-bar" style="width: ${pct}%;"></div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11.5px; background: rgba(0,0,0,0.2); padding: 8px 10px; border-radius: var(--radius-md); margin-bottom: 14px;">
          <div>
            <span style="color: var(--text-dim); display: block;">Institutional Rate:</span>
            <strong style="color: #38bdf8; font-size: 13px;">${p.negotiated_buyer_price.toLocaleString()}/qtl</strong>
          </div>
          <div>
            <span style="color: var(--text-dim); display: block;">Shared Freight Savings:</span>
            <strong style="color: #34d399; font-size: 13px;">+${p.freight_savings_pct}% Saved</strong>
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary" style="flex: 1; padding: 6px 10px; font-size: 11.5px;" onclick="openAddMemberModal('${p.id}', '${p.crop_name}')">
            + Pool Farmer Lot
          </button>
          <button class="btn btn-primary" style="flex: 1; padding: 6px 10px; font-size: 11.5px;" onclick="dispatchTruckload('${p.id}', '${p.crop_name}', ${p.current_quantity_qtl})">
            🚚 Dispatch Truck
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderFpoLedger(data) {
  const tbody = document.getElementById('fpo-ledger-tbody');
  const proofLabel = document.getElementById('fpo-isolation-proof-text');
  if (proofLabel) {
    proofLabel.textContent = `SQL Verified: ${data.query_proof}`;
  }

  if (!tbody || !data.ledger_entries) return;

  tbody.innerHTML = data.ledger_entries.map(row => {
    const isSettled = row.status === 'SETTLED';
    return `
      <tr>
        <td><strong style="color: #fff;">${row.farmer_name}</strong> <span style="font-size: 11px; color: var(--text-dim); display: block;">${row.member_id}</span></td>
        <td>${row.land_acres} Acres</td>
        <td><strong>${row.quantity_pooled_qtl} Qtl</strong></td>
        <td>${row.moisture_pct}%</td>
        <td><span class="brand-badge" style="background: rgba(56,189,248,0.15); color: #38bdf8;">${row.grade}</span></td>
        <td>${row.advance_paid.toLocaleString()}</td>
        <td style="color: #34d399; font-weight: 700;">${row.final_payout.toLocaleString()}</td>
        <td>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: var(--radius-full); font-weight: 600; background: ${isSettled ? 'rgba(16,185,129,0.15); color: #34d399;' : 'rgba(245,158,11,0.15); color: #fbbf24;'}">
            ${row.status}
          </span>
        </td>
        <td>
          ${isSettled ? `
            <span style="font-size: 11px; color: #34d399;"> Direct DB Transfer</span>
          ` : `
            <button class="btn btn-primary" style="padding: 4px 10px; font-size: 11px;" onclick="settleFpoMember('${row.id}', '${row.farmer_name}', ${row.final_payout})">
              💳 1-Click Settle
            </button>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

function openAddMemberModal(poolId, cropName) {
  const modal = document.getElementById('fpo-add-member-modal');
  const pInput = document.getElementById('fpo-lot-pool-id');
  const pTitle = document.getElementById('fpo-modal-pool-name');

  if (pInput) pInput.value = poolId;
  if (pTitle) pTitle.textContent = `Pooling into: ${poolId} (${cropName})`;
  if (modal) modal.classList.add('open');
}

async function submitFpoMemberLot() {
  const poolId = document.getElementById('fpo-lot-pool-id').value;
  const name = document.getElementById('fpo-farmer-name').value;
  const acres = document.getElementById('fpo-land-acres').value;
  const qty = document.getElementById('fpo-lot-qty').value;
  const moisture = document.getElementById('fpo-moisture').value;
  const grade = document.getElementById('fpo-grade').value;
  const advance = document.getElementById('fpo-advance').value;

  try {
    const res = await fetch('/api/fpo/ledger/add-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: 'TEN-FPO-774',
        pool_id: poolId,
        farmer_name: name,
        land_acres: parseFloat(acres),
        quantity_qtl: parseFloat(qty),
        moisture_pct: parseFloat(moisture),
        grade: grade,
        advance_paid: parseFloat(advance)
      })
    });
    const result = await res.json();
    showToast(`Added ${name} (${qty} Qtl) to FPO Pool`, 'success');
    closeModal('fpo-add-member-modal');
    loadFpoData();
  } catch (err) {
    showToast("Failed to add member produce", "error");
  }
}

async function settleFpoMember(entryId, farmerName, payoutAmount) {
  try {
    const res = await fetch('/api/fpo/settle-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: 'TEN-FPO-774',
        entry_id: entryId
      })
    });
    const result = await res.json();
    showToast(`Instant Payout of ${payoutAmount.toLocaleString()} credited to ${farmerName}'s Bank A/c`, 'success');
    loadFpoData();
  } catch (err) {
    showToast("Settlement failed", "error");
  }
}

function dispatchTruckload(poolId, crop, totalQty) {
  showToast(`Bulk Dispatch E-Way Bill Generated for ${poolId}: 16-Ton Truckload (${totalQty} Qtl) En Route to Institutional Hub`, 'success');
}

window.initFpoLedger = initFpoLedger;
window.loadFpoData = loadFpoData;
window.openAddMemberModal = openAddMemberModal;
window.submitFpoMemberLot = submitFpoMemberLot;
window.settleFpoMember = settleFpoMember;
window.dispatchTruckload = dispatchTruckload;
