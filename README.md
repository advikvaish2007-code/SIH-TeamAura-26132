# Agri-Connect

### Multi-Tenant Agri-Marketplace SaaS & Intelligent Mandi Routing Platform

**Smart India Hackathon 2026 — Problem Statement 132 (PS-132)**
**Theme:** Strengthening Market Linkages and Price Discovery for Farmers

> **Agri-Connect helps farmers make better selling decisions by comparing the actual money they will receive from different markets — not merely the price displayed on a mandi board.**

 **Live Platform:** https://sih-teamaura-26132.onrender.com/

---

## 1. The Problem

Farmers often face a critical information gap while deciding **where and to whom they should sell their produce**.

A mandi may advertise a higher price, but the highest listed price does **not necessarily mean the highest income for the farmer**.

For example:

| Market  | Listed Price | Transportation | Mandi Charges | Spoilage | Actual Earnings |
| ------- | -----------: | -------------: | ------------: | -------: | --------------: |
| Mandi A |     ₹2,800/q |           ₹100 |           ₹50 |      ₹40 |          ₹2,610 |
| Mandi B |     ₹2,700/q |            ₹20 |           ₹20 |      ₹10 |      **₹2,650** |

Although **Mandi A displays a higher price**, Mandi B provides the farmer with more money in hand.

### The "High Gross Price Trap"

Existing price-discovery systems primarily focus on:

**"Where is the highest selling price?"**

Agri-Connect instead asks:

**"Where will the farmer earn the highest NET PROFIT?"**

This distinction is the core of our solution.

---

# 2. Our Solution

Agri-Connect is a **multi-tenant agricultural marketplace and decision-support platform** connecting:

* Farmers
* FPOs / Farmer Collectives
* APMCs / State Agricultural Boards
* Enterprise Buyers

The platform combines **market prices, logistics costs, mandi charges, spoilage risk and route information** to calculate the farmer's estimated **in-pocket earnings**.

Instead of simply displaying prices, Agri-Connect recommends the market that provides the **best economic outcome**.

### Core Decision Pipeline

```text
Market Prices
      ↓
Distance & Route Analysis
      ↓
Freight Estimation
      ↓
Toll / Transit Costs
      ↓
APMC Cess & Loading Charges
      ↓
Expected Transit Spoilage
      ↓
Net Profit Calculation
      ↓
Market Ranking
      ↓
Recommended Mandi
```

---

# 3. Core Innovation — Net Profit Mandi Routing Engine

The most important component of Agri-Connect is our:

## Net Profit Mandi Routing Engine

The engine evaluates competing markets based on the farmer's **actual expected earnings**.

### Instead of:

```text
Best Market = Highest Listed Price
```

### Agri-Connect calculates:

```text
Net Profit
=
Gross Sale Value
- Transportation Cost
- Toll Cost
- APMC Cess
- Loading / Handling Cost
- Expected Spoilage Loss
- Other Route-Dependent Costs
```

The system can then rank available markets according to:

```text
Highest Net Profit → Lowest Net Profit
```

### Why this matters

A market that pays ₹3,000/quintal is not necessarily better than one paying ₹2,900/quintal.

If reaching the ₹3,000 market requires:

* Higher freight
* Multiple toll barriers
* Higher mandi charges
* More loading costs
* Longer transit time
* Greater spoilage risk

the farmer may actually earn **less**.

Agri-Connect makes these hidden costs visible before the farmer commits to a market.

---

# 4. What Makes Agri-Connect Different?

Most agricultural marketplace systems stop at:

> **Price Discovery**

Agri-Connect extends this to:

> **Profit Discovery**

### Traditional Approach

```text
Find highest price
        ↓
Select market
        ↓
Transport produce
        ↓
Discover actual costs
        ↓
Realize final earnings
```

### Agri-Connect Approach

```text
Find available markets
        ↓
Calculate complete logistics cost
        ↓
Estimate spoilage & deductions
        ↓
Calculate NET PROFIT
        ↓
Rank markets
        ↓
Choose the economically optimal destination
```

This converts raw market information into an **actionable selling decision**.

---

# 5. Multi-Tenant Platform

Agri-Connect is designed as a multi-stakeholder SaaS platform.

The same underlying system provides different interfaces according to the user's role.

## Tenant 1 — State APMC Board

Provides administrators with visibility into:

* Market activity
* Mandi pricing
* Transaction information
* Market performance
* Regional supply-demand signals
* Audit information

---

## Tenant 2 — FPO Collective

FPOs can use Agri-Connect to:

* Aggregate farmer produce
* Compare mandi opportunities
* Discover better markets
* Evaluate transportation economics
* Coordinate collective selling
* Improve bargaining power
* Access market intelligence

An FPO can therefore make decisions at a **collective scale rather than farmer-by-farmer**.

---

## Tenant 3 — Enterprise Buyer

Enterprise buyers can:

* Discover available agricultural produce
* View seller / FPO listings
* Evaluate quality
* Access market information
* Submit purchase requirements
* Build direct procurement relationships

This creates a stronger connection between **producers and institutional buyers**.

---

# 6. Data Isolation & Security

Agri-Connect follows a **multi-tenant architecture** where data belonging to one organization must remain isolated from another.

The system incorporates **Row-Level Security (RLS)-style tenant isolation** and an audit inspection mechanism.

### Example

```text
APMC Tenant
     │
     ├── Market Data
     ├── Mandi Operations
     └── Administrative Records

FPO Tenant
     │
     ├── Farmer Records
     ├── Aggregated Produce
     └── Collective Transactions

Buyer Tenant
     │
     ├── Procurement Requirements
     ├── Orders
     └── Buyer Activity
```

Each tenant only accesses the data permitted to it.

### Audit Inspector

The platform includes an audit interface accessible through:

```text
Ctrl + Shift + A
```

or:

```text
/api/audit/logs
```

This allows the system's tenant-access behavior to be inspected during demonstration and evaluation.

---

# 7. AI Crop Quality Grader

Agri-Connect also introduces an AI-assisted crop quality assessment module.

### Workflow

```text
Upload Crop Image
        ↓
Computer Vision Analysis
        ↓
Quality Assessment
        ↓
Grade / Classification
        ↓
AGMARK-related Hash / Verification Data
        ↓
Marketplace Listing
```

### API

```http
POST /api/ai/grade-image
```

The objective is to reduce ambiguity between buyers and sellers by providing a standardized, technology-assisted quality assessment layer.

This can help:

* Improve buyer confidence
* Reduce quality disputes
* Support transparent listings
* Enable better price negotiation
* Improve marketplace trust

---

# 8. Smart Market Comparison

Instead of showing farmers a simple list of mandi prices, Agri-Connect can present a decision-oriented comparison.

### Example

```text
┌─────────────────────────────────────────────┐
│            MARKET COMPARISON                │
├─────────────────────────────────────────────┤
│ Mandi A                                    │
│ Listed Price:        ₹2,950 / quintal      │
│ Freight:              -₹180                │
│ Toll:                   -₹40               │
│ Cess & Charges:         -₹60               │
│ Spoilage Estimate:      -₹55               │
│                                             │
│ NET EARNINGS:          ₹2,615              │
├─────────────────────────────────────────────┤
│ Mandi B                                    │
│ Listed Price:        ₹2,850 / quintal      │
│ Freight:              -₹70                 │
│ Toll:                   -₹10               │
│ Cess & Charges:         -₹35               │
│ Spoilage Estimate:      -₹15               │
│                                             │
│ NET EARNINGS:          ₹2,720              │
│                                             │
│ ★ RECOMMENDED                               │
└─────────────────────────────────────────────┘
```

The farmer can therefore understand **why** a market is recommended rather than blindly selecting the highest listed price.

---

# 9. CO₂-Aware Routing

The routing engine also considers transportation efficiency and provides an estimate of potential **CO₂ savings**.

The objective is not only:

> "Which route makes the most money?"

but eventually:

> "Which route makes the most money while avoiding unnecessary transportation?"

Reducing unnecessary travel can simultaneously contribute to:

* Lower transportation expenditure
* Lower fuel consumption
* Reduced spoilage
* Lower emissions

This creates a path toward **economically and environmentally efficient agricultural logistics**.

---

# 10. SMS Gateway Simulator

Farmers may not always have access to a high-end smartphone or stable internet connectivity.

To demonstrate an accessibility layer, Agri-Connect includes an SMS gateway simulator.

```http
POST /api/sms/send-simulation
```

The simulator demonstrates how critical information such as:

* Recommended market
* Expected net earnings
* Price information
* Buyer opportunities

could eventually be delivered through low-bandwidth communication channels.

This makes the solution more relevant to **last-mile agricultural users**.

---

# 11. System Architecture

```text
                    ┌─────────────────────┐
                    │      USERS          │
                    │                     │
                    │ Farmer / FPO / APMC │
                    │ Enterprise Buyer    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    FRONTEND UI      │
                    │                     │
                    │ HTML / CSS / JS     │
                    └──────────┬──────────┘
                               │
                         REST APIs
                               │
                               ▼
                    ┌─────────────────────┐
                    │     FASTAPI         │
                    │      BACKEND        │
                    └──────────┬──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
   ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
   │ Profit Router  │ │  AI Crop       │ │ Tenant /       │
   │                │ │  Grader        │ │ Audit Layer    │
   └───────┬────────┘ └───────┬────────┘ └───────┬────────┘
           │                  │                  │
           └──────────────────┼──────────────────┘
                              ▼
                    ┌─────────────────────┐
                    │     DATA LAYER      │
                    │                     │
                    │ Tenant-aware data   │
                    │ Market information  │
                    │ Listings / Records  │
                    └─────────────────────┘
```

---

# 12. Technology Stack

## Frontend

* HTML5
* CSS3
* JavaScript
* Responsive multi-tenant dashboard UI

## Backend

* Python
* FastAPI
* Uvicorn
* REST APIs

## Intelligence Layer

* Net Profit Optimization Engine
* Computer Vision Crop Grader
* Route / logistics calculations
* Spoilage estimation
* CO₂ estimation

## Security

* Multi-tenant architecture
* Row-Level Security principles
* Tenant-aware data access
* Audit logging

## Deployment

* Render
* Uvicorn
* Render Blueprint
* Procfile

---

# 13. API Architecture

Agri-Connect exposes modular REST endpoints.

| Endpoint                   | Purpose                       |
| -------------------------- | ----------------------------- |
| `/api/health`              | System health monitoring      |
| `/api/optimize-profit`     | Net-profit mandi optimization |
| `/api/ai/grade-image`      | AI crop quality analysis      |
| `/api/audit/logs`          | Tenant/audit inspection       |
| `/api/sms/send-simulation` | SMS gateway simulation        |

The modular API design allows individual services to evolve independently.

---

# 14. Net Profit Optimization — Example

Suppose a farmer has:

```text
Produce: 100 quintals
Selling Price: ₹2,800/quintal
```

Gross revenue:

```text
100 × ₹2,800 = ₹2,80,000
```

The routing engine then estimates:

```text
Freight              ₹8,000
Tolls                ₹2,000
APMC Cess             ₹3,000
Loading               ₹1,500
Expected Spoilage     ₹4,000
────────────────────────────
Total Costs          ₹18,500
```

Therefore:

```text
Net Earnings
= ₹2,80,000 - ₹18,500
= ₹2,61,500
```

The same calculation is performed across competing markets.

The market with the highest expected **net earnings** becomes the recommended destination.

---

# 15. End-to-End User Journey

### Step 1 — Farmer / FPO enters produce information

```text
Crop
Quantity
Current Location
```

### Step 2 — Platform discovers market opportunities

```text
Nearby Mandis
FPO Buyers
Enterprise Buyers
```

### Step 3 — Market prices are evaluated

The system compares available selling prices.

### Step 4 — Hidden costs are calculated

```text
Freight
Tolls
Cess
Loading
Spoilage
```

### Step 5 — Net profit is calculated

Each market receives a net-profit score.

### Step 6 — Markets are ranked

```text
#1 Best Net Earnings
#2
#3
...
```

### Step 7 — Farmer receives a recommendation

The farmer can make an informed selling decision based on **expected money in hand**.

---

# 16. Impact

Agri-Connect targets several problems simultaneously.

### For Farmers

* Better price discovery
* Higher transparency
* Visibility into hidden costs
* Better market selection
* Potentially higher realized income

### For FPOs

* Collective market intelligence
* Better aggregation decisions
* Improved bargaining position
* More efficient logistics

### For APMCs / Government

* Better market visibility
* Data-driven market monitoring
* Auditability
* Potential foundation for regional agricultural intelligence

### For Enterprise Buyers

* Better producer discovery
* Quality-aware procurement
* Direct market access
* More transparent transactions

---

# 17. Why Agri-Connect Can Scale

The platform is designed as a modular SaaS architecture.

New capabilities can be added without redesigning the entire platform:

```text
Current Platform
       │
       ├── Additional APMCs
       ├── More FPOs
       ├── More Enterprise Buyers
       ├── Additional Crops
       ├── Live Government Market Data
       ├── Real-time Maps
       ├── Payment Integration
       ├── Digital Contracts
       ├── Multilingual / Voice Interface
       └── Predictive Price Forecasting
```

The multi-tenant architecture also allows different organizations to operate on the same platform while maintaining logical data isolation.

---

# 18. Future Roadmap

### Phase 1 — Current Prototype

* Multi-tenant marketplace
* Net-profit mandi routing
* AI crop grading
* Audit inspection
* SMS simulation
* Production deployment

### Phase 2 — Real-World Data Integration

Integrate with:

* Live mandi prices
* Government agricultural datasets
* Mapping / routing services
* Weather APIs
* Real logistics providers

### Phase 3 — Predictive Intelligence

Introduce:

* Price forecasting
* Demand forecasting
* Spoilage prediction
* Crop supply forecasting
* Dynamic route optimization

### Phase 4 — Full Agricultural Commerce Platform

Enable:

* Digital contracts
* Payments
* Logistics booking
* Warehouse discovery
* Insurance integration
* Enterprise procurement
* Farmer credit / financing integrations

---

# 19. Production Deployment

Agri-Connect is deployed as a live production prototype.

### Live URL

https://sih-teamaura-26132.onrender.com/

### Render Configuration

The repository contains:

```text
render.yaml
Procfile
requirements.txt
main.py
```

These files allow the backend application to be deployed through Render infrastructure.

---

# 20. Project Structure

```text
.
├── main.py
├── render.yaml
├── Procfile
├── requirements.txt
│
└── agri-connect/
    │
    ├── backend/
    │   ├── app.py
    │   ├── database.py
    │   ├── ai_grader.py
    │   └── profit_optimizer.py
    │
    ├── frontend/
    │   ├── HTML
    │   ├── CSS
    │   └── JavaScript
    │
    └── test_endpoints.py
```

---

# 21. Testing & Verification

The backend includes an automated endpoint test suite:

```text
agri-connect/test_endpoints.py
```

Critical services can also be manually verified through:

```http
GET /api/health
```

The project provides dedicated endpoints for demonstrating the major system components.

---

# 22. Demonstration Checklist

For an SIH jury demonstration, the platform can be presented through the following flow:

### 1. Open the live platform

```text
https://sih-teamaura-26132.onrender.com/
```

### 2. Demonstrate tenant switching

Show:

```text
APMC Board
      ↓
FPO Collective
      ↓
Enterprise Buyer
```

### 3. Demonstrate the problem

Show two markets with different:

* Listed prices
* Distances
* Transportation costs
* Charges
* Spoilage

### 4. Demonstrate the breakthrough

Show how the system selects the market with the **highest net earnings**, even when it does not have the highest listed price.

### 5. Demonstrate AI quality grading

Upload a crop image and demonstrate the quality analysis.

### 6. Demonstrate auditability

Press:

```text
Ctrl + Shift + A
```

and show tenant/audit information.

### 7. Demonstrate accessibility

Show the SMS simulation.

### 8. Finish with the impact

> **"We are not just telling farmers where the price is highest. We are telling them where they are most likely to earn the most."**

---

# 23. The Core Value Proposition

## From Price Discovery → Profit Discovery

Traditional agricultural marketplaces answer:

> **"Who is offering the highest price?"**

Agri-Connect answers:

> **"After transportation, tolls, mandi charges, loading and spoilage, where will the farmer actually earn the most?"**

That is the fundamental difference between **listing a market price** and **helping a farmer make a profitable market decision**.

---

# 24. Conclusion

Agri-Connect transforms agricultural price discovery from a passive information service into an **intelligent market decision platform**.

By combining:

**Market Prices + Logistics + Hidden Costs + Spoilage + AI Quality + Multi-Tenant Commerce**

the platform creates a practical bridge between farmers, FPOs, APMCs and enterprise buyers.

The ultimate objective is simple:

> **Help farmers make better selling decisions, reduce avoidable market and logistics losses, strengthen producer–buyer linkages, and maximize the value realized from every harvest.**

---

## Agri-Connect

**Smart India Hackathon 2026 — PS-132**

### Strengthening Market Linkages and Price Discovery for Farmers

**Core Innovation:**

### Net Profit Mandi Routing Engine

**Live Prototype:**
https://sih-teamaura-26132.onrender.com/
