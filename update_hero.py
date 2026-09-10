import re

# Update HTML
html_path = 'agri-connect/frontend/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace everything from the top of the Farmer Dashboard content to the APMC Dashboard
start_marker = '<!-- Farmer Photographic Header -->'
if start_marker not in html:
    start_marker = '<div class="page-background">'
end_marker = '<!-- APMC Dashboard -->'

start_idx = html.find(start_marker)
end_idx = html.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_html = html[:start_idx] + '''
        <!-- Split Hero Section 1 -->
        <div class="farmer-direct-hero">
          <div class="hero-text-panel">
            <h1 class="farmer-display">Farmer Direct</h1>
            <p>Net profit calculator and direct institutional produce listings.</p>
          </div>
          <div class="hero-image-panel"></div>
        </div>

        <!-- Section 2: Reverted Stat Cards -->
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
      
      ''' + html[end_idx:]

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(new_html)
    print("HTML Updated.")
else:
    print("Could not find markers.")


# Update CSS
css_path = 'agri-connect/frontend/css/style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Remove glassmorphism styling added previously
glass_marker = '/* Glassmorphism Redesign */'
if glass_marker in css:
    css = css[:css.find(glass_marker)]

# Also remove `.farmer-top-section` if it is still there from step 2
photo_marker = '/* Farmer Photographic Header */'
if photo_marker in css:
    end_marker = '/* Stat Cards */'
    end_idx = css.find(end_marker, css.find(photo_marker))
    if end_idx != -1:
        css = css[:css.find(photo_marker)] + css[end_idx:]

# Append the new split hero styling
new_css = """
/* Split Hero Section */
.farmer-direct-hero {
  display: flex;
  min-height: 320px;
  width: 100%;
}

.hero-text-panel {
  flex: 1;
  background-color: #3d4a35;
  color: #F5F1E8;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 70px;
}

.hero-text-panel h1 {
  font-size: 3.5rem;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 16px;
  font-family: var(--font-serif);
}

.hero-text-panel p {
  font-size: 1.1rem;
  color: rgba(245, 241, 232, 0.85);
}

.hero-image-panel {
  flex: 1;
  background-image: url('../assets/crop-seedlings.jpg');
  background-size: cover;
  background-position: center;
}

@media (max-width: 900px) {
  .farmer-direct-hero {
    flex-direction: column-reverse;
  }
  .hero-image-panel {
    min-height: 300px;
  }
}
"""

css += new_css

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

print("CSS Updated.")
