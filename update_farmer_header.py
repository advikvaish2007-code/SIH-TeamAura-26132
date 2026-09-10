import re

# Update HTML
html_path = 'agri-connect/frontend/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

pattern = re.compile(r'<!-- Split Hero -->(.*?)<!-- Router Panel -->', re.DOTALL)

new_section = """<!-- Farmer Photographic Header -->
        <div class="farmer-top-section">
          <div class="farmer-top-content">
            <div style="padding: 60px 48px 20px 48px; max-width: 800px;">
              <h2 class="farmer-display" style="color: var(--text-main);">Farmer Direct</h2>
              <p style="font-size: 1.1rem; opacity: 0.9; font-weight: 500; color: var(--text-muted);">Net profit calculator and direct institutional produce listings.</p>
            </div>

            <!-- Stat Cards -->
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
          </div>
        </div>

        <!-- Router Panel -->"""

new_html = pattern.sub(new_section, html_content)
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(new_html)


# Update CSS
css_path = 'agri-connect/frontend/css/style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

# We want to replace the `.farmer-hero` and `.farmer-hero-text` etc with the new `.farmer-top-section`
css_pattern = re.compile(r'/\* Hero / Header Split \*/.*?/\* Stat Cards \*/', re.DOTALL)

new_css_section = """/* Farmer Photographic Header */
.farmer-top-section {
  position: relative;
  margin-bottom: 48px;
  overflow: hidden;
}

/* Pseudo-element for the duotone background to avoid filtering children */
.farmer-top-section::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: var(--farmer-olive);
  background-blend-mode: multiply;
  background-image: url('https://images.unsplash.com/photo-1592982537447-6f296d9b62dc?q=80&w=2070&auto=format&fit=crop');
  background-size: cover;
  background-position: center 30%;
  filter: grayscale(100%) contrast(1.1);
  z-index: 1;
}

.farmer-top-content {
  position: relative;
  z-index: 2;
  background: linear-gradient(
    180deg,
    rgba(249, 248, 244, 0.94) 0%,
    rgba(249, 248, 244, 0.88) 40%,
    rgba(249, 248, 244, 0.75) 100%
  );
}

/* Stat Cards */"""

new_css = css_pattern.sub(new_css_section, css_content)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(new_css)

print('Updated index.html and style.css for photographic header.')
