import re

html_path = 'agri-connect/frontend/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'<!-- Farmer Dashboard -->(.*?)<!-- APMC Dashboard -->', re.DOTALL)

new_farmer_html = """
      <!-- Farmer Dashboard -->
      <div id="view-farmer" class="tenant-view">
        <!-- Split Hero -->
        <div class="farmer-hero">
          <div class="farmer-hero-text">
            <h2 class="farmer-display">Farmer Direct</h2>
            <p style="font-size: 1.1rem; opacity: 0.9; max-width: 400px; font-weight: 500;">Net profit calculator and direct institutional produce listings.</p>
          </div>
          <div class="farmer-hero-img"></div>
        </div>

        <!-- Stat Cards -->
        <div class="farmer-stat-grid">
          <div class="farmer-stat-card">
            <div class="farmer-stat-header"><span>Tracked APMC Mandis</span><i class="ph ph-map-pin farmer-stat-icon"></i></div>
            <div class="farmer-stat-val">8</div>
          </div>
          <div class="farmer-stat-card">
            <div class="farmer-stat-header"><span>Average Profit Premium</span><i class="ph ph-trend-up farmer-stat-icon"></i></div>
            <div class="farmer-stat-val">₹245</div>
          </div>
          <div class="farmer-stat-card">
            <div class="farmer-stat-header"><span>FPO Bulk Pooling</span><i class="ph ph-users farmer-stat-icon"></i></div>
            <div class="farmer-stat-val">3</div>
          </div>
          <div class="farmer-stat-card">
            <div class="farmer-stat-header"><span>Enterprise RFQs</span><i class="ph ph-file-text farmer-stat-icon"></i></div>
            <div class="farmer-stat-val">₹70.3 L</div>
          </div>
        </div>

        <!-- Router Panel -->
        <div class="farmer-router-section">
          <!-- Calculator Form -->
          <form id="profit-optimizer-form" class="farmer-form">
            <h3 style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--farmer-forest); margin-bottom: 24px;">Route Calculator</h3>
            <div class="farmer-form-group">
              <label class="farmer-form-label" for="opt-crop">COMMODITY</label>
              <select class="farmer-input" id="opt-crop">
                <option value="Onion">Onion</option>
                <option value="Soybean">Soybean</option>
                <option value="Wheat">Wheat</option>
                <option value="Tomato">Tomato</option>
              </select>
            </div>
            <div class="farmer-form-group">
              <label class="farmer-form-label" for="opt-origin">FARM LOCATION</label>
              <select class="farmer-input" id="opt-origin">
                <option value='{"name":"Niphad, Nashik, MH","lat":20.0110,"lng":74.0520}'>Niphad, Nashik</option>
                <option value='{"name":"Indore Outskirts, MP","lat":22.7196,"lng":75.8577}'>Indore, MP</option>
              </select>
            </div>
            <div class="farmer-form-group">
              <label class="farmer-form-label">QUANTITY (QUINTALS)</label>
              <input type="number" class="farmer-input" id="opt-quantity" value="150">
            </div>
            <button type="submit" class="farmer-btn">CALCULATE ROUTE</button>
          </form>
          
          <!-- Results Area -->
          <div>
            <h3 style="font-family: var(--font-serif); font-size: 1.25rem; color: var(--text-main); margin-bottom: 24px;">Market Routing Results</h3>
            <div id="mandi-comparison-tbody" class="farmer-results-list">
              <!-- Data injected via JS -->
              <div style="padding: 40px; text-align: center; color: var(--text-muted); border: 1px dashed var(--farmer-border); border-radius: 8px;">
                Select your parameters and calculate the route to see ranked mandi options.
              </div>
            </div>
          </div>
        </div>
      </div>

"""

new_content = pattern.sub(new_farmer_html.strip() + '\n\n      <!-- APMC Dashboard -->', content)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('index.html updated.')
