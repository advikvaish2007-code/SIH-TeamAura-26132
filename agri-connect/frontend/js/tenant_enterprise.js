/**
 * Enterprise Buyer View Controller
 * Procurement Bidding, Escrow Milestone Release, AI Crop Quality Grading
 */

let selectedSampleCrop = 'wheat';

async function initEnterprisePortal() {
  const rfqForm = document.getElementById('enterprise-rfq-form');
  if (rfqForm) {
    rfqForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitBuyerRfq();
    });
  }

  // AI Quality Grader sample chips
  document.querySelectorAll('.ai-sample-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      document.querySelectorAll('.ai-sample-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedSampleCrop = chip.dataset.crop;
      previewSampleCrop(selectedSampleCrop);
    });
  });

  // File upload input
  const fileInput = document.getElementById('ai-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (re) => {
          const img = document.getElementById('ai-preview-img');
          if (img) img.src = re.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }
}

function previewSampleCrop(crop) {
  const img = document.getElementById('ai-preview-img');
  if (img) {
    img.src = `/static/assets/samples/${crop.toLowerCase()}_sample.jpg`;
  }
}

async function loadEnterpriseData() {
  try {
    const res = await fetch('/api/enterprise/rfqs?tenant_id=TEN-ENT-902');
    const rfqs = await res.json();
    renderEnterpriseRfqs(rfqs);
  } catch (err) {
    console.error("Failed to load Enterprise RFQs:", err);
  }
}

function renderEnterpriseRfqs(rfqs) {
  const container = document.getElementById('enterprise-rfqs-container');
  if (!container) return;

  container.innerHTML = rfqs.map(r => `
    <div class="stat-card" style="border: 1px solid rgba(245,158,11,0.3); margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11px; font-family: monospace; color: #fbbf24; background: rgba(245,158,11,0.15); padding: 2px 6px; border-radius: 4px;">
              ${r.id}
            </span>
            <strong style="color: #fff; font-size: 16px;">${r.crop_name} (${r.variety})</strong>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${r.buyer_org}  Delivery: ${r.delivery_location}</div>
        </div>
        <span style="font-size: 11px; padding: 3px 8px; border-radius: var(--radius-full); font-weight: 600; background: rgba(16,185,129,0.15); color: #34d399;">
          🛡️ ${r.escrow_status}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; background: rgba(0,0,0,0.25); padding: 12px; border-radius: var(--radius-md); font-size: 12px;">
        <div>
          <span style="color: var(--text-dim); display: block;">Target Quantity</span>
          <strong style="font-size: 14px; color: #fff;">${r.required_qtl} Qtl</strong>
        </div>
        <div>
          <span style="color: var(--text-dim); display: block;">Target Procurement Price</span>
          <strong style="font-size: 14px; color: #38bdf8;">${r.target_price_qtl}/qtl</strong>
        </div>
        <div>
          <span style="color: var(--text-dim); display: block;">Escrow Locked Amount</span>
          <strong style="font-size: 14px; color: #34d399;">${r.escrow_amount.toLocaleString()}</strong>
        </div>
        <div>
          <span style="color: var(--text-dim); display: block;">Spec Requirement</span>
          <span style="font-size: 11px; color: var(--text-muted);">${r.quality_spec}</span>
        </div>
      </div>

      <!-- Smart Contract Escrow Milestones -->
      <div class="escrow-flow">
        <div class="escrow-line">
          <div class="escrow-line-progress"></div>
        </div>
        <div class="escrow-step completed">
          <div class="escrow-step-circle">1</div>
          <span style="font-size: 11px; color: #34d399; font-weight: 600;">Escrow Funded</span>
        </div>
        <div class="escrow-step completed">
          <div class="escrow-step-circle">2</div>
          <span style="font-size: 11px; color: #34d399; font-weight: 600;">Mandi Weighed</span>
        </div>
        <div class="escrow-step active">
          <div class="escrow-step-circle">3</div>
          <span style="font-size: 11px; color: #fbbf24; font-weight: 600;">AI Quality Cert</span>
        </div>
        <div class="escrow-step">
          <div class="escrow-step-circle">4</div>
          <span style="font-size: 11px; color: var(--text-dim);">Funds Released</span>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
        <button class="btn btn-secondary" style="font-size: 12px;" onclick="scrollToAiGrader('${r.crop_name}')">
          🔍 Inspect Lot via AI Grader
        </button>
        <button class="btn btn-primary" style="font-size: 12px; background: linear-gradient(135deg, #10b981, #059669);" onclick="releaseEscrowFunds('${r.id}', ${r.escrow_amount})">
          🔓 Release Escrow Payment (1-Click)
        </button>
      </div>
    </div>
  `).join('');
}

async function runAiCropScan() {
  const btn = document.getElementById('ai-scan-btn');
  const viewport = document.getElementById('scanner-viewport');
  const resultCard = document.getElementById('ai-result-card');

  if (btn) {
    btn.innerHTML = `<span> Scanning Grain Spectrometry...</span>`;
    btn.disabled = true;
  }
  if (viewport) viewport.classList.add('scanning');

  try {
    const formData = new FormData();
    const fileInput = document.getElementById('ai-file-input');
    const cropName = selectedSampleCrop.charAt(0).toUpperCase() + selectedSampleCrop.slice(1);

    formData.append('crop_name', cropName);
    formData.append('lot_id', `LOT-${cropName.substring(0,3).toUpperCase()}-2026`);
    formData.append('tenant_id', 'TEN-ENT-902');

    if (fileInput && fileInput.files && fileInput.files[0]) {
      formData.append('file', fileInput.files[0]);
    } else {
      formData.append('sample_preset', selectedSampleCrop);
    }

    // Small delay to let scanning laser animate
    await new Promise(r => setTimeout(r, 900));

    const res = await fetch('/api/ai/grade-image', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    renderAiInspectionResult(data);
    showToast(`AI Quality Scan Complete: ${data.agmark_grade} (${data.confidence_score}% Confidence)`, 'success');
  } catch (err) {
    console.error("AI Scan failed:", err);
    showToast("AI scanning failed", "error");
  } finally {
    if (viewport) viewport.classList.remove('scanning');
    if (btn) {
      btn.innerHTML = `<span>🔬 Execute AI Computer Vision Inspection</span>`;
      btn.disabled = false;
    }
  }
}

function renderAiInspectionResult(data) {
  const card = document.getElementById('ai-result-card');
  if (!card) return;

  let gradeClass = 'grade-a';
  if (data.grade_code === 'B') gradeClass = 'grade-b';
  if (data.grade_code === 'C') gradeClass = 'grade-c';

  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
      <div>
        <span style="font-size: 11px; font-family: monospace; color: #fbbf24; background: rgba(245,158,11,0.15); padding: 2px 6px; border-radius: 4px;">
          ${data.certificate_hash}
        </span>
        <h3 style="font-size: 18px; font-weight: 700; color: #fff; margin-top: 6px;">AGMARK Digital Quality Certificate</h3>
        <p style="font-size: 12px; color: var(--text-muted);">${data.crop_name} Sample  Analyzed at ${data.analysis_timestamp}</p>
      </div>
      <div class="ai-grade-badge-huge ${gradeClass}">
        ${data.agmark_grade}
      </div>
    </div>

    <div style="font-size: 12.5px; color: #94a3b8; background: rgba(0,0,0,0.25); padding: 10px 14px; border-radius: var(--radius-md); margin-bottom: 16px; border-left: 3px solid #fbbf24;">
      ${data.grade_desc}
    </div>

    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px;">
      <div style="background: var(--bg-surface-elevated); padding: 10px; border-radius: var(--radius-md); text-align: center;">
        <span style="font-size: 11px; color: var(--text-dim); display: block;">Luster Index</span>
        <strong style="font-size: 16px; color: #38bdf8;">${data.luster_score} / 100</strong>
      </div>
      <div style="background: var(--bg-surface-elevated); padding: 10px; border-radius: var(--radius-md); text-align: center;">
        <span style="font-size: 11px; color: var(--text-dim); display: block;">Broken Grain</span>
        <strong style="font-size: 16px; color: ${data.broken_pct <= 2.5 ? '#34d399' : '#f87171'};">${data.broken_pct}%</strong>
      </div>
      <div style="background: var(--bg-surface-elevated); padding: 10px; border-radius: var(--radius-md); text-align: center;">
        <span style="font-size: 11px; color: var(--text-dim); display: block;">Foreign Matter</span>
        <strong style="font-size: 16px; color: ${data.foreign_matter_pct <= 1.0 ? '#34d399' : '#f87171'};">${data.foreign_matter_pct}%</strong>
      </div>
      <div style="background: var(--bg-surface-elevated); padding: 10px; border-radius: var(--radius-md); text-align: center;">
        <span style="font-size: 11px; color: var(--text-dim); display: block;">Moisture %</span>
        <strong style="font-size: 16px; color: #fbbf24;">${data.moisture_pct}%</strong>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); padding: 12px 16px; border-radius: var(--radius-md);">
      <div>
        <span style="font-size: 11px; color: var(--text-muted); display: block;">AI Recommended Fair Settlement Price</span>
        <strong style="font-size: 20px; color: #34d399;">${data.fair_price_recommendation.toLocaleString()} / Quintal</strong>
        <span style="font-size: 11px; color: #34d399;"> (${data.price_modifier_pct >= 0 ? '+' : ''}${data.price_modifier_pct}% quality premium applied)</span>
      </div>
      <button class="btn btn-primary" onclick="showToast('Cryptographic Quality Certificate stamped on Blockchain Ledger', 'success')">
        📜 Export Signed Cert
      </button>
    </div>
  `;
}

function scrollToAiGrader(cropName) {
  const el = document.getElementById('ai-grader-panel');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
    selectedSampleCrop = cropName.toLowerCase();
    previewSampleCrop(selectedSampleCrop);
    document.querySelectorAll('.ai-sample-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.crop.toLowerCase() === selectedSampleCrop);
    });
  }
}

function releaseEscrowFunds(rfqId, amount) {
  showToast(`Escrow Milestone Met: ${amount.toLocaleString()} released to FPO Escrow Account for ${rfqId}`, 'success');
}

async function submitBuyerRfq() {
  const org = document.getElementById('rfq-buyer-org').value;
  const crop = document.getElementById('rfq-crop-name').value;
  const variety = document.getElementById('rfq-variety').value;
  const qty = document.getElementById('rfq-qty').value;
  const price = document.getElementById('rfq-target-price').value;
  const spec = document.getElementById('rfq-spec').value;
  const loc = document.getElementById('rfq-location').value;

  try {
    const res = await fetch('/api/enterprise/rfqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenant_id: 'TEN-ENT-902',
        buyer_org: org,
        crop_name: crop,
        variety: variety,
        required_qtl: parseFloat(qty),
        target_price_qtl: parseFloat(price),
        quality_spec: spec,
        delivery_location: loc
      })
    });
    const result = await res.json();
    showToast(`Tender ${result.rfq_id} published and ${result.escrow_amount.toLocaleString()} locked in Escrow`, 'success');
    closeModal('enterprise-rfq-modal');
    loadEnterpriseData();
  } catch (err) {
    showToast("Failed to create RFQ", "error");
  }
}

window.initEnterprisePortal = initEnterprisePortal;
window.loadEnterpriseData = loadEnterpriseData;
window.runAiCropScan = runAiCropScan;
window.releaseEscrowFunds = releaseEscrowFunds;
window.submitBuyerRfq = submitBuyerRfq;
window.scrollToAiGrader = scrollToAiGrader;
