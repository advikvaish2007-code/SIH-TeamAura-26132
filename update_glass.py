import re

html_path = 'agri-connect/frontend/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# We want to replace `<div class="farmer-stat-grid"` ... up to `<!-- APMC Dashboard -->`
start_marker = '<!-- Stat Cards -->'
end_marker = '<!-- APMC Dashboard -->'

start_idx = html.find(start_marker)
end_idx = html.find(end_marker)

if start_idx != -1 and end_idx != -1:
    section_content = html[start_idx:end_idx]
    
    # We remove it from the .farmer-top-section and wrap it in .page-background
    # Wait, the structure right now is:
    # <div class="farmer-top-section">
    #   <div class="farmer-top-content">
    #     <div> Farmer Direct Title </div>
    #     <!-- Stat Cards --> ... </div>
    #   </div>
    # </div>
    # <!-- Router Panel -->
    # <div class="farmer-router-section"> ... </div>
    # </div> <!-- end view-farmer -->
    
    # Actually, we can just replace the entire view-farmer content below the Title.
    title_end = html.find('<!-- Stat Cards -->')
    
    new_html = html[:title_end] + '''
            <!-- Stat Cards & Router in Glass Panel -->
          </div>
        </div>

        <div class="page-background">
          <div class="vertical-text">FARMER DIRECT</div>
          <div class="glass-panel">
            
            <div class="farmer-stat-grid" style="background: transparent;">
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
                <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 24px;">Route Calculator</h3>
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
                <h3 style="font-family: var(--font-serif); font-size: 1.25rem; margin-bottom: 24px;">Market Routing Results</h3>
                <div id="mandi-comparison-tbody" class="farmer-results-list">
                  <!-- Data injected via JS -->
                  <div style="padding: 40px; text-align: center; border: 1px dashed rgba(255,255,255,0.3); border-radius: 8px;">
                    Select your parameters and calculate the route to see ranked mandi options.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      ''' + html[end_idx:]

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(new_html)
    print("HTML Updated.")
else:
    print("Could not find markers.")


# Update CSS
css_path = 'agri-connect/frontend/css/style.css'
with open(css_path, 'a', encoding='utf-8') as f:
    f.write("""

/* Glassmorphism Redesign */
.page-background {
  position: relative;
  background-image: url('../assets/barley-sunrise.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  overflow: hidden;
  padding: 24px;
}

.page-background::before {
  content: "";
  position: absolute;
  inset: 0;
  background: inherit;
  filter: blur(6px) brightness(0.75) saturate(1.1);
  z-index: 0;
}

.vertical-text {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  transform-origin: center right;
  font-family: var(--font-serif);
  font-size: 5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.15);
  z-index: 1;
  pointer-events: none;
  white-space: nowrap;
}

.glass-panel {
  position: relative;
  z-index: 2;
  border-radius: 20px;
  background: rgba(20, 35, 20, 0.55);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 40px;
}

.glass-panel .farmer-stat-card,
.glass-panel .farmer-form,
.glass-panel .mandi-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #F5F1E8;
  box-shadow: none;
}

.glass-panel .farmer-stat-header,
.glass-panel .farmer-form-label,
.glass-panel .mc-metric-label,
.glass-panel .farmer-input,
.glass-panel .mc-dist,
.glass-panel h3,
.glass-panel .farmer-stat-val,
.glass-panel .mc-net-profit,
.glass-panel .mc-name {
  color: #F5F1E8 !important;
}

.glass-panel .farmer-input {
  border-bottom-color: rgba(255,255,255,0.3);
}

.glass-panel .farmer-input option {
  background: #1C2321;
}
""")
print("CSS Updated.")
