/**
 * Farmer Direct View Controller
 * Crop Listing Wizard, Live Offerings, Vernacular Support
 */

async function initFarmerPortal() {
  const listingForm = document.getElementById('farmer-listing-form');
  if (listingForm) {
    listingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitFarmerCropListing();
    });
  }
}

async function loadFarmerData() {
  try {
    const res = await fetch('/api/crop-listings');
    const listings = await res.json();
    renderFarmerListings(listings);
  } catch (err) {
    console.error("Failed to load crop listings:", err);
  }
}

function renderFarmerListings(listings) {
  const container = document.getElementById('farmer-listings-grid');
  if (!container) return;

  container.innerHTML = listings.map(l => `
    <div class="stat-card" style="border: 1px solid rgba(22,163,74,0.3); background: linear-gradient(135deg, var(--bg-surface), #122119);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span style="font-size: 10px; font-family: monospace; color: #4ade80; background: rgba(22,163,74,0.15); padding: 2px 6px; border-radius: 4px;">
            ${l.id}
          </span>
          <h4 style="font-size: 16px; font-weight: 700; color: #fff; margin-top: 4px;">${l.crop_name} (${l.variety})</h4>
          <div style="font-size: 12px; color: var(--text-muted);">Farmer: <strong>${l.farmer_name}</strong>  ${l.farm_location}</div>
        </div>
        <span class="brand-badge" style="background: rgba(22,163,74,0.2); color: #4ade80;">
          ${l.status}
        </span>
      </div>

      <div style="display: flex; justify-content: space-between; margin: 14px 0; background: rgba(0,0,0,0.25); padding: 10px 12px; border-radius: var(--radius-md); font-size: 12.5px;">
        <div>
          <span style="color: var(--text-dim); font-size: 11px; display: block;">Available Quantity</span>
          <strong style="color: #fff; font-size: 14px;">${l.quantity_qtl} Quintals</strong>
        </div>
        <div>
          <span style="color: var(--text-dim); font-size: 11px; display: block;">Govt MSP Base</span>
          <strong style="color: #38bdf8; font-size: 14px;">${l.base_msp.toLocaleString()}/qtl</strong>
        </div>
      </div>

      <div style="display: flex; gap: 8px;">
        <button class="btn btn-secondary" style="flex: 1; padding: 6px; font-size: 11.5px;" onclick="populateRouterFromListing('${l.crop_name}', ${l.quantity_qtl}, '${l.farm_location}')">
          📍 Find Best Net Mandi
        </button>
        <button class="btn btn-primary" style="flex: 1; padding: 6px; font-size: 11.5px;" onclick="showToast('Produce Lot shared with Sahyadri FPO Pooling Coordinator', 'success')">
          🤝 Send to FPO Pool
        </button>
      </div>
    </div>
  `).join('');
}

async function submitFarmerCropListing() {
  const name = document.getElementById('lst-farmer-name').value;
  const phone = document.getElementById('lst-phone').value;
  const crop = document.getElementById('lst-crop').value;
  const variety = document.getElementById('lst-variety').value;
  const qty = document.getElementById('lst-qty').value;
  const msp = document.getElementById('lst-msp').value;
  const loc = document.getElementById('lst-location').value;
  const pin = document.getElementById('lst-pincode').value;

  try {
    const res = await fetch('/api/crop-listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: 'TEN-FARM-001',
        farmer_name: name,
        phone: phone,
        crop_name: crop,
        variety: variety,
        quantity_qtl: parseFloat(qty),
        base_msp: parseFloat(msp),
        farm_location: loc,
        pincode: pin,
        farm_lat: 20.01,
        farm_lng: 74.05
      })
    });
    const result = await res.json();
    showToast(`Produce listed! Listing ID: ${result.listing_id}`, 'success');
    closeModal('farmer-listing-modal');
    loadFarmerData();
  } catch (err) {
    showToast("Failed to list crop produce", "error");
  }
}

function populateRouterFromListing(crop, qty, location) {
  const cropSelect = document.getElementById('opt-crop');
  const qtySlider = document.getElementById('opt-quantity');
  const qtyVal = document.getElementById('opt-quantity-val');

  if (cropSelect) cropSelect.value = crop;
  if (qtySlider) {
    qtySlider.value = qty;
    if (qtyVal) qtyVal.textContent = `${qty} Quintals (${(qty * 0.1).toFixed(1)} MT)`;
  }

  const routerSection = document.getElementById('net-profit-router-section');
  if (routerSection) {
    routerSection.scrollIntoView({ behavior: 'smooth' });
  }

  runProfitOptimization();
  showToast(`Loaded ${qty} Qtl ${crop} into Net Profit Optimizer`, 'info');
}

window.initFarmerPortal = initFarmerPortal;
window.loadFarmerData = loadFarmerData;
window.submitFarmerCropListing = submitFarmerCropListing;
window.populateRouterFromListing = populateRouterFromListing;
