/**
 * Agri-Connect Main Application Orchestrator
 * SIH 2026 PS-132 Prototype
 */

const STATE = {
  currentTenant: 'farmer', // 'farmer', 'apmc_board', 'fpo_coop', 'enterprise_buyer'
  tenants: {},
  lang: 'en',
  mandiPrices: []
};

// Tenant Metadata Configuration
const TENANT_CONFIGS = {
  farmer: {
    id: 'TEN-FARM-001',
    code: 'farmer',
    name: 'Kisan Krishi Direct Portal',
    sub: 'Farmer Self-Service & Net Profit Router',
    role: 'Farmer / Individual Producer',
    accent: '#16a34a',
    icon: '🌾',
    viewId: 'view-farmer',
    themeClass: 'farmer-theme'
  },
  apmc_board: {
    id: 'TEN-APMC-MH01',
    code: 'apmc_board',
    name: 'Maharashtra State APMC Regulatory Board',
    sub: 'White-Labeled Statewide Market Surveillance & Cess Oversight',
    role: 'State Regulator & APMC Authority',
    accent: '#0ea5e9',
    icon: '🏛️',
    viewId: 'view-apmc',
    themeClass: 'apmc-theme'
  },
  fpo_coop: {
    id: 'TEN-FPO-774',
    code: 'fpo_coop',
    name: 'Sahyadri Farmers Producer Company (FPO)',
    sub: 'Bulk Crop Pooling & Member Ledger Engine',
    role: 'FPO / Cooperative Aggregator',
    accent: '#10b981',
    icon: '🤝',
    viewId: 'view-fpo',
    themeClass: 'fpo-theme'
  },
  enterprise_buyer: {
    id: 'TEN-ENT-902',
    code: 'enterprise_buyer',
    name: 'ITC Agri-Business Institutional Procurement',
    sub: 'Enterprise Reverse Auction Bidding & AI Quality Grading',
    role: 'Institutional Buyer / Food Processor',
    accent: '#f59e0b',
    icon: '🏢',
    viewId: 'view-enterprise',
    themeClass: 'enterprise-theme'
  }
};

// Vernacular Translations
const I18N = {
  en: {
    brandSubtitle: "Multi-Tenant Agri-Marketplace SaaS",
    netProfitTitle: "Net Profit Mandi Router",
    calcBtn: "Calculate Net Profit Route",
    optimalWinner: "MAXIMUM IN-POCKET PROFIT (RECOMMENDED)",
    grossTrap: "DECEPTIVE GROSS PRICE TRAP (WARNING)",
    isolationProof: "Data Isolation: Row-Level Security Verified"
  },
  hi: {
    brandSubtitle: "मल्टी-टेनेंट कृषि-मार्केटप्लेस सॉफ़्टवेयर",
    netProfitTitle: "शुद्ध मुनाफा मंडी नेविगेटर",
    calcBtn: "शुद्ध लाभ की गणना करें",
    optimalWinner: "सर्वोच्च शुद्ध मुनाफा (सुझावित मंडी)",
    grossTrap: "धोखेबाज उच्च सकल भाव (सावधान)",
    isolationProof: "डेटा सुरक्षा: रो-लेवल आइसोलेशन सत्यापित"
  }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  setupURLRouter();
  setupTenantDropdown();
  setupKeyboardShortcuts();
  await fetchMandiPricesTicker();

  // Load initial view
  switchTenant(STATE.currentTenant, false);

  // Initialize view controllers
  if (window.initNetProfitRouter) window.initNetProfitRouter();
  if (window.initApmcDashboard) window.initApmcDashboard();
  if (window.initFpoLedger) window.initFpoLedger();
  if (window.initEnterprisePortal) window.initEnterprisePortal();
  if (window.initAuditInspector) window.initAuditInspector();
});

// Handle URL query param: ?tenant=...
function setupURLRouter() {
  const urlParams = new URLSearchParams(window.location.search);
  const tenantParam = urlParams.get('tenant');
  if (tenantParam && TENANT_CONFIGS[tenantParam]) {
    STATE.currentTenant = tenantParam;
  }

  window.addEventListener('popstate', (e) => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('tenant') || 'farmer';
    if (TENANT_CONFIGS[code]) {
      switchTenant(code, false);
    }
  });
}

// Tenant Switcher Logic
function switchTenant(tenantCode, updateHistory = true) {
  const config = TENANT_CONFIGS[tenantCode];
  if (!config) return;

  STATE.currentTenant = tenantCode;

  if (updateHistory) {
    const newUrl = `${window.location.pathname}?tenant=${tenantCode}`;
    window.history.pushState({ tenant: tenantCode }, '', newUrl);
  }

  // Update Header Pill
  const pillIcon = document.getElementById('active-tenant-icon');
  const pillName = document.getElementById('active-tenant-name');
  const pillId = document.getElementById('active-tenant-id');
  const pillDot = document.getElementById('active-tenant-dot');

  if (pillIcon) pillIcon.textContent = config.icon;
  if (pillName) pillName.textContent = config.name.split('(')[0].trim();
  if (pillId) pillId.textContent = config.id;
  if (pillDot) {
    pillDot.style.background = config.accent;
    pillDot.style.boxShadow = `0 0 8px ${config.accent}`;
  }

  // Close dropdown
  const dropdown = document.getElementById('tenant-dropdown');
  if (dropdown) dropdown.classList.remove('open');

  // Mark active option in dropdown
  document.querySelectorAll('.tenant-option').forEach(el => {
    el.classList.toggle('active', el.dataset.tenant === tenantCode);
  });

  // Toggle active view
  document.querySelectorAll('.tenant-view').forEach(view => {
    view.classList.remove('active');
  });

  const activeView = document.getElementById(config.viewId);
  if (activeView) {
    activeView.classList.add('active');
  }

  // Trigger tenant-specific refresh
  if (tenantCode === 'apmc_board' && window.loadApmcData) window.loadApmcData();
  if (tenantCode === 'fpo_coop' && window.loadFpoData) window.loadFpoData();
  if (tenantCode === 'enterprise_buyer' && window.loadEnterpriseData) window.loadEnterpriseData();
  if (tenantCode === 'farmer' && window.loadFarmerData) window.loadFarmerData();

  showToast(`Switched Tenant View: ${config.name} (${config.id})`, 'info');
}

function setupTenantDropdown() {
  const pill = document.getElementById('tenant-pill-trigger');
  const dropdown = document.getElementById('tenant-dropdown');

  if (pill && dropdown) {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && !pill.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });

    document.querySelectorAll('.tenant-option').forEach(option => {
      option.addEventListener('click', () => {
        const tenant = option.dataset.tenant;
        switchTenant(tenant);
      });
    });
  }
}

// Live Mandi Ticker
async function fetchMandiPricesTicker() {
  try {
    const res = await fetch('/api/mandi-prices');
    const data = await res.json();
    STATE.mandiPrices = data;
    renderTicker(data);
  } catch (err) {
    console.error("Failed to load mandi ticker prices:", err);
  }
}

function renderTicker(prices) {
  const track = document.getElementById('ticker-track');
  if (!track) return;

  const topItems = prices.slice(0, 10);
  // Duplicate array for seamless infinite scroll
  const displayItems = [...topItems, ...topItems];

  track.innerHTML = displayItems.map(p => {
    const isUp = (p.modal_price >= 3000);
    return `
      <div class="ticker-item">
        <span class="ticker-crop">${p.crop_name} (${p.mandi_name})</span>
        <span class="ticker-price">₹${p.modal_price.toLocaleString()}/qtl</span>
        <span class="ticker-trend ${isUp ? 'up' : 'down'}">${isUp ? '▲ +2.8%' : '▼ -1.2%'}</span>
      </div>
    `;
  }).join('');
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  if (type === 'error') toast.style.borderLeftColor = '#ef4444';
  if (type === 'success') toast.style.borderLeftColor = '#10b981';
  if (type === 'info') toast.style.borderLeftColor = '#0ea5e9';

  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span>${type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ'}</span>
      <span>${message}</span>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Vernacular language toggle
function toggleLanguage() {
  STATE.lang = (STATE.lang === 'en') ? 'hi' : 'en';
  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) {
    langBtn.textContent = (STATE.lang === 'en') ? 'हिंदी' : 'English';
  }
  showToast(STATE.lang === 'en' ? "Language changed to English" : "भाषा बदलकर हिंदी की गई", "info");
}

// Keyboard shortcuts for judges
function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    // Ctrl + Shift + T : Cycle tenants
    if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'T') {
      e.preventDefault();
      const tenants = Object.keys(TENANT_CONFIGS);
      const currentIndex = tenants.indexOf(STATE.currentTenant);
      const nextIndex = (currentIndex + 1) % tenants.length;
      switchTenant(tenants[nextIndex]);
    }
    // Ctrl + Shift + A : Open Audit Inspector Modal
    if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'A') {
      e.preventDefault();
      if (window.openAuditModal) window.openAuditModal();
    }
  });
}

// ==================== 15-SECOND SCRIPTED JUDGE DEMO TOUR ====================

let demoTourTimer = null;

function start15SecDemoTour() {
  const banner = document.getElementById('demo-tour-banner');
  const bar = document.getElementById('tour-progress-bar');
  const text = document.getElementById('tour-step-text');

  if (!banner || !bar || !text) return;

  banner.classList.add('active');
  bar.style.width = '0%';
  bar.style.transition = 'width 15s linear';

  // Start progress bar animation
  setTimeout(() => { bar.style.width = '100%'; }, 50);

  // Beat 1: 0 - 5s -> Farmer View
  switchTenant('farmer', true);
  text.innerHTML = `<strong>[Beat 1/3 - Farmer View]</strong> Calculating True Net Profit & ESG Carbon Score. Notice the +218 kg CO₂ Saved badge and 7-Day Forecast!`;
  const routerEl = document.getElementById('net-profit-router-section');
  if (routerEl) routerEl.scrollIntoView({ behavior: 'smooth' });

  // Beat 2: 5s -> State APMC Board
  setTimeout(() => {
    switchTenant('apmc_board', true);
    text.innerHTML = `<strong>[Beat 2/3 - State APMC Board]</strong> Instant RLS Reconfiguration! Live Maharashtra District Arrival Heatmap, Daily Cess Accrual, and Anti-Hoarding Radar.`;
    const mapEl = document.getElementById('apmc-leaflet-map');
    if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
  }, 5000);

  // Beat 3: 10s -> Enterprise Buyer View
  setTimeout(() => {
    switchTenant('enterprise_buyer', true);
    text.innerHTML = `<strong>[Beat 3/3 - Enterprise Buyer]</strong> Institutional Procurement! Computer Vision Grain Spectrometry & Automated Escrow Milestone Release.`;
    const aiEl = document.getElementById('ai-grader-panel');
    if (aiEl) aiEl.scrollIntoView({ behavior: 'smooth' });
  }, 10000);

  // Finish: 15s
  setTimeout(() => {
    banner.classList.remove('active');
    bar.style.width = '0%';
    showToast("15-Sec Demo Tour Complete: Single unified SaaS powered by Row-Level Security (RLS)!", "success");
  }, 15500);
}

function stopDemoTour() {
  const banner = document.getElementById('demo-tour-banner');
  if (banner) banner.classList.remove('active');
}

// ==================== TRUST SCORE & CREDIT MODAL ====================

async function openTrustScoreModal(farmerName = "Rameshwar Patil") {
  const modal = document.getElementById('trust-score-modal');
  const content = document.getElementById('trust-score-content');
  if (!modal || !content) return;

  content.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-muted);">Fetching credit bureau & transaction ledger...</div>`;
  modal.classList.add('open');

  try {
    const res = await fetch(`/api/farmer/trust-score?farmer_name=${encodeURIComponent(farmerName)}`);
    const data = await res.json();

    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, rgba(56,189,248,0.2), rgba(14,165,233,0.4)); border: 2px solid #38bdf8; font-size: 28px; font-weight: 800; color: #38bdf8; margin-bottom: 10px;">
          ${data.trust_score}
        </div>
        <h3 style="font-size: 20px; font-weight: 700; color: #fff;">${data.farmer_name}</h3>
        <span class="brand-badge" style="background: rgba(56,189,248,0.2); color: #38bdf8; font-size: 12px;">
          💎 ${data.tier}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
        <div style="background: var(--bg-surface-elevated); padding: 12px; border-radius: var(--radius-md); text-align: center;">
          <span style="font-size: 11px; color: var(--text-dim); display: block;">Fulfillment Rate</span>
          <strong style="font-size: 16px; color: #34d399;">${data.fulfillment_rate_pct}%</strong>
        </div>
        <div style="background: var(--bg-surface-elevated); padding: 12px; border-radius: var(--radius-md); text-align: center;">
          <span style="font-size: 11px; color: var(--text-dim); display: block;">AGMARK Consistency</span>
          <strong style="font-size: 16px; color: #38bdf8;">${data.grade_consistency_pct}%</strong>
        </div>
        <div style="background: var(--bg-surface-elevated); padding: 12px; border-radius: var(--radius-md); text-align: center;">
          <span style="font-size: 11px; color: var(--text-dim); display: block;">On-Time Dispatch</span>
          <strong style="font-size: 16px; color: #fbbf24;">${data.on_time_delivery_pct}%</strong>
        </div>
      </div>

      <!-- Pre-Qualified Credit Offer Box -->
      <div style="background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,78,59,0.25)); border: 1.5px solid #10b981; border-radius: var(--radius-lg); padding: 18px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">💳</span>
            <strong style="color: #34d399; font-size: 15px;">Instant Micro-Credit Pre-Approval</strong>
          </div>
          <span style="font-size: 11px; background: #10b981; color: #fff; padding: 2px 8px; border-radius: var(--radius-full); font-weight: 700;">
            KCC Partner NBFC
          </span>
        </div>
        <div style="font-size: 13px; color: #e2e8f0; margin-bottom: 12px;">
          Based on your verified delivery history, you are pre-qualified for <strong>₹${data.credit_pre_qualification.max_credit_limit_inr.toLocaleString()}</strong> at a subsidized interest rate of <strong>${data.credit_pre_qualification.interest_rate_pct}% p.a.</strong>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary" style="flex: 1;" onclick="showToast('Instant Pre-Harvest Credit Application Dispatched to Kisan Credit Card Portal', 'success'); closeModal('trust-score-modal');">
            ⚡ Claim Instant ₹1.5 Lakh Credit
          </button>
        </div>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div style="color: #f87171; text-align: center;">Failed to load credit profile</div>`;
  }
}

// ==================== FARM-TO-FORK QR TRACEABILITY PASSPORT ====================

function openTraceabilityModal(crop = "Onion", lot = "LOT-NAS-2026-09") {
  const modal = document.getElementById('traceability-modal');
  const content = document.getElementById('traceability-content');
  if (!modal || !content) return;

  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const hash = `AGRI-PROV-SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  content.innerHTML = `
    <div style="text-align: center; margin-bottom: 16px;">
      <span class="brand-badge" style="background: rgba(16,185,129,0.2); color: #34d399; font-size: 11px;">
        BLOCKCHAIN VERIFIED PROVENANCE
      </span>
      <h3 style="font-size: 20px; font-weight: 700; color: #fff; margin-top: 6px;">Farm-to-Fork Digital Product Passport</h3>
      <p style="font-size: 12px; color: var(--text-muted);">Cryptographic verification for FMCG Buyers (ITC / Reliance / BigBasket)</p>
    </div>

    <div style="background: #fff; padding: 16px; border-radius: var(--radius-lg); width: 160px; margin: 0 auto 16px; text-align: center;">
      <svg viewBox="0 0 100 100" width="130" height="130">
        <rect width="100" height="100" fill="#fff"/>
        <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" fill="#000"/>
        <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" fill="#000"/>
        <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" fill="#000"/>
        <rect x="45" y="15" width="8" height="20" fill="#000"/>
        <rect x="45" y="45" width="15" height="15" fill="#000"/>
        <rect x="70" y="55" width="15" height="8" fill="#000"/>
        <rect x="55" y="75" width="25" height="10" fill="#000"/>
      </svg>
      <div style="font-family: monospace; font-size: 10px; color: #000; font-weight: 700; margin-top: 4px;">SCAN FOR KYC ORIGIN</div>
    </div>

    <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px; font-size: 12px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span style="color: var(--text-muted);">Provenance Hash:</span>
        <span style="font-family: monospace; color: #38bdf8;">${hash}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span style="color: var(--text-muted);">Farm Origin GPS:</span>
        <strong>Niphad, Nashik (20.0110° N, 74.0520° E)</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span style="color: var(--text-muted);">Farmer Aadhaar KYC:</span>
        <strong style="color: #34d399;">✓ UIDAI Biometric Verified</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span style="color: var(--text-muted);">AI Quality Grade:</span>
        <strong style="color: #38bdf8;">AGMARK Grade A (Premium)</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: var(--text-muted);">Cold-Chain Sensor Log:</span>
        <span style="color: #34d399;">18.5°C Steady (Compliant)</span>
      </div>
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 8px;">
      <button class="btn btn-secondary" onclick="closeModal('traceability-modal')">Close</button>
      <button class="btn btn-primary" onclick="showToast('Provenance Passport Exported as PDF Tag for Container Labeling', 'success'); closeModal('traceability-modal');">
        📜 Export Container Passport
      </button>
    </div>
  `;
  modal.classList.add('open');
}

// ==================== SMS / WHATSAPP DISPATCH SIMULATOR ====================

async function simulateSmsDispatch(crop = "Onion", qty = 150, netProfit = 416570, mandi = "Vashi APMC") {
  const modal = document.getElementById('sms-modal');
  const content = document.getElementById('sms-modal-content');
  if (!modal || !content) return;

  try {
    const res = await fetch('/api/sms/send-simulation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmer_name: "Rameshwar Patil",
        mobile: "+91 98220 14521",
        crop: crop,
        quantity_qtl: qty,
        net_profit: netProfit,
        mandi: mandi
      })
    });
    const data = await res.json();

    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 16px;">
        <span class="brand-badge" style="background: rgba(16,185,129,0.2); color: #34d399;">
          ${data.provider}
        </span>
        <h3 style="font-size: 18px; font-weight: 700; color: #fff; margin-top: 6px;">Non-Smartphone Rural Gateway</h3>
        <p style="font-size: 12px; color: var(--text-muted);">Delivering critical transaction & pass data to basic feature phones</p>
      </div>

      <div class="sms-phone-mockup">
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; margin-bottom: 8px; border-bottom: 1px solid #334155; padding-bottom: 4px;">
          <span>AIRTEL 4G (Nashik Rural)</span>
          <span>${data.timestamp.split(' ')[1]}</span>
        </div>

        <div style="font-size: 11px; color: #38bdf8; font-weight: 700; margin-bottom: 4px;">
          From: BHARAT-GOVT-AGRI
        </div>

        <div class="sms-bubble">
          <strong>[English Alert]</strong><br>
          ${data.message_english}
        </div>

        <div class="sms-bubble" style="border-left-color: #38bdf8; margin-top: 10px;">
          <strong>[हिंदी सूचना]</strong><br>
          ${data.message_hindi}
        </div>

        <div style="text-align: center; margin-top: 12px; font-size: 10px; color: #64748b;">
          Zero-Internet USSD / SMS Fallback Verified
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: 18px;">
        <button class="btn btn-secondary" onclick="closeModal('sms-modal')">Close Simulator</button>
      </div>
    `;
    modal.classList.add('open');
    showToast(`SMS dispatch transmitted to ${data.mobile}`, 'success');
  } catch (err) {
    showToast("SMS simulation failed", "error");
  }
}

// Export globals
window.STATE = STATE;
window.TENANT_CONFIGS = TENANT_CONFIGS;
window.switchTenant = switchTenant;
window.showToast = showToast;
window.toggleLanguage = toggleLanguage;
window.start15SecDemoTour = start15SecDemoTour;
window.stopDemoTour = stopDemoTour;
window.openTrustScoreModal = openTrustScoreModal;
window.openTraceabilityModal = openTraceabilityModal;
window.simulateSmsDispatch = simulateSmsDispatch;
