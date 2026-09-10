# Agri-Connect: Multi-Tenant Agri-Marketplace SaaS Prototype
## Smart India Hackathon (SIH 2026) — Problem Statement 132 (PS-132)

> **Core Breakthrough:** A breakthrough **Net Profit Mandi Routing Engine** that prevents farmers from falling into the "High Gross Listed Price Trap" by factoring in freight, toll barriers, APMC cess, loading costs, and transit spoilage to compute the true **highest in-pocket net earnings**. Features **3 instant-switch tenant views** (State APMC Board, FPO Collective, Enterprise Buyer) with verified Row-Level Security (RLS) data isolation and an **AI Computer Vision Crop Quality Grader**.

---

## 🌟 Key Innovations & Value Propositions

| Feature | The Conventional Problem | The Agri-Connect Solution |
| :--- | :--- | :--- |
| **Net Profit Routing Engine** | Farmers travel hundreds of km chasing high mandi prices (e.g. ₹3,800 at Azadpur Delhi), only to lose profit to fuel, tolls, and 2% APMC cess. | Dynamically computes net profit across all mandis. Highlights the true winner (e.g. Vashi netting **+₹102,708 more in the farmer's pocket** on a 150 Qtl lot). |
| **Instant Multi-Tenancy** | Different stakeholders require siloed software (APMC board, FPOs, large corporate buyers). | 1 Unified SaaS with instant switching via header dropdown, URL query parameter (`?tenant=...`), or `Ctrl+Shift+T`. |
| **Data Isolation Integrity** | Shared platforms risk leaking private FPO member ledgers and corporate bidding margins. | Row-Level Security (RLS) parameterization. Includes an interactive **Data Isolation Inspector** modal (`Ctrl+Shift+A`). |
| **AI Crop Quality Grading** | Manual subjective visual grading by middlemen leads to arbitrary price deductions (dockage). | In-browser/backend Computer Vision (PIL/NumPy) analyzes grain luster, broken grain %, moisture, and issues tamper-proof **AGMARK Digital Certificates**. |
| **FPO Bulk Aggregation** | Smallholders sell individually at low spot prices. | FPOs pool small lots into 16-ton truckloads, unlocking **+11.4% collective bargaining premiums** and saving **38.5% on shared logistics**. |
| **Trust Score / Farmer Credit** | Smallholders struggle to get institutional bank credit without physical land collateral. | Transaction reliability algorithm generates a 0–100 **Kisan Trust Score** with pre-approved **₹1.5 Lakh micro-credit** at subsidized 4.0% p.a. |
| **ESG / Carbon Routing** | Long-distance transport burns excessive diesel and emits metric tons of greenhouse gases. | Real-time carbon emission tracking shows **3,374 kg CO₂ saved** by choosing closer high-net-profit mandis over distant deceptive ones. |
| **7-Day Price Forecast (AI)** | Farmers don't know whether to sell immediately or hold produce for 3 days. | Moving-average ARIMA/elasticity forecast widget shows projected 7-day prices with clear **"SELL NOW" vs "HOLD +3 DAYS"** advisories. |
| **Farm-to-Fork Traceability** | Institutional buyers (ITC/Reliance) demand verifiable chemical-free provenance. | Instant **Digital Product Passport QR tag** encoding farm GPS, Aadhaar KYC, cold-chain temperature logs, and AGMARK inspection hash. |
| **Govt Analyst Heatmap** | State APMC regulators lack spatial awareness of supply gluts and price anomalies across districts. | Interactive **Leaflet.js Maharashtra Heatmap** visualizing real-time mandi arrivals, daily cess collections, and price volatility alerts. |
| **Rural SMS / USSD Fallback** | 40%+ of rural farmers use basic feature phones without smartphones or internet access. | Simulated **Zero-Internet SMS/USSD Dispatcher** sending bilingual alerts with priority gate pass tokens to farmers' feature phones. |
| **15-Second Judge Tour** | Judges have limited time during hackathon presentations. | Dedicated **⚡ 15-Sec Demo Tour** button that automatically choreographs a multi-tenant tour with live progress indicator. |

---

## 🏛️ The Three Tenant Views (+ Farmer Portal)

1. **🌾 Farmer Direct & Net Profit Router (`TEN-FARM-001`)**:
   - Live interactive cost waterfall (Freight, Tolls, Mandi Cess, Handling, Transit Spoilage).
   - Side-by-side comparison: **Optimal Net Profit Winner** vs **Deceptive Gross Price Trap**.
   - Carbon savings badge (kg CO₂ saved).
   - 1-Click "Explain Formula" mathematical breakdown panel.
   - 7-Day AI Price Forecast trend line with sell/hold advisory.
   - 1-Click Mandi Gate Token & E-Pass generator with priority QR code.
   - Gamification strip (4-week listing streak, Block Rank #2, 150 Krishi Coins).
   - Kisan Trust Score pill with pre-approved ₹1.5L NBFC micro-loan.
   - Vernacular English / Hindi toggle.

2. **🏛️ State APMC Regulatory Board View (`TEN-APMC-MH01`)**:
   - Statewide market surveillance (305 APMC mandis across 36 districts).
   - Real-time cess revenue monitoring (₹34.8 Lakhs daily / ₹10.45 Cr monthly).
   - **Govt Analyst Statewide Heatmap**: Leaflet.js map with pulsating district circles.
   - Automated **Price Volatility & Anti-Hoarding Radar** to detect artificial hoarding spikes.
   - Inter-mandi trade flow volume monitoring.
   - Statutory Dispute & Grievance Redressal Ledger.

3. **🤝 FPO Cooperative View (`TEN-FPO-774` - Sahyadri Farmers Producer Co.)**:
   - Bulk Pooling Aggregator with truck capacity progress bars.
   - Isolated Member Ledger (land size, moisture %, quality grade, advance paid, final payout).
   - Collective bargaining premium calculator (+11.4% premium).
   - 1-Click Digital Bank Payout settlement.

4. **🏢 Enterprise Buyer View (`TEN-ENT-902` - ITC Agri-Business Division)**:
   - Institutional Reverse Auction Tenders (RFQs) with escrow funding status.
   - **AI Computer Vision Crop Quality Grader**: Interactive image scanning of grain samples (Wheat, Soybean, Onion, Tomato).
   - Smart Contract Escrow Milestones (Funded ➔ Weighed ➔ AI Certified ➔ Released).
   - Farm-to-Fork Digital Product Passport exporter.

---

## 🚀 How to Run Locally (Zero Cloud Dependencies)

Agri-Connect is designed to run completely on **localhost** for hackathon evaluation:

### Option 1: Double-Click `run.bat`
Simply double-click [`run.bat`](file:///C:/Users/chhav/.gemini/antigravity-ide/scratch/agri-connect/run.bat).

### Option 2: Command Line
```powershell
cd C:\Users\chhav\.gemini\antigravity-ide\scratch\agri-connect\backend
"C:\Program Files\Python314\python.exe" -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```
Open **http://127.0.0.1:8000** in your browser.

---

## ⚡ 1-Click Judge Demo Tour & Quick Controls

- **⚡ 15-Sec Demo Tour Button**: Click the pulsing yellow button in the header to start the choreographed tour.
- **`Ctrl + Shift + T`**: Instantly cycle between the 4 tenant views.
- **`Ctrl + Shift + A`**: Open the **Data Isolation Inspector** to verify Row-Level Security and simulate cross-tenant attack defense.
- **Direct Tenant URLs**:
  - Farmer View: `http://127.0.0.1:8000/?tenant=farmer`
  - APMC Board: `http://127.0.0.1:8000/?tenant=apmc_board`
  - FPO Cooperative: `http://127.0.0.1:8000/?tenant=fpo_coop`
  - Enterprise Buyer: `http://127.0.0.1:8000/?tenant=enterprise_buyer`

